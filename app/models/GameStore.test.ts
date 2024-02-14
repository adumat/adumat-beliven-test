import { GameStoreModel } from "./GameStore"

test("can be created", () => {
  const instance = GameStoreModel.create({})

  expect(instance).toBeTruthy()
})
