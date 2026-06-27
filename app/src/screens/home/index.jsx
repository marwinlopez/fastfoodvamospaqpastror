import {
  ButtonGroup,
  Chip,
  FAB,
  Header as HeaderRNE,
  Icon,
  SpeedDial,
} from "@rneui/themed";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import useGlobal from "../../hooks/useGlobal";
import useTabButtonFooter from "../../hooks/useTabButtonFooter";
import { Text, TabView } from "@rneui/themed";
import { useIsFocused } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { TouchableOpacity } from "react-native-gesture-handler";
import ProductScreen from "../ProductScreen";
import CustomTab from "../../components/CustomTab";
import useTabNavigation from "../../hooks/useTabNavigation";

function InicioScreen() {
  useEffect(() => {
    console.log("Inicio");
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home!</Text>
    </View>
  );
}

function SettingsScreen({ route, navigation,titleButton, setTitleButton  }) {
  const isFocused = useIsFocused();
  const { selectTab } = useTabNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      selectTab(1);
      // The screen is focused
      // Call any action
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings!</Text>
    </View>
  );
}


const Tab = createMaterialTopTabNavigator();

const HomeScreen = ({ route, navigation }) => {
  const [index, setIndex] = useState(0);
  const [indexTitle, setIndexTitle] = useState(0);
  const [titleButton, setTitleButton] = useState("Recetas");
  const { recipe, addRecipe,tabActive } = useGlobal();

  useEffect(() => {
    setTitleButton(tabActive);
  }, [tabActive]);
  

  const docsNavigate = () => {
    switch (index) {
      case 0:
        navigation.navigate("RecipesScreen", { recipe: null });
        break;
      case 1:
        navigation.navigate("ProductScreen");
        break;
      case 2:
        navigation.navigate("ProductScreen");
        break;
    }
  };
  const playgroundNavigate = () => {
    alert("hola 2");
  };
  return (
    <SafeAreaView style={{ flex: 1, top: 0 }}>
      <Grid>
        <Row style={{ height: 50 }}>
          <Col
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.default,
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              JL FAST FOOD
            </Text>
          </Col>
        </Row>
        <Row>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: COLORS.white,
              tabBarLabelStyle: { fontSize: 15 },

              tabBarStyle: { backgroundColor: COLORS.default },
            }}

            // tabBar={(props) => <CustomTab {...props} indexTitle={indexTitle} setIndexTitle={setIndexTitle} />}
          >
            <Tab.Screen name="Recetas" component={ProductScreen} />
            <Tab.Screen name="Productos" component={SettingsScreen} />
            <Tab.Screen name="Listas" component={SettingsScreen} />
          </Tab.Navigator>
        </Row>
        {/* <Tab
          value={index}
          onChange={(e) => setIndex(e)}
          containerStyle={{
            backgroundColor: COLORS.default,
          }}
          indicatorStyle={{
            backgroundColor: COLORS.grey,
            borderBottomColor: "#454845",
            height: 5,
          }}
          variant="primary"
        >
          <Tab.Item title="Recetas" titleStyle={{ fontSize: 15 }} />
          <Tab.Item title="Productos" titleStyle={{ fontSize: 15 }} />
          <Tab.Item title="Lista" titleStyle={{ fontSize: 15 }} />
        </Tab>

        <TabView value={index} onChange={setIndex}>
          <TabView.Item style={{ width: "100%" }}>
            <FlatList
              data={recipe}
              ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    navigation.navigate("RecipesScreen", { recipe: item })
                  }
                >
                  <Row
                    key={item.id}
                    style={{ height: 70, backgroundColor: "#000100" }}
                  >
                    <Col
                      style={{
                        justifyContent: "center",
                        paddingLeft: 10,
                      }}
                    >
                      <Row
                        style={{
                          alignItems: "flex-end",
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                          {item.name}
                        </Text>
                      </Row>
                      <Row
                        style={{
                          alignItems: "flex-start",
                        }}
                      >
                        <Col size={0.4}>
                          <Text>Precio Costo: </Text>
                        </Col>
                        <Col>
                          <Text>
                            {item.coin} {item.cost}
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      size={0.1}
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Pressable
                        style={{
                          flex: 1,
                          width: "100%",
                          justifyContent: "center",
                          alignItems: "center",
                          // backgroundColor: COLORS.orange,
                        }}
                        onPress={() => console.log("Menu ", item.name)}
                      >
                        <Icon
                          type="feather"
                          name="more-vertical"
                          color="white"
                        />
                      </Pressable>
                    </Col>
                  </Row>
                </Pressable>
              )}
            />
          </TabView.Item>
          <TabView.Item style={{ width: "100%" }}>
            <Text h1>Favorite</Text>
          </TabView.Item>
          <TabView.Item style={{ width: "100%" }}>
            <Text h1>Cart</Text>
          </TabView.Item>
        </TabView> */}
        <FAB
          visible={true}
          onPress={docsNavigate}
          placement="right"
          title={titleButton ? titleButton : ""}
          icon={{ name: "add", color: "white" }}
          color={COLORS.default}
        />
      </Grid>
    </SafeAreaView>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.default,
    marginBottom: 20,
    width: "100%",
    paddingVertical: 15,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
  },
  subheaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
