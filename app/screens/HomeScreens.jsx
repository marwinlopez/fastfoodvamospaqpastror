import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../src/constants/themes";
import NebulaTextInput from "../src/components/NebulaTextInput";
import Header from "../components/Header";
import MenuButton from "../components/MenuButton";

const Menu = [
  {
    id: 1,
    item: "Recetas",
    url: "RecipesScreen",
    source: require("../assets/Menu.png"),
    params: { recipe: null },
  },
  {
    id: 2,
    item: "Pedidos",
    url: "OrderScreen",
    source: require("../assets/pedidos.png"),
    params: { item: null },
  },
  {
    id: 3,
    item: "Menu",
    url: "MenuScreen",
    source: require("../assets/menu-logo.png"),
    params: { item: null },
  },
  {
    id: 4,
    item: "Mesas",
    url: "TableScreen",
    source: require("../assets/tables2.png"),
    params: { item: null },
  },
  {
    id: 5,
    item: "Delivery",
    url: "DeliveryScreen",
    source: require("../assets/delivery.png"),
    params: { item: null },
  },
];

const HomeScreens = ({ navigation, route }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Grid>
        <Header title={"jl fast food"} />
        <Row style={{ height: 40 }}>
          <MenuButton />
        </Row>
        <Row
          style={{
            margin: 0,
          }}
        >
          <FlatList
            data={Menu}
            style={{
              paddingHorizontal: 10,
            }}
            renderItem={({ index, item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate(item.url, item.params)}
                style={{
                  aspectRatio: 1.05,
                  width: "49.5%",
                  marginRight: index % 2 !== 0 ? 0 : 5,
                  marginTop: 10,
                  marginBottom: 4,
                  padding: 1,
                  position: "relative",
                  backgroundColor: COLORS.lightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  borderColor: COLORS.default,
                  borderWidth: 2,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: "90%",
                  }}
                >
                  <Image
                    resizeMode="center"
                    style={{
                      width: "100%",
                      height: "90%",
                      marginTop: 5,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }}
                    source={item.source}
                  />
                </View>
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: item.disposable ? COLORS.white : COLORS.white,
                    backgroundColor: COLORS.default,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    bottom: 1,
                    fontSize: 15,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {item.item}
                </Text>
              </TouchableOpacity>
            )}
            numColumns={2}
          />
        </Row>
      </Grid>
    </SafeAreaView>
  );
};

export default HomeScreens;
