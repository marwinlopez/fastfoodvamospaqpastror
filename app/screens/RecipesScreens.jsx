import React, { useEffect, useReducer, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Alert,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "@rneui/themed";
import RecipesReducer, { actionCreators, initialState } from "../hooks/RecipesReducer";
import apis from "../apis";
import ItemsRecipes from "../components/ItemsRecipes";
import ScreenHeader from "../components/ScreenHeader";
import useTheme from "../hooks/useTheme";
import { calculateMaxProduction } from "../utils/recipeYield";

const RecipesScreens = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [state, dispatch] = useReducer(RecipesReducer, initialState);
  const [yieldMap, setYieldMap] = useState({});
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

  // Cuántas porciones de cada receta alcanza a producir el inventario
  // actual. Requiere el detalle completo (con ingredientes) de todas las
  // recetas, no el listado resumido que ya usa el reducer para la lista.
  const fetchYieldMap = async () => {
    try {
      const [prodRes, recipeRes] = await Promise.all([
        apis.allProducts().catch(() => null),
        apis.recipeAll().catch(() => null),
      ]);
      const listProds = prodRes?.data?.data || prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
      const summaryList = recipeRes?.data?.recipes || (Array.isArray(recipeRes?.data) ? recipeRes.data : []);

      const detailedRecipes = await Promise.all(
        summaryList.map((r) =>
          apis.recipeForId(r.recipeId || r.id).then((res) => res?.data?.recipe).catch(() => null)
        )
      );
      const validRecipes = detailedRecipes.filter(Boolean);

      const map = {};
      validRecipes.forEach((rec) => {
        const id = rec.recipeId || rec.id;
        map[id] = calculateMaxProduction(rec, listProds, validRecipes);
      });
      setYieldMap(map);
    } catch (err) {
      console.log("Error calculando porciones producibles:", err);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchYieldMap();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchRecipes();
      fetchYieldMap();
    });
    return unsubscribe;
  }, [navigation]);

  const redirectActionLeft = () => {
    if (isSelectionMode && parentRecipe) {
      // Volver al detalle de la receta desde la que se abrió el selector
      const recipeId = parentRecipe.recipeId ?? parentRecipe.id;
      if (recipeId && recipeId !== 0 && recipeId !== "0") {
        navigation.push("RecipeScreen", { route: "materialsAdd", recipeId });
      } else {
        navigation.push("RecipeScreen", { route: "newRecipe", recipe: parentRecipe });
      }
    } else {
      navigation.navigate("HomeScreen");
    }
  };

  const editRecipe = (action, route, recipe) => {
    if (isSelectionMode && parentRecipe) {
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
        <ActivityIndicator size="large" color={theme.brand} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={redirectActionLeft}
        title={isSelectionMode ? "Seleccionar Sub-Receta" : "Recetas"}
        subtitle={
          isSelectionMode
            ? "Elige una receta existente para agregarla como ingrediente."
            : "Crea y administra las recetas de tu cocina."
        }
      />

      <View style={styles.content}>
        <ItemsRecipes
          recipes={recipes}
          edit={editRecipe}
          deleteItem={deleteRecipe}
          isSelectionMode={isSelectionMode}
          onRefresh={fetchRecipes}
          yieldMap={yieldMap}
        />
      </View>

      <FAB
        visible={true}
        onPress={() => navigation.push("RecipeScreen", { route: "newRecipe", recipe: null })}
        placement="right"
        title={"Nueva Receta"}
        icon={{ name: "add", color: "white" }}
        color={theme.brand}
        buttonStyle={styles.fabStyle}
      />
    </SafeAreaView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fabStyle: {
    borderRadius: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default RecipesScreens;
