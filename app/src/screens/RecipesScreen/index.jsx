import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import { FAB, Icon } from "@rneui/themed";
import { useEffect } from "react";
import { ToastAndroid } from "react-native";
import useRecipesIndex from "../../hooks/useRecipesIndex";

const RecipesScreen = ({ route, navigation }) => {
  const { recipes, newRecipe, setRecipe, getRecipe } = useRecipesIndex();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("newRecipe", getRecipe());
      if (newRecipe) {
        // if (typeof recipe.ingredents === "undefined"){
        //   ToastAndroid.show(`Receta ${recipe.name} Descartada`, ToastAndroid.CENTER);
        //   setRecipe(null)
        // }
      } else {
        ToastAndroid.show("Receta Descartada", ToastAndroid.CENTER);
      }
    });
    return unsubscribe;
  }, []);
  const addOrUpdateRecipe = (item) => {
    navigation.navigate("RecipeScreen", { recipe: item });
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
            <Text
              style={{
                fontSize: 25,
                fontWeight: "bold",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              Recetas
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
              data={recipes}
              ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
              renderItem={({ item }) => (
                <Pressable onPress={() => addOrUpdateRecipe(item)}>
                  <Grid>
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
                  </Grid>
                </Pressable>
              )}
              numColumns={1}
            />
          </Col>
        </Row>
      </Grid>
      <FAB
        visible={true}
        onPress={() => addOrUpdateRecipe(null)}
        placement="right"
        title={"Nueva Receta"}
        icon={{ name: "add", color: "white" }}
        color={COLORS.default}
      />
    </SafeAreaView>
  );
};
export default RecipesScreen;
