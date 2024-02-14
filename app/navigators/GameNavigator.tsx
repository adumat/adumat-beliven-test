import React, { useCallback } from "react"
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
  BottomTabHeaderProps,
} from "@react-navigation/bottom-tabs"
import { TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing, typography } from "app/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon, Text, Screen } from "app/components"
import * as GameScreens from "app/screens/GameScreens"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { TouchableOpacity } from "react-native-gesture-handler"

export type GameNavigatorParamList = {
  Production: { mode: "view" | "assignProject" | "fire" }
  Sales: { mode: "view" | "fire" }
  Hr: { mode: "view" | "hire" }
}

const Tab = createBottomTabNavigator<GameNavigatorParamList>()
export type GameTabsScreenProps<T extends keyof GameNavigatorParamList> = BottomTabScreenProps<
  GameNavigatorParamList,
  T
>

export const GameHeader = observer(function GameHeader({
  route,
  navigation,
}: BottomTabHeaderProps) {
  const {
    gameStore: { balance, secondsElapsed, togglePause },
  } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()
  const handleMenuPressOnProduction = useCallback(() => {
    const options = ["Assign project", "Fire", "Pause", "Cancel"]
    const destructiveButtonIndex = 1
    const cancelButtonIndex = 3

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            navigation.setParams({
              mode: "assignProject",
            })
            break

          case destructiveButtonIndex:
            navigation.setParams({
              mode: "fire",
            })
            break
          case 2:
            togglePause()
            break
          case cancelButtonIndex:
          // Canceled
        }
      },
    )
  }, [navigation])
  const handleMenuPressOnSales = useCallback(() => {
    const options = ["Fire", "Pause", "Cancel"]
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 2

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            navigation.setParams({
              mode: "fire",
            })
            break
          case 1:
            togglePause()
            break
          case cancelButtonIndex:
          // Canceled
        }
      },
    )
  }, [navigation])
  const handleMenuPressOnHr = useCallback(() => {
    const options = ["Hire", "Pause", "Cancel"]
    const cancelButtonIndex = 2

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 0:
            navigation.setParams({
              mode: "hire",
            })
            break
          case 1:
            togglePause()
            break
          case cancelButtonIndex:
          // Canceled
        }
      },
    )
  }, [navigation])
  const onPress = () => {
    switch (route.name) {
      case "Production":
        handleMenuPressOnProduction()
        break
      case "Sales":
        handleMenuPressOnSales()
        break
      case "Hr":
        handleMenuPressOnHr()
        break
    }
  }
  return (
    <View style={$flexInRow}>
      <TouchableOpacity onPress={onPress}>
        <Icon icon="menu" />
      </TouchableOpacity>
      <View style={$gameSummary}>
        <Text text={balance + " $"} />
        <Text text={secondsElapsed + " s"} />
      </View>
    </View>
  )
})
export const GameNavigator = observer(function GameNavigator() {
  const { bottom } = useSafeAreaInsets()
  return (
    <Screen safeAreaEdges={["top", "left", "right"]} contentContainerStyle={$root} preset="fixed">
      <Tab.Navigator
        screenOptions={{
          header: (props) => <GameHeader {...props} />,
          tabBarHideOnKeyboard: true,
          tabBarStyle: [$tabBar, { height: bottom + 70 }],
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text,
          tabBarLabelStyle: $tabBarLabel,
          tabBarItemStyle: $tabBarItem,
        }}
      >
        <Tab.Screen
          name="Production"
          component={GameScreens.ProductionScreen}
          initialParams={{
            mode: "view",
          }}
          options={{
            tabBarLabel: "Production",
            tabBarIcon: ({ focused }) => (
              <Icon icon="ladybug" color={focused ? colors.tint : colors.textDim} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="Sales"
          component={GameScreens.SalesScreen}
          initialParams={{
            mode: "view",
          }}
          options={{
            tabBarLabel: "Sales",
            tabBarIcon: ({ focused }) => (
              <Icon icon="sales" color={focused ? colors.tint : colors.textDim} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="Hr"
          component={GameScreens.HrScreen}
          initialParams={{
            mode: "view",
          }}
          options={{
            tabBarLabel: "HR",
            tabBarIcon: ({ focused }) => (
              <Icon icon="community" color={focused ? colors.tint : undefined} size={30} />
            ),
          }}
        />
      </Tab.Navigator>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.xs,
}

const $flexInRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignContent: "center",
  marginHorizontal: spacing.sm,
}
const $gameSummary: ViewStyle = {
  alignItems: "flex-end",
}

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
}
