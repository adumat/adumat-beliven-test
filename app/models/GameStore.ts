import { Instance, SnapshotIn, SnapshotOut, addDisposer, cast, types } from "mobx-state-tree"
import { getRootStore } from "./helpers/getRootStore"
import Config from "app/config"
import { autorun, toJS } from "mobx"
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
  countries,
  names,
} from "unique-names-generator"
import { random } from "lodash"
import Toast from "react-native-root-toast"
import { BOTTOM_TAB_BAR_HEIGHT } from "app/navigators"

const DELTA_TICK = 5
const DELTA_POSITION_TOAST = BOTTOM_TAB_BAR_HEIGHT * -1

export enum GAME_STATE {
  "WAITING_START" = "WAITING_START",
  "GAME_PAUSED" = "GAME_PAUSED",
  "GAME_IN_PROGRESS" = "GAME_IN_PROGRESS",
  "GAME_END" = "GAME_END",
}
export enum ProjectStatus {
  "PENDING" = "PENDING",
  "WORKING" = "WORKING",
}
export type EmployeeSeniority = 1 | 2 | 3
export type ProjectDifficulty = 1 | 2 | 3

export interface ICandidate {
  name: string
  seniority: EmployeeSeniority
  type: "dev" | "sales"
  tickExpire: number
}

const ProjectModel = types
  .model("Project")
  .props({
    name: types.identifier,
    complexity: types.number,
    revenue: types.number,
    status: types.optional(
      types.enumeration<ProjectStatus>("ProjectStatus", Object.values(ProjectStatus)),
      ProjectStatus.PENDING,
    ),
    tickExpire: types.number,
    tickEndProject: types.maybe(types.number),
  })
  .views((self) => ({
    get statusToInt() {
      return self.status === ProjectStatus.WORKING ? 0 : 1
    },
  }))
export interface Project extends Instance<typeof ProjectModel> {}
const DevEmployeeModel = types
  .model("DevEmployee")
  .props({
    name: types.identifier,
    seniority: types.number,
    tickEntry: types.number,
    workingProject: types.maybe(types.safeReference(ProjectModel)),
  })
  .views((self) => ({
    get statusToInt() {
      return self.workingProject !== undefined ? 0 : 1
    },
  }))
export interface DevEmployee extends Instance<typeof DevEmployeeModel> {}
const SalesEmployeeModel = types.model("SalesEmployee").props({
  name: types.identifier,
  lastProjectSpawned: types.maybe(types.string),
  seniority: types.number,
  tickEntry: types.number,
})
export interface SalesEmployee extends Instance<typeof SalesEmployeeModel> {}

function projectSort(a: Project, b: Project) {
  if (a.statusToInt !== b.statusToInt) {
    return b.statusToInt - a.statusToInt
  }
  return a.name.localeCompare(b.name)
}
function devSort(a: DevEmployee, b: DevEmployee) {
  if (a.statusToInt !== b.statusToInt) {
    return b.statusToInt - a.statusToInt
  }
  return a.name.localeCompare(b.name)
}

/**
 * Model description here for TypeScript hints.
 */
