export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
  LEADER_BOARD_LENGTH: number
  TICK_INTERVAL: number
  INITIAL_BALANCE: number
  EMPLOYEE_SPAWN_RATIO: number
  EMPLOYEE_EXPIRE_RATIO: number
  PROJECT_SPAWN_RATIO: number
  PROJECT_EXPIRE_RATIO: number
  PROJECT_DURATION_RATIO: number
  MAX_PROJECT_COMPLEXITY: number
  MIN_PROJECT_REVENUE: number
  MAX_PROJECT_REVENUE: number
  MAX_PROJECT_TICK_BEFORE_EXPIRE: number
  EMPLOYEE_SALARY_PAY_EVERY_AMOUNT_TICK: number
  SALES_SALARY_RATIO: number
  DEV_SALARY_RATIO: number
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "never",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["StartNewGame", "EndGameSummary"],

  // items length of leader board on welcome screen
  LEADER_BOARD_LENGTH: 5,

  TICK_INTERVAL: 500,
  INITIAL_BALANCE: 5000,
  EMPLOYEE_SPAWN_RATIO: 5,
  EMPLOYEE_EXPIRE_RATIO: 30,
  PROJECT_SPAWN_RATIO: 60,
  PROJECT_EXPIRE_RATIO: 60,
  PROJECT_DURATION_RATIO: 30,
  MAX_PROJECT_COMPLEXITY: 10,

  // this value will be multiplier by seniority, meaning that the random intervali is from `MIN_PROJECT_REVENUE * SENIORITY` to `MAX_PROJECT_REVENUE`
  MIN_PROJECT_REVENUE: 200,
  MAX_PROJECT_REVENUE: 2000,
  MAX_PROJECT_TICK_BEFORE_EXPIRE: 60,

  // this amount is multiplier by seniority and scaled every EMPLOYEE_SALARY_PAY_EVERY_AMOUNT_TICK
  SALES_SALARY_RATIO: 4,
  DEV_SALARY_RATIO: 3,
  EMPLOYEE_SALARY_PAY_EVERY_AMOUNT_TICK: 1,
}

export default BaseConfig
