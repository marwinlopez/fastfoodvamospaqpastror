import React, { useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  StatusBar,
  Alert,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { COLORS } from "../constants/themes";
import { FAB } from "@rneui/themed";
import RecipesReducer, { actionCreators, initialState } from "../hooks/RecipesReducer";
import apis from "../apis";
import ItemsRecipes from "../components/ItemsRecipes";

const RecipesScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(RecipesReducer, initialState);
  const { isSelectionMode, recipe: parentRecipe } = route.params || {};
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
        console.log("Error al obtener recetas de la API:", error);
        dispatch(actionCreators.failure());
      });
  };

  useEffect(() => {
    fetchRecipes(); // Llamado inicial al montar
    const unsubscribe = navigation.addListener("focus", fetchRecipes);
    return unsubscribe;
  }, [navigation]);

  const editRecipe = (action, route, recipe) => {
    if (isSelectionMode && parentRecipe) {
      // Estamos añadiendo esta receta (recipe) como sub-receta a la receta padre (parentRecipe)
      navigation.push("MaterialScreen", {
        route: "addMaterial",
        recipe: parentRecipe,
        ingredient: {
          subRecipeId: recipe.recipeId || recipe.id,
          description: recipe.name,
          cost: recipe.cost,
        },
      });
    } else {
      navigation.push(action, { route, recipe });
    }
  };

  const deleteRecipe = (recipe) => {
    Alert.alert(
      "Eliminar Receta",
      `¿Estás seguro de que deseas eliminar ${recipe.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              dispatch(actionCreators.loading());
              await apis.deleteRecipe(recipe.recipeId || recipe.id);
              ToastAndroid.show("Receta eliminada", ToastAndroid.SHORT);
              fetchRecipes();
            } catch (error) {
              console.log("Error al eliminar receta:", error);
              ToastAndroid.show("Error al eliminar receta", ToastAndroid.SHORT);
              fetchRecipes();
            }
          },
        },
      ]
    );
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
          deleteItem={deleteRecipe}
          isSelectionMode={isSelectionMode}
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