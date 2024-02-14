import { colors, spacing } from "app/theme"
import React, { View, ViewStyle } from "react-native"

export const ListSeparator = () => <View style={$separator} />

const $separator: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.xs,
  marginVertical: spacing.xs,
  borderBottomColor: colors.border,
  borderBottomWidth: 1,
}
