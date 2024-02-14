import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { spacing } from "app/theme"
import { useStores } from "app/models"

interface GamePausedScreenProps extends AppStackScreenProps<"GamePaused"> {}

export const GamePausedScreen: FC<GamePausedScreenProps> = observer(function GamePausedScreen() {
  const {
    gameStore: { resetGame, togglePause },
  } = useStores()
  return (
    <Screen
      safeAreaEdges={["top", "bottom", "left", "right"]}
      style={$root}
      preset="fixed"
      contentContainerStyle={$fillAllSpace}
    >
      <View style={$upperContainer}>
        <Text preset="heading" text="GAME PAUSED" />
      </View>
      <View style={$footerContainer}>
        <Button style={$bottomMargin} preset="reversed" text="RESUME" onPress={togglePause} />
        <Button text="ABORT" onPress={resetGame} />
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.xs,
}
const $fillAllSpace: ViewStyle = {
  flex: 1,
}
const $upperContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}
const $footerContainer: ViewStyle = {
  flex: 1,
  justifyContent: "flex-end",
  alignItems: "stretch",
  marginHorizontal: spacing.xl,
}
const $bottomMargin: ViewStyle = {
  marginBottom: spacing.sm,
}
