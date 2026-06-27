import { useEffect } from "react";
import { Icon } from "@rneui/base";
import { FlatList, Pressable, Text, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import NebulaTextInput from "../../components/NebulaTextInput";
import { COLORS } from "../../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@rneui/themed";
import { useState } from "react";
import useRecipeIndex from "../../hooks/useRecipeIndex";

const RecipeScreen = ({ route, navigation }) => {
  const { create, setRecipe } = useRecipeIndex();
  const [receta, setReceta] = useState(null);
  const [countItem, setCountItem] = useState(0);
  const [stateButton, setStateButton] = useState(true);
  const [stateButtonAdd, setStateButtonAdd] = useState(true);
  const { recipe } = route.params;

  useEffect(() => {
    console.log(recipe?.ingredients ?? "Hola");
    setReceta({
      idRecipe: recipe ? recipe.idRecipe : 0,
      name: recipe ? recipe.name : "",
      cost: recipe ? recipe.cost : 0,
      coin: "USD",
      ingredients: recipe?.ingredients ?? [],
    });
    setStateButtonAdd(!(recipe ?? false));
  }, []);

  useEffect(() => {
    // setRecipe(receta);
    create(receta);
    setCountItem(receta?.ingredients?.length ?? 0);
  }, [receta]);

  const handleInput = (id, value) => {
    // console.log(id, value);
    // setStateButtonAdd(value.length == 0);
    setReceta({
      ...receta,
      [id]: value,
    });
    // console.log(receta.ingredients);
    // create(state).then(({ idRecipe }) => {
    //   console.log(idRecipe);
    // //   setStateButtonAdd(!(idRecipe > 0));
    // });
    return;
  };

  const addIngredients = () => {
    // if (state.name) {
    //   if (state.idRecipe > 0) {
    //     navigation.navigate("ProductListScreen", { recipe: state });
    //   }
    // }
  };

  const newRecipe = () => {
    if (receta.idRecipe > 0) {
      // create(state).then(({ idRecipe }) => {
      //   setStateButtonAdd(!(idRecipe > 0));
      // });
      console.log("Existe");
    } else {
      create(receta).then(({ idRecipe }) => {
        setStateButtonAdd(!(idRecipe > 0));
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, top: 0 }}>
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
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>Receta</Text>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 70 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "flex-start",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text
                style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}
              >
                Nombre de la Receta:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput
                  defaultValue={receta?.name}
                  onChangeText={(e) => handleInput("name", e)}
                  disabled={false}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 60 }}>
          <Col
            style={{
              flex: 1,
              justifyContent: "center",
              padding: 5,
            }}
          >
            <Row>
              <Col>
                <Button
                  containerStyle={{
                    paddingLeft: 0,
                    borderRadius: 5,
                    alignContent: "center",
                  }}
                  disabled={stateButtonAdd}
                  buttonStyle={{
                    backgroundColor: COLORS.default,
                  }}
                  title="Añadir Cantidades"
                  onPress={addIngredients}
                />
              </Col>
              {/* <Col style={{ width: 5 }} />
              <Col>
                <Button
                  containerStyle={{
                    paddingLeft: 0,
                    borderRadius: 25,
                    alignContent: "center",
                  }}
                  disabled={stateButton}
                  buttonStyle={{
                    backgroundColor: COLORS.default,
                  }}
                  title="Guadar"
                  onPressIn={newRecipe}
                />
              </Col> */}
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            height: 400,
            justifyContent: "flex-start",
            paddingHorizontal: 10,
          }}
        >
          <Col
            style={{
              justifyContent: "flex-start",
              borderColor: COLORS.default,
              paddingTop: 1,
              paddingHorizontal: 1,
              borderWidth: 1,
              borderRadius: 5,
            }}
          >
            {receta?.ingredients?.length > 0 ? (
              <FlatList
                data={receta.ingredients}
                ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
                renderItem={({ item }) => (
                  <Pressable onPress={() => console.log(item)}>
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
                            {item.description}
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
                          onPress={() => console.log("Menu ", item.description)}
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
                numColumns={1}
              />
            ) : null}
          </Col>
        </Row>
        <Row style={{ height: 15 }} />
        <Row
          style={{
            justifyContent: "center",
            height: 30,
            paddingHorizontal: 20,
          }}
        >
          <Col></Col>
          <Col>
            <Text>Total Item</Text>
          </Col>
          <Col style={{ width: 100 }}>
            <Text style={{ flex: 1, textAlign: "right" }}>{countItem}</Text>
          </Col>
        </Row>
        <Row
          style={{
            justifyContent: "center",
            height: 30,
            paddingHorizontal: 20,
          }}
        >
          <Col></Col>
          <Col>
            <Text>Total Costo</Text>
          </Col>
          <Col style={{ width: 100 }}>
            <Text style={{ flex: 1, textAlign: "right" }}>{0}</Text>
          </Col>
        </Row>
      </Grid>
      {/* <Grid>
        <Row size={12} style={{ paddingHorizontal: 5 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "center",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text style={{ color: COLORS.white, fontSize: 15 }}>
                Nombre Receta:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput value={recipe.name} disabled={true}/>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row size={10} style={{ paddingHorizontal: 5 }}>
          <Col style={{ paddingHorizontal: 5 }}>
            <Row style={{ height: 25 }}>
              <Text style={{ color: COLORS.white, fontSize: 15 }}>
                Disponibilidad:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput
                  value={`${recipe.disposable}`}
                  disabled={true}
                />
              </Col>
            </Row>
          </Col>
          <Col style={{ paddingHorizontal: 5 }}>
            <Row style={{ height: 25 }}>
              <Text style={{ color: COLORS.white, fontSize: 15 }}>
                Costo Receta:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput value={`${recipe.cost}`} disabled={true} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          size={5}
          style={{ paddingHorizontal: 10, paddingTop: 10, marginTop: 10, backgroundColor: COLORS.default }}
        >
          <Col size={70}>
            <Text style={{ color: COLORS.white, fontSize: 15 }}>
              Descripción
            </Text>
          </Col>
          <Col size={15}>
            <Text style={{ color: COLORS.white, fontSize: 15 }}>Cant.</Text>
          </Col>
          <Col size={15}>
            <Text style={{ color: COLORS.white, fontSize: 15 }}>Precio</Text>
          </Col>
        </Row>
        <Row
          size={65}
          style={{ paddingHorizontal: 5 }}
        >
          <FlatList
            style={{
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}
            data={recipe.ingredients}
            ItemSeparatorComponent={() => <View style={{ padding: 2 }} />}
            renderItem={({ item }) => (
              <Row style={{ height: 30 }}>
                <Col size={70}>
                  <Text>{item.description}</Text>
                </Col>
                <Col size={15}>
                  <Text>
                    {item.cantIngr} {item.unidMedidaIngr}
                  </Text>
                </Col>
                <Col size={15}>
                  <Text>{item.total}</Text>
                </Col>
              </Row>
            )}
            numColumns={1}
          />
        </Row>
        <Row
          size={5}
          style={{
            backgroundColor: "#345345",
          }}
        >
          <Col size={70}>
            <Text></Text>
          </Col>
          <Col size={15}>
            <Text style={{ paddingVertical: 6 }}>Total:</Text>
          </Col>
          <Col size={15}>
            <Text style={{ paddingVertical: 6 }}>{recipe.cost}</Text>
          </Col>
        </Row>
        <Row size={10}>
          <Col style={{ backgroundColor: "#004507" }}></Col>
          <Col style={{ backgroundColor: "#009807" }}></Col>
          <Col style={{ backgroundColor: "#004507" }}></Col>
        </Row>
      </Grid> */}
    </SafeAreaView>
  );
};

export default RecipeScreen;
