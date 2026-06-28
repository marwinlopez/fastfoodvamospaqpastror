import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Grid style={styles.grid}>
        <Header title={"jl fast food"} />
        <Row style={styles.menuButtonRow}>
          <MenuButton />
        </Row>
        <Row style={styles.listContainerRow}>
          <FlatList
            data={Menu}
            contentContainerStyle={styles.list}
            renderItem={({ index, item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate(item.url, item.params)}
                style={styles.card}
              >
                <View style={styles.imageContainer}>
                  <Image
                    resizeMode="contain"
                    style={styles.image}
                    source={item.source}
                  />
                </View>
                <Text style={styles.cardTitle}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Fondo limpio del lienzo
  },
  grid: {
    flex: 1,
  },
  menuButtonRow: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  listContainerRow: {
    flex: 1,
    marginHorizontal: 10,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    aspectRatio: 0.98,
    backgroundColor: COLORS.white,
    margin: 8,
    borderRadius: 20, // Bordes redondeados pronunciados
    padding: 16, // Espaciado interno amplio
    justifyContent: "space-between",
    alignItems: "center",
    // Sombras sutiles y elegantes (Efecto Canvas)
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA", // Fondo suave para destacar la imagen
    borderRadius: 16,
    padding: 8,
  },
  image: {
    width: "90%",
    height: "90%",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212529", // Jerarquía y contraste moderno
    textAlign: "center",
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default HomeScreens;
