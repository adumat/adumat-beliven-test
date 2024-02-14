import React, { FC, useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"

interface EndGameSummaryScreenProps extends AppStackScreenProps<"EndGameSummary"> {}

export const EndGameSummaryScreen: FC<EndGameSummaryScreenProps> = observer(
  function EndGameSummaryScreen() {
    const {
      gameStore: { resetGame, onEndGamePress },
    } = useStores()
    const [name, setName] = useState<string>(__DEV__ ? "Teo" : "")
    const handleGoHomePress = useCallback(() => {
      if (name !== "") {
        onEndGamePress(name)
      } else {
        resetGame()
      }
    }, [])
    return (
      <Screen
        safeAreaEdges={["top", "bottom", "left", "right"]}
        style={$root}
        preset="fixed"
        contentContainerStyle={$fillAllSpace}
      >
        <View style={$upperContainer}>
          <Text preset="heading" text="GAME OVER" />
        </View>
        <View style={$nameContainer}>
          <TextField
            label="Write your name to save the score"
            placeholder="Alfredo Megiasso"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>
        <View style={$footerContainer}>
          <Button preset="reversed" text="GO HOME" onPress={handleGoHomePress} />
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
const $nameContainer: ViewStyle = {
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
