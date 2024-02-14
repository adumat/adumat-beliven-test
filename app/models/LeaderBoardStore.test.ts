import { LeaderBoardStoreModel } from "./LeaderBoardStore"

test("can be created", () => {
  const instance = LeaderBoardStoreModel.create({})

  expect(instance).toBeTruthy()
})
