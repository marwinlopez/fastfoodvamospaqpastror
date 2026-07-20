import React from "react";
import {
  TransitionPresets,
  createStackNavigator,
} from "@react-navigation/stack";
import HomeScreens from "../screens/HomeScreens";
import RecipesScreens from "../screens/RecipesScreens";
import RecipeScreens from "../screens/RecipeScreens";
import MaterialsScreens from "../screens/MaterialsScreens";
import MaterialScreens from "../screens/MaterialScreens";
import NewProductScreen from "../screens/NewProductScreen";
import MenuScreen from "../screens/MenuScreen";
import ProductsSaleScreen from "../screens/ProductsSaleScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CategorySettingsScreen from "../screens/CategorySettingsScreen";
import UnitSettingsScreen from "../screens/UnitSettingsScreen";
import StaffSettingsScreen from "../screens/StaffSettingsScreen";
import RoleSettingsScreen from "../screens/RoleSettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import useGlobal from "../hooks/useGlobal";
import { ActivityIndicator, View } from "react-native";
const Root = createStackNavigator();

const NavigatorScreen = (props) => {
  const { loading, isAuthenticated } = useGlobal();
  const screenOptions = {
    headerShown: false,
    ...TransitionPresets.FadeFromBottomAndroid,
  };
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size={50} />
      </View>
    );
  }
  if (!isAuthenticated) {
    return (
      <Root.Navigator
        initialRouteName="LoginScreen"
        screenOptions={screenOptions}
        {...props}
      >
        <Root.Screen name="LoginScreen" component={LoginScreen} />
      </Root.Navigator>
    );
  }
  return (
    <Root.Navigator
      initialRouteName="HomeScreen"
      screenOptions={screenOptions}
      {...props}
    >
      <Root.Screen name="HomeScreen" component={HomeScreens} />
      <Root.Screen name="RecipesScreen" component={RecipesScreens} />
      <Root.Screen name="RecipeScreen" component={RecipeScreens} />
      <Root.Screen name="MaterialsScreen" component={MaterialsScreens} />
      <Root.Screen name="MaterialScreen" component={MaterialScreens} />
      <Root.Screen name="NewProductScreen" component={NewProductScreen} />
      <Root.Screen name="MenuScreen" component={MenuScreen} />
      <Root.Screen name="ProductsSaleScreen" component={ProductsSaleScreen} />
      <Root.Screen name="SettingsScreen" component={SettingsScreen} />
      <Root.Screen name="CategorySettingsScreen" component={CategorySettingsScreen} />
      <Root.Screen name="UnitSettingsScreen" component={UnitSettingsScreen} />
      <Root.Screen name="StaffSettingsScreen" component={StaffSettingsScreen} />
      <Root.Screen name="RoleSettingsScreen" component={RoleSettingsScreen} />
    </Root.Navigator>
  );
};

export default NavigatorScreen;
