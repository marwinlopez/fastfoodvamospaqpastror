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
import useGlobal from "../hooks/useGlobal";
import { ActivityIndicator, View } from "react-native";
const Root = createStackNavigator();

const NavigatorScreen = (props) => {
  const { loading } = useGlobal();
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
    </Root.Navigator>
  );
};

export default NavigatorScreen;
