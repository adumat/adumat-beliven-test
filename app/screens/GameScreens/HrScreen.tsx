import React, { FC, useCallback, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { FlatList, ListRenderItem, ListRenderItemInfo, View, ViewStyle } from "react-native"
import { GameNavigatorParamList, GameTabsScreenProps } from "app/navigators"
import { ListSeparator, Text } from "app/components"
import { ICandidate, useStores } from "app/models"
import { seniorityToText } from "app/utils/gameFormat"
import { TouchableOpacity } from "react-native-gesture-handler"
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native"

interface HrScreenProps extends GameTabsScreenProps<"Hr"> {}

const CandidateRender: ListRenderItem<ICandidate> = observer(function CandidateRender({ item }) {
  return (
    <View>
      <Text preset="bold" text={item.name} />
      <View style={$subtitleInRow}>
        <Text preset="tag" text={item.type} />
        <Text preset="default" text={seniorityToText(item.seniority)} />
      </View>
    </View>
  )
})

export const HrScreen: FC<HrScreenProps> = observer(function HrScreen() {
  // Pull in one of our MST stores
  const {
    gameStore: { candidatesItems, hireCandidate },
  } = useStores()
  const route = useRoute<RouteProp<GameNavigatorParamList, "Hr">>()
  const params = route.params

  const renderItem = useMemo(() => {
    if (params.mode === "view") {
      return function ListItemViewCandidateWrapper(props: ListRenderItemInfo<ICandidate>) {
        return <CandidateRender {...props} />
      }
    } else {
      return function ListItemHireCandidateWrapper(props: ListRenderItemInfo<ICandidate>) {
        return (
          <TouchableOpacity style={$root} onPress={() => hireCandidate(props.item)}>
            <CandidateRender {...props} />
          </TouchableOpacity>
        )
      }
    }
  }, [params.mode])

  const navigation = useNavigation<NavigationProp<GameNavigatorParamList, "Hr">>()
  useFocusEffect(
    useCallback(() => {
      return () => navigation.setParams({ mode: "view" })
    }, [navigation]),
  )
  return (
    // screen component was used by navigator!
    <View style={$root}>
      <Text preset="heading" text="List of Applicants" />
      {params.mode === "hire" && <Text preset="subheading" text="Tap to hire one" />}
      <FlatList
        data={candidatesItems}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
      />
    </View>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
const $subtitleInRow: ViewStyle = {
  flex: 1,
  flexDirection: "row",
}
