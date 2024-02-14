import React, { FC, useCallback, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItem, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { GameNavigatorParamList, GameTabsScreenProps } from "app/navigators"
import { ListSeparator, Text } from "app/components"
import { EmployeeSeniority, SalesEmployee, useStores } from "app/models"
import { seniorityToText } from "app/utils/gameFormat"
import {
  RouteProp,
  useFocusEffect,
  useRoute,
  NavigationProp,
  useNavigation,
} from "@react-navigation/native"
import { TouchableOpacity } from "react-native-gesture-handler"

const SalesEmployeeRender: ListRenderItem<SalesEmployee> = observer(function SalesEmployeeRender({
  item,
}) {
  return (
    <View>
      <View style={$row}>
        <Text preset="bold" text={item.name} />
        <Text preset="default" text={seniorityToText(item.seniority as EmployeeSeniority)} />
      </View>
      <Text preset="bold" text={"Last project"} />
      <Text preset="default" text={item.lastProjectSpawned ?? "N/A"} />
    </View>
  )
})

interface SalesScreenProps extends GameTabsScreenProps<"Sales"> {}

export const SalesScreen: FC<SalesScreenProps> = observer(function SalesScreen() {
  const {
    gameStore: { salesEmployeesItems, fireSalesEmployee },
  } = useStores()

  const route = useRoute<RouteProp<GameNavigatorParamList, "Sales">>()
  const params = route.params

  const renderItem = useMemo(() => {
    if (params.mode === "view") {
      return function ListItemViewSalesEmployeeWrapper(props: ListRenderItemInfo<SalesEmployee>) {
        return <SalesEmployeeRender {...props} />
      }
    } else {
      return function ListItemFireEmployeeWrapper(props: ListRenderItemInfo<SalesEmployee>) {
        return (
          <TouchableOpacity style={$root} onPress={() => fireSalesEmployee(props.item)}>
            <SalesEmployeeRender {...props} />
          </TouchableOpacity>
        )
      }
    }
  }, [params.mode])

  const navigation = useNavigation<NavigationProp<GameNavigatorParamList, "Sales">>()
  useFocusEffect(
    useCallback(() => {
      return () => navigation.setParams({ mode: "view" })
    }, [navigation]),
  )
  return (
    // screen component was used by navigator!
    <View style={$root}>
      <Text preset="heading" text="List of Sales Employee" />
      {params.mode === "fire" && <Text preset="subheading" text="Tap to fire" />}
      <FlatList
        data={salesEmployeesItems}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
      />
    </View>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
const $row: ViewStyle = { flexDirection: "row" }
