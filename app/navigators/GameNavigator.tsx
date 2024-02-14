import React, { useCallback } from "react"
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
  BottomTabHeaderProps,
  BottomTabNavigationProp,
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
import { RouteProp } from "@react-navigation/native"

export const BOTTOM_TAB_BAR_HEIGHT = 70

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

const HAMBURGER_MENU_ITEMS: {
  text: string
  destructive?: boolean
  show?: (params: { route: RouteProp<GameNavigatorParamList> }) => boolean
  onTap?: (params: {
    navigation: BottomTabNavigationProp<GameNavigatorParamList>
    route: RouteProp<GameNavigatorParamList>
    togglePause: () => void
  }) => void
}[] = [
  {
    text: "Undo Assign",
    show: ({ route }) => route.name === "Production" && route.params.mode === "assignProject",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "view",
      })
    },
  },
  {
    text: "Undo Fire",
    show: ({ route }) => route.name !== "Hr" && route.params.mode === "fire",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "view",
      })
    },
  },
  {
    text: "Undo Hire",
    show: ({ route }) => route.name === "Hr" && route.params.mode === "hire",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "view",
      })
    },
  },
  {
    text: "Assign project",
    show: ({ route }) => route.name === "Production" && route.params.mode !== "assignProject",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "assignProject",
      })
    },
  },
  {
    text: "Fire",
    show: ({ route }) => route.name !== "Hr" && route.params.mode !== "fire",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "fire",
      })
    },
    destructive: true,
  },
  {
    text: "Hire",
    show: ({ route }) => route.name === "Hr" && route.params.mode !== "hire",
    onTap: ({ navigation }) => {
      navigation.setParams({
        mode: "hire",
      })
    },
  },
  {
    text: "Pause",
    onTap: ({ togglePause }) => togglePause(),
  },
]

export const GameHeader = observer(function GameHeader({
  route,
  navigation,
}: BottomTabHeaderProps) {
  const {
    gameStore: { balance, secondsElapsed, togglePause },
  } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()
  const handleMenuPress = useCallback(() => {
    const options = HAMBURGER_MENU_ITEMS.filter(
      (item) =>
        item.show?.({
          route: route as RouteProp<GameNavigatorParamList>,
        }) ?? true,
    ).concat([
      {
        text: "Close menu",
      },
    ])
    showActionSheetWithOptions(
      {
        options: options.map((i) => i.text),
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: options.map((_, i) => i).filter((idx) => options[idx].destructive),
      },
      (selectedIndex?: number) => {
        if (selectedIndex !== undefined) {
          options[selectedIndex]?.onTap?.({
            navigation: navigation as BottomTabNavigationProp<GameNavigatorParamList>,
            route: route as RouteProp<GameNavigatorParamList>,
            togglePause,
          })
        }
      },
    )
  }, [navigation, route, togglePause])
  return (
    <View style={$flexInRow}>
      <TouchableOpacity onPress={handleMenuPress}>
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
          tabBarStyle: [$tabBar, { height: bottom + BOTTOM_TAB_BAR_HEIGHT }],
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
