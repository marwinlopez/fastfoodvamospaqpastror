import React, { useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Header from "../components/Header";
import { COLORS } from "../src/constants/themes";
import { FAB, Icon, Skeleton } from "@rneui/themed";
import { useState } from "react";
import RecipesReducer, {
  actionCreators,
  initialState,
} from "../hooks/RecipesReducer";
import apis from "../apis";
import LinkItemList from "../components/LinkItemList";
import ItemsRecipes from "../components/ItemsRecipes";
import { EventRegister } from "react-native-event-listeners";

const RecipesScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(RecipesReducer, initialState);
  const [isUpdateOrCreate, setIsUpdateOrCreate] = useState(false);
  const { recipe } = route.params;

  // useEffect(() => {
  //   fetchRecipes();
  // }, []);

  // useEffect(() => {
  //   async function fetchRecipes() {
  //     dispatch(actionCreators.loading());
  //     getAllRecipe();
  //   }
  //   EventRegister.addEventListener("online", fetchRecipes);
  //   return () => {
  //     EventRegister.removeEventListener("online", fetchRecipes);
  //   };
  // });

  const { loading, error, recipes } = state;

  useEffect(() => {
    // if (Array.isArray(state) && recipe) {
    //   const sw = state.findIndex((item) => item.name === recipe.recipeName);
    //   if (sw > 0) {
    //     ToastAndroid.show(
    //       `RECETA ${recipe.recipeName} YA EXISTE`,
    //       ToastAndroid.CENTER
    //     );
    //   } else if (isUpdateOrCreate) {
    //     ToastAndroid.show(
    //       `RECETA ${recipe.recipeName} CREADA SATISFACTORIAMENTE!!`,
    //       ToastAndroid.CENTER
    //     );
    //   }
    // }
  }, [state]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log(recipe);
      if (recipe) {
        console.log(recipe.ingredients.length === 0, recipe.name == "");
        setIsUpdateOrCreate(recipe.ingredients.length > 0);
        if (
          recipe.ingredients.length === 0 &&
          recipe.name !== "" &&
          recipe.recipeId == 0
        ) {
          ToastAndroid.show(
            `RECETA ${recipe.name} DESCARTADA`,
            ToastAndroid.CENTER
          );
        } else if (
          recipe.ingredients.length > 0 &&
          recipe.name !== "" &&
          recipe.recipeId > 0
        ) {
          ToastAndroid.show(
            `RECETA ${recipe.name} CREADA`,
            ToastAndroid.CENTER
          );
        }
      }
      fetchRecipes();
    });
    return unsubscribe;
  }, []);

  const redirectActionLeft = () => {
    navigation.navigate("HomeScreen");
  };

  const fetchRecipes = async () => {
    dispatch(actionCreators.loading());
    apis
      .recipeAll()
      .then(({ data }) => {
        const { recipes, success, message } = data;
        if (!success) ToastAndroid.show(`${message}`, ToastAndroid.CENTER);

        dispatch(actionCreators.success(recipes));
      })
      .catch((error) => {
        ToastAndroid.show(`Error inesperado!!`, ToastAndroid.CENTER);
        console.log(error);
      });
  };

  const addRecipe = (item, type) => {
    navigation.navigate("RecipeScreen", {
      route: type,
      recipe: item,
    });
  };

  const updateRecipe = () => {
    navigation.navigate("RecipeScreen", {
      route: type,
      recipe: item,
    });
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error inesperado</Text>
      </View>
    );
  }

  const editRecipe = (action, route, recipe) => {
    navigation.push(action, {
      route: route,
      recipe: recipe,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Grid>
        <Header
          title={"Recetas"}
          buttonLeft={"arrow-left"}
          actionLeft={redirectActionLeft}
        />

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
            <ItemsRecipes
              recipes={recipes}
              edit={editRecipe}
              onRefresh={fetchRecipes}
            />
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
        title={"Nueva Receta"}
        disabled={loading}
        icon={{ name: "add", color: "white" }}
        color={COLORS.default}
      />
    </View>
  );
};

export default RecipesScreens;
