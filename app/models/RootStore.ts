import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { LeaderBoardStoreModel } from "./LeaderBoardStore"
import { GameStoreModel } from "./GameStore"

export const STORE_CURRENT_VERSION = 1

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  leaderBoardStore: types.optional(LeaderBoardStoreModel, {} as any),
  gameStore: types.optional(GameStoreModel, {}),
  version: types.optional(types.number, STORE_CURRENT_VERSION),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
