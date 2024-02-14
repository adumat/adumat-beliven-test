import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { spacing } from "app/theme"
import { LeaderBoard } from "./LeaderBoard"

interface StartNewGameScreenProps extends AppStackScreenProps<"StartNewGame"> {}

export const StartNewGameScreen: FC<StartNewGameScreenProps> = observer(
  function StartNewGameScreen() {
    const {
      gameStore: { startNewGame },
    } = useStores()

    return (
      <Screen
        safeAreaEdges={["top", "bottom", "left", "right"]}
        style={$root}
        preset="fixed"
        contentContainerStyle={$fillAllSpace}
      >
        <View style={$upperContainer}>
          <Text preset="heading" text="Welcome to the game" />
          <Text preset="subheading" text="Press start to begin a new game" />
        </View>
        <View style={$leaderBoardContainer}>
          <Text preset="bold" text="LEADERBOARD" />
          <LeaderBoard />
        </View>
        <View style={$footerContainer}>
          <Button preset="reversed" text="START" onPress={startNewGame} />
        </View>
      </Screen>
    )
  },
)

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
const $leaderBoardContainer: ViewStyle = {
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
