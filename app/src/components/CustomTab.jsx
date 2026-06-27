import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../constants/themes";
import useTabNavigation from "../hooks/useTabNavigation";

const CustomTab = ({
  state,
  descriptors,
  navigation,
  activeBackgroundColor,
  activeTintColor,
  inactiveBackgroundColor,
  inactiveTintColor,indexTitle, setIndexTitle
}) => {
   const { selectTab } = useTabNavigation()
  const { routes } = state;
  useEffect(() => {
    selectTab(state.index);
    setIndexTitle(state.index)
  },[state.index]);
  return (
    <View style={{ height: 50 }}>
      <Grid style={{ height: 50 }}>
        <Row style={{ height: 50, backgroundColor: COLORS.default }}>
          {routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const tintColor = isFocused ? activeTintColor : inactiveTintColor;
            const backgroundColor = isFocused
              ? activeBackgroundColor
              : inactiveBackgroundColor;

            const onPress = () => {
              navigation.navigate(route.name);
            };
            return (
              <Col key={label}>
                <TouchableOpacity
                  style={{
                    backgroundColor: backgroundColor,
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottomWidth: isFocused ? 2 : 0,
                    borderBottomColor: COLORS.orange,
                    opacity: isFocused ? 0.99 : 0.5
                  }}
                  onPress={onPress}
                  onFocus={setIndexTitle(100)}
                >
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: isFocused ? 18 : 15,
                      color: isFocused ? COLORS.white : tintColor,
                      fontWeight: isFocused ? 'bold' : 'normal',
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              </Col>
            );
          })}
        </Row>
      </Grid>
    </View>
  );
};

export default CustomTab;
