import React, { useState, useEffect, useReducer } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Header from "../components/Header";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import NebulaTextInput from "../src/components/NebulaTextInput";
import { COLORS } from "../src/constants/themes";
import RecipeReducer, {
  actionCreators,
  initialState,
} from "../hooks/RecipeReducer";
import { Button } from "@rneui/themed";
import LinkItemList from "../components/LinkItemList";
import apis from "../apis";

const RecipeScreens = ({ navigation, route }) => {
  var { height } = Dimensions.get("window");
  const [state, dispatch] = useReducer(RecipeReducer, initialState);
  const [stateButtonAdd, setStateButtonAdd] = useState(true);

  // useEffect(() => {
  //   const { isAddQuantity, loading, recipe, isShowDetails } = state;
  //   const { ingredients } = recipe;
  //   console.log(recipe);
  // }, [state]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(actionCreators.loading());
      const { recipe } = route.params;
      switch (route.params.route) {
        case "editRecipe":
          console.log(recipe);
          // dispatch(actionCreators.success(recipe));
          actionCreators.editRecipe(recipe).then((data) => {
            console.log(data);
            dispatch(actionCreators.success(data));
          });
          break;
        case "materialsAdd":
          const { recipeId } = route.params;
          getRecipeId(recipeId);
          break;
        case "newRecipe":
          dispatch(actionCreators.loading());
          if (recipe) dispatch(actionCreators.success(recipe));

          break;
        default:
          console.log("no existe parametro");
          break;
      }
    });
    return unsubscribe;
  }, []);

  const { isAddQuantity, loading, recipe, isShowDetails } = state;
  // const { ingredients } = recipe;
  const redirectActionLeft = () => {
    navigation.push("RecipesScreen", { recipe: recipe });
  };

  const getRecipeId = (id) => {
    apis.recipeForId(id).then(({ data }) => {
      const { recipe } = data;
      dispatch(actionCreators.success(recipe));
    });
  };

  const onChange = () => {};

  const addIngredients = () => {
    navigation.navigate("MaterialsScreen", { recipe: recipe });
  };

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <Header
        title={"Recetas"}
        buttonLeft={"arrow-left"}
        actionLeft={redirectActionLeft}
        isSearch={true}
      />
      <Grid>
        <Row style={{ height: 120 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "flex-start",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 18,
                  fontWeight: "900",
                }}
              >
                Nombre de la Receta:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput
                  defaultValue={recipe?.name}
                  onChangeText={(text) => {
                    dispatch(actionCreators.changeName(text.trim()));
                  }}
                />
              </Col>
            </Row>
            <Row style={{ paddingTop: 5, height: 60 }}>
              <Col
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Row>
                  {recipe?.id ? (
                    <>
                      <Col>
                        <Button
                          containerStyle={{
                            paddingLeft: 0,
                            borderRadius: 5,
                            alignContent: "center",
                          }}
                          disabled={isAddQuantity}
                          buttonStyle={{
                            backgroundColor: COLORS.default,
                          }}
                          title="Editar Nombre"
                          icon={{
                            name: "save",
                            type: "font-awesome",
                            size: 18,
                            color: "white",
                          }}
                          iconContainerStyle={{ marginRight: 5 }}
                          onPress={addIngredients}
                        />
                      </Col>
                      <Col style={{ width: 5 }} />
                    </>
                  ) : null}
                  <Col>
                    <Button
                      containerStyle={{
                        paddingLeft: 0,
                        borderRadius: 5,
                        alignContent: "center",
                      }}
                      disabled={isAddQuantity}
                      buttonStyle={{
                        backgroundColor: COLORS.default,
                      }}
                      title="Añadir Cantidades"
                      icon={{
                        name: "plus",
                        type: "font-awesome",
                        size: 18,
                        color: "white",
                      }}
                      iconContainerStyle={{ marginRight: 5 }}
                      onPress={addIngredients}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            height: height - 240,
            paddingVertical: 5,
            paddingHorizontal: 5,
          }}
        >
          <Col
            style={{
              // height: 600,
              borderColor: COLORS.default,
              paddingHorizontal: 1,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            {isShowDetails ? null : (
              <FlatList
                style={{ flex: 1 }}
                scrollEnabled
                // keyExtractor={(ingredient) => ingredient.idIngredient}
                data={recipe?.ingredients}
                ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
                renderItem={({ item }) => (
                  <TouchableOpacity key={`item-${item.idIngredient}`}>
                    <LinkItemList
                      id={item.idIngredient}
                      name={`${item.description}`}
                      quantity={`${item.quantity} ${item.unitOfMeasurement}`}
                      cost={`${item.cost}`}
                      coin={item.coin}
                      url="Material"
                    />
                  </TouchableOpacity>
                )}
                numColumns={1}
              />
            )}
          </Col>
        </Row>
        <Row style={{ height: 100 }}>
          <Col style={{ width: "40%" }} />
          <Col>
            <Row style={{ height: 20 }}>
              <Col style={{ alignItems: "flex-end", paddingRight: 10 }}>
                <Text>{`Costo ${recipe?.coin}: `}</Text>
              </Col>
              <Col
                style={{
                  backgroundColor: COLORS.default,
                  borderRadius: 5,
                  marginRight: 5,
                  alignItems: "flex-end",
                }}
              >
                <Text style={{ marginHorizontal: 5 }}>{`${recipe?.cost}`}</Text>
              </Col>
            </Row>
            <Row style={{ height: 1 }} />
            <Row style={{ height: 20 }}>
              <Col style={{ alignItems: "flex-end", paddingRight: 10 }}>
                <Text>Ganancia %: </Text>
              </Col>
              <Col
                style={{
                  backgroundColor: COLORS.default,
                  borderRadius: 5,
                  marginRight: 5,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{ marginHorizontal: 5 }}
                >{`${recipe?.profit}`}</Text>
              </Col>
            </Row>
            <Row style={{ height: 1 }} />
            <Row style={{ height: 20 }}>
              <Col style={{ alignItems: "flex-end", paddingRight: 10 }}>
                <Text>{`Precio ${recipe?.coin}: `}</Text>
              </Col>
              <Col
                style={{
                  backgroundColor: COLORS.default,
                  borderRadius: 5,
                  marginRight: 5,
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{ marginHorizontal: 5 }}
                >{`${recipe?.price}`}</Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    </SafeAreaView>
  );
};

export default RecipeScreens;
