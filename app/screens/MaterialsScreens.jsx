import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Header from "../components/Header";
import { COLORS } from "../src/constants/themes";
import { Icon, Skeleton } from "@rneui/themed";
import { useEffect } from "react";
import { useReducer } from "react";
import MaterialsReducer, {
  actionCreators,
  initialState,
} from "../hooks/MaterialsReducer";
import apis from "../apis";
import { TouchableOpacity } from "react-native-gesture-handler";
import { FAB } from "@rneui/base";
import GridEmpty from "../components/GridEmpty";

const MaterialsScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(MaterialsReducer, initialState);
  const [products, setProducts] = useState(state.products);
  const [refreshing, setRefreshing] = useState(false);
  const { recipe } = route.params;
  const backActionHandler = () => {
    // Alert.alert("Alert!", "Are you sure you want to go back?", [
    //   {
    //     text: "Cancel",
    //     onPress: () => null,
    //     style: "cancel",
    //   },
    //   { text: "YES", onPress: () => BackHandler.exitApp()() },
    // ]);
    redirectActionLeft();
    return true;
  };

  useEffect(() => {
    // Add event listener for hardware back button press on Android
    BackHandler.addEventListener("hardwareBackPress", backActionHandler);

    return () =>
      // clear/remove event listener
      BackHandler.removeEventListener("hardwareBackPress", backActionHandler);
  }, []);

  useEffect(() => {
    async function fetchMaterials() {
      dispatch(actionCreators.loading());
      try {
        const { data } = await apis.allProducts();
        const { products } = data;
        // console.log(products);
        dispatch(actionCreators.success(products));
      } catch (error) {}
    }

    fetchMaterials();
  }, []);

  useEffect(() => {
    setProducts(state.products);
  }, [state]);

  const { loading, error } = state;

  const redirectActionLeft = () => {
    console.log(recipe);
    // const ingredient = {
    //   id: 1,
    //   name: "Mango",
    //   coin: "USD",
    //   cost: 15,
    // };
    let route = "";
    if (recipe.recipeId > 0) {
      route = "materialsAdd";
      recipe.ingredients.push(ingredient);
    } else {
      route = "newRecipe";
    }
    navigation.push("RecipeScreen", { route: route, recipe: recipe });
  };
  const handleSearch = (text) => {
    const search = state.products.map((item) => {
      const { producto } = item;
      // console.log(item);
      if (producto.toLowerCase().includes(text)) return item;
    });
    console.log(search);
    // setProducts();
  };
  return (
    <View style={{ flex: 1 }}>
      <Grid>
        <Header
          title={"AÑADIR A LA RECETA"}
          buttonLeft={"arrow-left"}
          actionLeft={redirectActionLeft}
          isSearch={true}
          callback={handleSearch}
        />
        <Row
          style={{
            padding: 5,
            justifyContent: "flex-start",
          }}
        >
          <Col
            style={{
              justifyContent: "flex-start",
              borderColor: COLORS.default,
              paddingHorizontal: 1,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            <>
              {refreshing ? <ActivityIndicator /> : null}
              <FlatList
                data={products}
                ListEmptyComponent={() => (
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <ActivityIndicator />
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.push("MaterialScreen", {
                        route: "addMaterial",
                        product: item,
                        recipe: recipe,
                      });
                      // console.log({ recipe, product: item });
                    }}
                  >
                    <Row
                      key={item.productId}
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
                          <Col size={0.4}>
                            <Text>Precio Costo: </Text>
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
                        <View
                          style={{
                            flex: 1,
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Icon type="feather" name="download" color="white" />
                        </View>
                      </Col>
                    </Row>
                  </TouchableOpacity>
                )}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={loading} />
                }
                numColumns={1}
              />
            </>
          </Col>
        </Row>
      </Grid>
      <FAB
        visible={true}
        onPress={() =>
          navigation.push("RecipeScreen", {
            route: "newRecipe",
            recipe: null,
          })
        }
        placement="right"
        title={"Nueva Producto"}
        disabled={loading}
        icon={{ name: "add", color: "white" }}
        color={COLORS.default}
      />
    </View>
  );
};

export default MaterialsScreens;