export const GameStoreModel = types
  .model("GameStore")
  .props({
    gameState: types.optional(
      types.enumeration<GAME_STATE>("GameState", Object.values(GAME_STATE)),
      GAME_STATE.WAITING_START,
    ),
    gameStartedAt: types.maybe(types.Date),
    gameFinishedAt: types.maybe(types.Date),
    balance: types.optional(types.number, 0),
    secondsElapsed: types.optional(types.number, 0),
    devEmployees: types.optional(types.array(DevEmployeeModel), []),
    salesEmployees: types.optional(types.array(SalesEmployeeModel), []),
    projects: types.optional(types.array(ProjectModel), []),
    candidates: types.optional(types.array(types.frozen<ICandidate>()), []),
  })
  .views((self) => ({
    get isGameInProgress() {
      return self.gameState === "GAME_IN_PROGRESS"
    },
    get candidatesItems(): ICandidate[] {
      return toJS(self.candidates)
    },
    get salesEmployeesItems(): SalesEmployee[] {
      return toJS(self.salesEmployees)
    },
    get devEmployeesItems(): DevEmployee[] {
      return toJS(self.devEmployees)
    },
    get freeDevEmployeesItems(): DevEmployee[] {
      return toJS(self.devEmployees.filter((p) => p.workingProject === undefined))
    },
    get projectsItems(): Project[] {
      return toJS(self.projects)
    },
    get pendingProjectsItems(): Project[] {
      return toJS(self.projects.filter((p) => p.status === ProjectStatus.PENDING))
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    _spawnCandidate(type: "dev" | "sales" = random(0, 1, false) === 1 ? "dev" : "sales") {
      const candidate = {
        name: uniqueNamesGenerator({
          length: 2,
          separator: " ",
          dictionaries: [names, animals, colors, adjectives],
        }),
        seniority: random(1, 3, false) as EmployeeSeniority,
        type,
        tickExpire:
          self.secondsElapsed +
          random(Config.CANDIDATE_EXPIRE_RATIO / 2, Config.CANDIDATE_EXPIRE_RATIO, false),
      }
      self.candidates.push(candidate)
      return candidate
    },
    _spawnProject(seniority: number) {
      const project = ProjectModel.create({
        name: uniqueNamesGenerator({
          length: 3,
          separator: " ",
          dictionaries: [names, animals, countries, colors, adjectives],
        }),
        tickExpire: self.secondsElapsed + Config.PROJECT_EXPIRE_RATIO,
        complexity: random(1, Config.MAX_PROJECT_COMPLEXITY, false),
        revenue: random(Config.MIN_PROJECT_REVENUE * seniority, Config.MAX_PROJECT_REVENUE, false),
      })
      self.projects.push(project)
      self.projects = cast(self.projects.slice().sort(projectSort))
      return project
    },
    hireCandidate(candidate: ICandidate) {
      self.candidates = cast(self.candidates.filter((c) => c !== candidate))
      if (candidate.type === "dev") {
        self.devEmployees.push({
          name: candidate.name,
          seniority: candidate.seniority,
          tickEntry: self.secondsElapsed,
        })
        // @ts-expect-error safeReference of dev employee is not resolved properly by cast
        self.devEmployees = cast(self.devEmployees.slice().sort(devSort))
      } else {
        self.salesEmployees.push({
          name: candidate.name,
          seniority: candidate.seniority,
          tickEntry: self.secondsElapsed,
        })
      }
      // prevent show toast on very beginning of the game
      if (self.gameState === GAME_STATE.GAME_IN_PROGRESS) {
        Toast.show("HIRED 🙆‍♂️", { position: Toast.positions.BOTTOM + DELTA_POSITION_TOAST })
      }
    },
    fireDevEmployee(employee: DevEmployee) {
      // i need to do this to recover the mst object (because of toJS on views)
      const mstEmployee = self.devEmployees.find((e) => e.name === employee.name)
      if (mstEmployee) {
        let projectUnassigned = false
        if (mstEmployee.workingProject) {
          projectUnassigned = true
          mstEmployee.workingProject.status = ProjectStatus.PENDING
          mstEmployee.workingProject.tickEndProject = undefined
          mstEmployee.workingProject.tickExpire = self.secondsElapsed + Config.PROJECT_EXPIRE_RATIO
        }
        self.devEmployees.remove(mstEmployee)
        Toast.show(`BOOM 💥${projectUnassigned ? " (project unassigned)" : ""}`, {
          position: Toast.positions.BOTTOM + DELTA_POSITION_TOAST,
        })
      }
    },
    fireSalesEmployee(employee: SalesEmployee) {
      // i need to do this to recover the mst object (because of toJS on views)
      const mstEmployee = self.salesEmployees.find((e) => e.name === employee.name)
      if (mstEmployee) {
        self.salesEmployees.remove(mstEmployee)
        Toast.show("BOOM 💥", { position: Toast.positions.BOTTOM + DELTA_POSITION_TOAST })
      }
    },
    resetGame: () => {
      self.gameState = GAME_STATE.WAITING_START
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    _handleTick: () => {
      self.secondsElapsed++

      // sales project spawn and salary payment
      for (const salesEmployee of self.salesEmployees) {
        const t = self.secondsElapsed - salesEmployee.tickEntry
        if (t % (Config.PROJECT_SPAWN_RATIO / salesEmployee.seniority) === 0) {
          salesEmployee.lastProjectSpawned = self._spawnProject(salesEmployee.seniority).name
        }
        if (t % Config.EMPLOYEE_SALARY_PAY_EVERY_AMOUNT_TICK === 0) {
          self.balance -= Config.SALES_SALARY_RATIO * salesEmployee.seniority
        }
      }

      // dev salary payment and project done check
      for (const devEmployee of self.devEmployees) {
        const t = self.secondsElapsed - devEmployee.tickEntry
        if (t % Config.EMPLOYEE_SALARY_PAY_EVERY_AMOUNT_TICK === 0) {
          self.balance -= Config.DEV_SALARY_RATIO * devEmployee.seniority
        }
        if (
          devEmployee.workingProject &&
          devEmployee.workingProject.tickEndProject &&
          devEmployee.workingProject.tickEndProject < self.secondsElapsed
        ) {
          // project done
          self.balance += devEmployee.workingProject.revenue
          self.projects.remove(devEmployee.workingProject)
          devEmployee.workingProject = undefined
        }
      }

      // spawn a candidate
      if (self.secondsElapsed % Config.CANDIDATE_SPAWN_RATIO === 0) {
        self._spawnCandidate()
      }

      // clean up expired candidates
      self.candidates = cast(self.candidates.filter((c) => c.tickExpire >= self.secondsElapsed))
      // clean up expired projects (completed and expired)
      self.projects = cast(
        self.projects.filter(
          (p) =>
            (p.status === ProjectStatus.PENDING && p.tickExpire >= self.secondsElapsed) ||
            (p.status === ProjectStatus.WORKING && (p.tickEndProject ?? 0) >= self.secondsElapsed),
        ),
      )

      // check if balance is negative and the game was lost
      if (self.balance < 0) {
        self.gameState = GAME_STATE.GAME_END
      }
    },
  }))
  .actions((self) => ({
    startNewGame: () => {
      self.balance = Config.INITIAL_BALANCE
      self.gameStartedAt = new Date()
      self.secondsElapsed = 0
      self.devEmployees.clear()
      self.salesEmployees.clear()
      self.projects.clear()
      self.candidates.clear()
      self.hireCandidate(self._spawnCandidate("dev"))
      self.hireCandidate(self._spawnCandidate("sales"))
      self._spawnCandidate()
      self.gameState = GAME_STATE.GAME_IN_PROGRESS
    },
    assignProject(project: Project, dev: DevEmployee) {
      const mstProj = self.projects.find((p) => p.name === project.name)
      const mstDev = self.devEmployees.find((d) => d.name === dev.name)
      if (
        !mstProj ||
        !mstDev ||
        mstProj.status !== ProjectStatus.PENDING ||
        mstProj.tickExpire + DELTA_TICK < self.secondsElapsed
      ) {
        console.log(mstProj, mstDev, self.secondsElapsed)
        throw new Error("project or dev invalid")
      }
      mstDev.workingProject = mstProj
      mstProj.tickEndProject =
        self.secondsElapsed +
        Math.round((mstProj.complexity / mstDev.seniority) * Config.PROJECT_DURATION_RATIO)
      mstProj.status = ProjectStatus.WORKING
      self.projects = cast(self.projects.slice().sort(projectSort))
      // @ts-expect-error safeReference of dev employee is not resolved properly by cast
      self.devEmployees = cast(self.devEmployees.slice().sort(devSort))
      Toast.show("Project assigned 🏋️", { position: Toast.positions.BOTTOM + DELTA_POSITION_TOAST })
    },
    togglePause() {
      if (self.gameState === GAME_STATE.GAME_IN_PROGRESS) {
        self.gameState = GAME_STATE.GAME_PAUSED
      } else if (self.gameState === GAME_STATE.GAME_PAUSED) {
        self.gameState = GAME_STATE.GAME_IN_PROGRESS
      } // do nothing in other cases
    },
    onEndGamePress: (by: string) => {
      getRootStore(self).leaderBoardStore.addRecord(self.secondsElapsed, by)
      self.resetGame()
    },
    afterCreate() {
      let intervalId: NodeJS.Timeout
      const ticker = autorun(() => {
        if (self.gameState === GAME_STATE.GAME_IN_PROGRESS) {
          intervalId = setInterval(self._handleTick, Config.TICK_INTERVAL)
        } else {
          clearInterval(intervalId)
        }
      }, {})
      addDisposer(self, ticker)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface GameStore extends Instance<typeof GameStoreModel> {}
export interface GameStoreSnapshotOut extends SnapshotOut<typeof GameStoreModel> {}
export interface GameStoreSnapshotIn extends SnapshotIn<typeof GameStoreModel> {}
export const createGameStoreDefaultModel = () => types.optional(GameStoreModel, {})
