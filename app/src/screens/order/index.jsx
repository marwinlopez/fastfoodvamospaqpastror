import { Icon } from "@rneui/base";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import NebulaTextInput from "../../components/NebulaTextInput";
import { COLORS } from "../../constants/themes";
import useProductIndex from "../../hooks/useProductIndex";
import appStyles from "../../theme/app";

const OrderScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const { init } = useProductIndex();

  useEffect(() => {
    init().then((resp) => {
      setProducts(resp.data);
      console.log(resp.data);
    });
  }, []);
  const toggleDialog = () => {
    alert('hola')
  };
  return (
    <View style={{ flex: 1 }}>
      <Grid>
        <Row style={{ height: 140, paddingHorizontal: 5 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "center",
              padding: 5,
            }}
          >
            <Row style={{ height: 20 }}>
              <Text style={{ color: COLORS.white, fontSize: 15 }}>
                Nombre Receta:
              </Text>
            </Row>
            <Row style={{}}>
              <Col>
                <NebulaTextInput value={"Nombre Receta"} disabled={true}>
                  <Icon
                    type="material-community"
                    name="barcode"
                    size={30}
                    color={COLORS.white}
                    onPress={() => {
                      // navigation.navigate("Scanner", { view: "NewProduct" });
                    }}
                  />
                </NebulaTextInput>
              </Col>
            </Row>
            <Row style={{ height: 20 }}>
              <Text style={{ color: COLORS.white, fontSize: 15 }}>
                Disponible:
              </Text>
            </Row>
            <Row style={{}}>
              <Col>
                <NebulaTextInput value={"0.00"} disabled={true} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ height: 45, paddingHorizontal: 5 }}>
          <Col
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 5,
            }}
          >
            <Row
              style={{
                backgroundColor: COLORS.default,
                flex: 1,
                justifyContent: "center",
                borderRadius: 10,
              }}
            >
              <Col style={{ justifyContent: "center", paddingLeft: 10 }}>
                <Text style={{ color: COLORS.white, fontSize: 15 }}>
                  Nombre Recetas
                </Text>
              </Col>
              <Col
                style={{ justifyContent: "center", paddingLeft: 10, width: 80 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 15 }}>
                  Disponible
                </Text>
              </Col>
              <Col
                style={{ justifyContent: "center", paddingLeft: 10, width: 70 }}
              >
                <Text style={{ color: COLORS.white, fontSize: 15 }}>Costo</Text>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ paddingHorizontal: 5 }}>
          <FlatList
            style={{
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}
            data={products}
            ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
            renderItem={({ item }) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate("RecipesScreen",{
                  recipe: item
                })}
              >
                <Row style={{ height: 50 }}>
                  <Col
                    style={{
                      flex: 1.5,
                      justifyContent: "center",
                    }}
                  >
                    <Row
                      style={{
                        height: 40,
                        borderColor: COLORS.default,
                        borderWidth: 1,
                        flex: 1,
                        justifyContent: "center",
                        borderRadius: 10,
                      }}
                    >
                      <Col
                        style={{ justifyContent: "center", paddingLeft: 10 }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 15 }}>
                          {item.name}
                        </Text>
                      </Col>
                      <Col
                        style={{
                          justifyContent: "center",
                          paddingLeft: 10,
                          width: 80,
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 15 }}>
                          {item.disposable}
                        </Text>
                      </Col>
                      <Col
                        style={{
                          justifyContent: "center",
                          paddingLeft: 10,
                          width: 70,
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 15 }}>
                          {item.cost}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Pressable>
            )}
            numColumns={1}
          />
        </Row>
        <Row style={{ height: 45, backgroundColor: COLORS.default }}></Row>
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

export default OrderScreen;
