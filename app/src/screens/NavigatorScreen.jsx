import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransitionPresets } from "@react-navigation/stack";
import ProductScreen from "./product";
import InvoiceScreen from "./invoice";
import MenuScreen from "./menu";
import { COLORS } from "../constants/themes";
import ListOrdersScreen from "./listOrders";
import AuthenticationScreen from "./auth";
import ProductListScreen from "./productList";
import HomeScreen from "./HomeScreen";
import RecipesScreen from "./RecipesScreen";
import LocationScreen from "./LocationScreen";
import OrderScreen from "./OrderScreen";
import DeliveryScreen from "./DeliveryScreen";
import ToastNebula from "../components/ToastNebula";
import { Button, TouchableOpacity } from "react-native";
import { Icon } from "@rneui/themed";
import TableScreen from "./TableScreen";
import RecipeScreen from "./recipe";
import { RecipeProvider } from "../context/RecipeContext";

const Stack = createNativeStackNavigator();
const StackRecipe = createNativeStackNavigator();

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

const NavigatorScreen = (props) => {
  const screenOptions = {
    headerShown: true,
    ...TransitionPresets.FadeFromBottomAndroid,
  };
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={screenOptions}
      {...props}
    >
      <Stack.Screen
        name="Home"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
          headerBackVisible: true,
        }}
        component={HomeScreen}
      />
      <Stack.Screen
        name="Login"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
          headerBackVisible: false,
        }}
        component={AuthenticationScreen}
      />
      <Stack.Screen
        name="ProductScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
          headerBackVisible: true,
        }}
        component={ProductScreen}
      />
      <Stack.Screen
        name="ProductListScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
          headerBackVisible: true,
          headerRight: () => <Button title="Update count" />,
        }}
        component={ProductListScreen}
      />
      <Stack.Screen
        name="OrderScreen"
        options={{
          title: "Nueva Receta",
          headerStyle: {
            backgroundColor: COLORS.default,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          cardStyleInterpolator: forFade,
        }}
        component={OrderScreen}
      />
      <Stack.Screen
        name="ListOrdersScreen"
        options={{
          title: "Pedidos pendientes JL Fast Food",
          headerStyle: {
            backgroundColor: COLORS.default,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          cardStyleInterpolator: forFade,
        }}
        component={ListOrdersScreen}
      />
      <Stack.Screen
        name="InvoiceScreen"
        options={{
          title: "Pedido de Cliente",
          headerStyle: {
            backgroundColor: COLORS.default,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
        }}
        component={InvoiceScreen}
      />
      <Stack.Screen
        name="LocationScreen"
        options={{
          title: "Ubicación de Cliente/ Cliente",
          headerStyle: {
            backgroundColor: COLORS.default,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
        }}
        component={LocationScreen}
      />
      <Stack.Screen
        name="MenuScreen"
        options={{
          title: "JL Fast Food Menú",
          headerStyle: {
            backgroundColor: COLORS.default,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "horizontal",
          cardStyleInterpolator: forFade,
        }}
        component={MenuScreen}
      />
      {/* <Stack.Group screenOptions={{ presentation: "modal" }}>s */}
      <Stack.Screen
        name="RecipesScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          cardStyleInterpolator: forFade,
          headerBackVisible: true,
        }}
        component={RecipesScreen}
      />
      <Stack.Screen
        name="RecipeScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          cardStyleInterpolator: forFade,
          headerBackVisible: true,
        }}
        component={RecipeScreen}
      />
      {/* </Stack.Group> */}
      <Stack.Screen
        name="DeliveryScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          headerBackVisible: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => alert("This is a button!")}
              title="Info"
              color="#fff"
            >
              <Icon
                type="feather"
                name="more-vertical"
                color="white"
                onPress={console.log("hola")}
              />
            </TouchableOpacity>
          ),
        }}
        component={DeliveryScreen}
      />
      <Stack.Screen
        name="TableScreen"
        options={{
          headerTransparent: true,
          title: "",
          gestureEnabled: true,
          animationEnabled: true,
          gestureDirection: "vertical",
          headerBackVisible: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => alert("This is a button!")}
              title="Info"
              color="#fff"
            >
              <Icon
                type="feather"
                name="more-vertical"
                color="white"
                onPress={console.log("hola")}
              />
            </TouchableOpacity>
          ),
        }}
        component={TableScreen}
      />
    </Stack.Navigator>
  );
};

export default NavigatorScreen;
