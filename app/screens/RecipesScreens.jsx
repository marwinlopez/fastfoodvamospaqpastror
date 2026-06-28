import React, { useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { COLORS } from "../src/constants/themes";
import { FAB } from "@rneui/themed";
import RecipesReducer, { actionCreators, initialState } from "../hooks/RecipesReducer";
import apis from "../apis";
import ItemsRecipes from "../components/ItemsRecipes";

const MOCK_RECIPES = [
  { recipeId: 1, name: "Hamburguesa Clásica PA Q'", cost: 4.5, coin: "USD" },
  { recipeId: 2, name: "Papas Fritas Especiales", cost: 2.2, coin: "USD" },
  { recipeId: 3, name: "Hamburguesa Doble Carne", cost: 6.0, coin: "USD" },
  { recipeId: 4, name: "Combo Pastor Familiar", cost: 12.5, coin: "USD" },
];

const RecipesScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(RecipesReducer, initialState);
  const { recipe } = route.params || {};
  const { loading, error, recipes } = state;

  const fetchRecipes = async () => {
    dispatch(actionCreators.loading());
    apis.recipeAll()
      .then(({ data }) => {
        const recipesList = data?.recipes || (Array.isArray(data) ? data : null);
        const success = data?.success || Array.isArray(data);

        if (success && recipesList) {
          dispatch(actionCreators.success(recipesList));
        } else {
          dispatch(actionCreators.success([]));
        }
      })
      .catch((error) => {
        console.log("Error al obtener recetas de la API (usando fallback mock):", error);
        dispatch(actionCreators.success(MOCK_RECIPES));
      });
  };

  useEffect(() => {
    fetchRecipes(); // Llamado inicial al montar
    const unsubscribe = navigation.addListener("focus", fetchRecipes);
    return unsubscribe;
  }, [navigation]);

  const editRecipe = (action, route, recipe) => {
    navigation.push(action, { route, recipe });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.default} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <Header
        title={"Recetas"}
        buttonLeft={"arrow-left"}
        actionLeft={() => navigation.navigate("HomeScreen")}
      />

      <View style={styles.content}>
        {/* Aquí tus recetas flotan sin bordes rígidos */}
        <ItemsRecipes
          recipes={recipes}
          edit={editRecipe}
          onRefresh={fetchRecipes}
        />
      </View>

      <FAB
        visible={true}
        onPress={() => navigation.push("RecipeScreen", { route: "newRecipe", recipe: null })}
        placement="right"
        title={"Nueva Receta"}
        icon={{ name: "add", color: "white" }}
        color={COLORS.default}
        buttonStyle={styles.fabStyle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Fondo Canvas (Blanco roto/Gris claro)
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  fabStyle: {
    borderRadius: 16, // Estilo Canvas: Bordes redondeados
    paddingHorizontal: 20,
    elevation: 4, // Sombra suave para que flote
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default RecipesScreens;