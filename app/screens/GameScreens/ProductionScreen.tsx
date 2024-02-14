import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { GameNavigatorParamList, GameTabsScreenProps } from "app/navigators"
import { ListSeparator, Text } from "app/components"
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native"
import { DevEmployee, EmployeeSeniority, Project, useStores } from "app/models"
import { complexityToText, seniorityToText } from "app/utils/gameFormat"
import SegmentedControl from "@react-native-segmented-control/segmented-control"

const DevEmployeeRender: ListRenderItem<DevEmployee> = observer(function DevEmployeeRender({
  item,
}) {
  return (
    <View>
      <View style={$row}>
        <Text preset="bold" text={item.name} />
        <Text preset="default" text={seniorityToText(item.seniority as EmployeeSeniority)} />
      </View>
      <Text preset="bold" text={"Working project"} />
      <Text preset="default" text={item.workingProject?.name ?? "N/A"} />
    </View>
  )
})

const ProjectRender: ListRenderItem<Project> = observer(function ProjectRender({ item }) {
  return (
    <View>
      <View style={$row}>
        <Text preset="bold" text={item.name} />
      </View>
      <View style={$row}>
        <Text preset="default" text={`${complexityToText(item.complexity)} - ${item.revenue}$`} />
        <Text preset="default" text={item.status ?? "N/A"} />
      </View>
    </View>
  )
})

interface ProductionScreenProps extends GameTabsScreenProps<"Production"> {}

export const ProductionScreen: FC<ProductionScreenProps> = observer(function ProductionScreen() {
  const {
    gameStore: {
      devEmployeesItems,
      freeDevEmployeesItems,
      projectsItems,
      pendingProjectsItems,
      assignProject,
      fireDevEmployee,
    },
  } = useStores()

  const [devSelected, setDevSelected] = useState<DevEmployee | undefined>()
  const [currentTab, setCurrentTab] = useState<number>(0)
  const navigation = useNavigation<NavigationProp<GameNavigatorParamList, "Sales">>()

  const route = useRoute<RouteProp<GameNavigatorParamList, "Production">>()
  const params = route.params

  useEffect(() => {
    switch (params.mode) {
      case "assignProject":
        setCurrentTab(0)
        break
      case "fire":
        setCurrentTab(0)
        break
      case "view":
        break
    }
  }, [params.mode])
  useFocusEffect(
    useCallback(() => {
      return () => navigation.setParams({ mode: "view" })
    }, [navigation]),
  )

  const handlePressDev = useCallback(
    (dev: DevEmployee) => {
      setDevSelected(dev)
      setCurrentTab(1)
    },
    [setDevSelected, setCurrentTab],
  )
  const handlePressProject = useCallback(
    (proj: Project) => {
      if (devSelected === undefined) {
        return
      }
      assignProject(proj, devSelected)
      setDevSelected(undefined)
      setCurrentTab(0)
      navigation.setParams({ mode: "view" })
    },
    [devSelected, assignProject, setDevSelected, setCurrentTab, navigation],
  )

  const renderDevItem = useMemo(() => {
    if (params.mode === "assignProject") {
      if (devSelected === undefined) {
        return function ListItemViewSalesEmployeeWrapper(props: ListRenderItemInfo<DevEmployee>) {
          return (
            <TouchableOpacity onPress={() => handlePressDev(props.item)}>
              <DevEmployeeRender {...props} />
            </TouchableOpacity>
          )
        }
      }
    } else if (params.mode === "fire") {
      return function ListItemFireEmployeeWrapper(props: ListRenderItemInfo<DevEmployee>) {
        return (
          <TouchableOpacity style={$root} onPress={() => fireDevEmployee(props.item)}>
            <DevEmployeeRender {...props} />
          </TouchableOpacity>
        )
      }
    }
    return function ListItemViewSalesEmployeeWrapper(props: ListRenderItemInfo<DevEmployee>) {
      return <DevEmployeeRender {...props} />
    }
  }, [params.mode, devSelected, setDevSelected])

  const renderProjectItem = useMemo(() => {
    if (params.mode === "assignProject") {
      if (devSelected !== undefined) {
        return function ListItemViewSalesEmployeeWrapper(props: ListRenderItemInfo<Project>) {
          return (
            <TouchableOpacity onPress={() => handlePressProject(props.item)}>
              <ProjectRender {...props} />
            </TouchableOpacity>
          )
        }
      }
    }
    return function ListItemViewSalesEmployeeWrapper(props: ListRenderItemInfo<Project>) {
      return <ProjectRender {...props} />
    }
  }, [params.mode, devSelected, setDevSelected])

  return (
    // screen component was used by navigator!
    <View style={$root}>
      <Text preset="heading" text="Production" />
      <SegmentedControl
        values={["Devs", "Projects"]}
        selectedIndex={currentTab}
        onChange={(e) => setCurrentTab(e.nativeEvent.selectedSegmentIndex)}
        enabled={params.mode === "view"}
      />
      {params.mode === "fire" && <Text preset="subheading" text="Tap to fire" />}
      {params.mode === "assignProject" && devSelected === undefined && (
        <Text preset="subheading" text="Choose dev" />
      )}
      {params.mode === "assignProject" && devSelected !== undefined && (
        <Text preset="subheading" text="Choose project to assign" />
      )}
      {currentTab === 0 && (
        <FlatList
          data={params.mode === "assignProject" ? freeDevEmployeesItems : devEmployeesItems}
          renderItem={renderDevItem}
          ItemSeparatorComponent={ListSeparator}
        />
      )}
      {currentTab === 1 && (
        <FlatList
          data={devSelected ? pendingProjectsItems : projectsItems}
          renderItem={renderProjectItem}
          ItemSeparatorComponent={ListSeparator}
        />
      )}
    </View>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
const $row: ViewStyle = { flexDirection: "row", justifyContent: "space-between" }
