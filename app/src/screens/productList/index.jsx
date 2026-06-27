import { Icon } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import useProductListIndex from "../../hooks/useProductListIndex";

const ProductListScreen = ({ route, navigation }) => {
  const { init } = useProductListIndex();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [state, setState] = useState([]);
  const { recipe } = route.params;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    init().then(({ data }) => {
      setState(data);
    });
  }, []);
  //   useEffect(() => {
  //     switch (selectedIndex) {
  //       case 1:
  //         navigation.navigate("ProductScreen");
  //         break;

  //       default:
  //         break;
  //     }
  //   }, [selectedIndex]);

  const docsNavigate = () => {
    console.log("hola");
  };
  const onSubmit = (data) => console.log(data);
  console.log(errors);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        top: 0,
      }}
    >
      <Grid>
        <Row style={{ height: 50 }}>
          <Col
            style={{
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 70,
              backgroundColor: COLORS.default,
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Seleccionar Ingredientes
            </Text>
          </Col>
        </Row>
        <Row
          style={{
            flex: 1,
            justifyContent: "flex-start",
            paddingVertical: 5,
            paddingHorizontal: 5,
          }}
        >
          <Col
            style={{
              flex: 1,
              justifyContent: "flex-start",
              borderColor: COLORS.default,
              paddingTop: 1,
              paddingHorizontal: 1,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            <FlatList
              style={{
                flex: 1,
              }}
              data={state}
              ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
              renderItem={({ item }) => (
                <Pressable>
                  <Row
                    key={item.id}
                    style={{
                      height: 70,
                      backgroundColor: "#000100",
                      borderRadius: 5,
                    }}
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
                          {item.producto}
                        </Text>
                      </Row>
                      <Row
                        style={{
                          alignItems: "flex-start",
                        }}
                      >
                        <Col size={0.5}>
                          <Text>Precio Compra: </Text>
                        </Col>
                        <Col>
                          <Text>{item.precioCompra}</Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      size={0.2}
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
                        onPress={() =>
                          navigation.navigate("ProductScreen", {
                            product: item,
                            recipe: recipe,
                          })
                        }
                      >
                        <Icon type="feather" name="download" color="white" />
                      </Pressable>
                    </Col>
                  </Row>
                </Pressable>
              )}
              numColumns={1}
            />
          </Col>
        </Row>
      </Grid>
    </SafeAreaView>
  );
};

export default ProductListScreen;
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
