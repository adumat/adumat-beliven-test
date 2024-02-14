import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import Config from "app/config"
import { minBy } from "lodash"

interface LeaderBoardItem {
  date: number
  duration: number
  by: string
}

/**
 * Model description here for TypeScript hints.
 */
export const LeaderBoardStoreModel = types
  .model("LeaderBoardStore")
  .props({
    records: types.array(types.frozen<LeaderBoardItem>()),
  })
  .views((self) => ({
    get leaderBoardItems(): LeaderBoardItem[] {
      return self.records
    },
    get lowerDuration(): number {
      return minBy(self.records, "score")?.duration ?? 0
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addRecord(duration: number, by: string) {
      if (self.records.length < Config.LEADER_BOARD_LENGTH || duration > self.lowerDuration) {
        self.records.push({
          duration,
          by,
          date: +new Date(),
        })
        self.records = cast(self.records.slice().sort((a, b) => b.duration - a.duration))
        if (self.records.length > Config.LEADER_BOARD_LENGTH) {
          self.records.remove(self.records[self.records.length - 1])
        }
      }
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface LeaderBoardStore extends Instance<typeof LeaderBoardStoreModel> {}
export interface LeaderBoardStoreSnapshotOut extends SnapshotOut<typeof LeaderBoardStoreModel> {}
export interface LeaderBoardStoreSnapshotIn extends SnapshotIn<typeof LeaderBoardStoreModel> {}
export const createLeaderBoardStoreDefaultModel = () => types.optional(LeaderBoardStoreModel, {})
