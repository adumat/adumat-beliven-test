import React, { FC } from "react"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { ListSeparator, Text } from "app/components"
import { TextStyle, View, ViewStyle } from "react-native"
import { format } from "date-fns"
import { FlatList } from "react-native-gesture-handler"
interface LeaderBoardProps {}
export const LeaderBoard: FC<LeaderBoardProps> = observer(function LeaderBoard(_props) {
  const {
    leaderBoardStore: { leaderBoardItems },
  } = useStores()
  return (
    <FlatList
      style={$root}
      data={leaderBoardItems}
      ListEmptyComponent={<Text text="No game played yet" />}
      renderItem={({ item }) => (
        <View style={$leaderBoardRecord}>
          <Text style={$date} text={format(item.date, "PP")} />
          <Text style={$name} text={item.by} />
          <Text style={$duration} text={item.duration + "s"} />
        </View>
      )}
      ItemSeparatorComponent={ListSeparator}
    />
  )
})

const $root: ViewStyle = {
  flex: 1,
  alignSelf: "stretch",
}
const $leaderBoardRecord: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}
const $date: TextStyle = {
  // flexGrow: 1,
}
const $name: TextStyle = {
  // flexGrow: 1,
}
const $duration: TextStyle = {
  // flexGrow: 1,
}
