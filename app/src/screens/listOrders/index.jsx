import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../../constants/themes";
import useProductIndex from "../../hooks/useProductIndex";
import appStyles from "../../theme/app";

const lists = [
  {
    id: 1,
    description: "Combo Perro 2x1",
    Cantidad: "En Espera",
    full: true,
  },
  {
    id: 2,
    description: "Combo Perro 2x1",
    Cantidad: "En Espera",
    sin: "Mostaza, vegetales, Mayonesa, Papas.",
    full: false,
  },
];

const ListOrdersScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const { init } = useProductIndex();

  useEffect(() => {
    init().then((resp) => {
      console.log(resp);
      setProducts(lists);
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Grid style={{ flex: 1, paddingTop: 10, alignItems: "center" }}>
        <Row
          style={{
            backgroundColor: "#d8d8d8",
            height: 50,
            marginHorizontal: 10,
            borderRadius: 20,
          }}
        >
          <Col
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>ORDENES</Text>
          </Col>
          <Col style={{ width: 2, backgroundColor: COLORS.default }} />
          <Col
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>VER DETALLE</Text>
          </Col>
        </Row>
        <Row>
          <FlatList
            style={{
              paddingTop: 2,
              borderWidth: 1,
            }}
            data={lists}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
            renderItem={({ item }) => (
              <Row
                style={{
                  backgroundColor: "#d8d8d8",
                  height: 50,
                  marginHorizontal: 10,
                  borderRadius: 20,
                }}
              >
                <Col
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>{item.orderNro}</Text>
                </Col>
                <Col style={{ width: 2, backgroundColor: COLORS.default }} />
                <Col
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Pressable
                    key={`${item.id}`}
                    onPress={() => navigation.navigate("OrderScreen")}
                    style={appStyles.btnDetails}
                  >
                    <Text style={appStyles.card_title}>DETALLE</Text>
                  </Pressable>
                </Col>
              </Row>
            )}
          />
        </Row>
        <Row
          style={{
            position: "absolute",
          }}
        ></Row>
      </Grid>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    // paddingTop: 10,
    // backgroundColor: "Transparent",
  },
  card_template: {
    height: 50,
    boxShadow: "10px 10px 17px -12px rgba(0,0,0,0.75)",
    backgroundColor: "rgba(250,0,0, 0.5)",
    borderRadius: 10,
  },
  card_image: {
    height: 250,
    borderRadius: 10,
  },
  text_container: {
    position: "absolute",
    alignSelf: "center",
    width: "40vh",
    height: 30,
    bottom: 10,
    padding: 5,
    textAlign: "left",
  },
  card_title: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});

export default ListOrdersScreen;
