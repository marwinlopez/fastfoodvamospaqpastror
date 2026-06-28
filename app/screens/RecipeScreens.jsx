import React, { useEffect, useReducer } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import NebulaTextInput from "../src/components/NebulaTextInput";
import { COLORS } from "../src/constants/themes";
import RecipeReducer, {
  actionCreators,
  initialState,
} from "../hooks/RecipeReducer";
import { Button } from "@rneui/themed";
import apis from "../apis";
import { Feather } from "@expo/vector-icons";

const RecipeScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(RecipeReducer, initialState);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(actionCreators.loading());
      const { recipe } = route.params;
      switch (route.params.route) {
        case "editRecipe":
          actionCreators.editRecipe(recipe).then((data) => {
            dispatch(actionCreators.success(data));
          });
          break;
        case "materialsAdd":
          const { recipeId, recipe: localRecipe } = route.params;
          if (localRecipe) {
            dispatch(actionCreators.success(localRecipe));
          } else {
            getRecipeId(recipeId);
          }
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

  const { isAddQuantity, recipe } = state;

  const redirectActionLeft = () => {
    navigation.push("RecipesScreen", { recipe: recipe });
  };

  const getRecipeId = (id) => {
    apis.recipeForId(id)
      .then(({ data }) => {
        const { recipe } = data;
        dispatch(actionCreators.success(recipe));
      })
      .catch((error) => {
        console.log("Error al cargar receta por ID (deteniendo loading):", error);
        dispatch(actionCreators.failure());
      });
  };

  const addIngredients = () => {
    navigation.navigate("MaterialsScreen", { recipe: recipe });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <Header
        title={"Recetas"}
        buttonLeft={"arrow-left"}
        actionLeft={redirectActionLeft}
        isSearch={true}
      />

      <View style={styles.content}>
        {/* Formulario Nombre Receta */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de la Receta</Text>
          <NebulaTextInput
            defaultValue={recipe?.name}
            onChangeText={(text) => {
              dispatch(actionCreators.changeName(text.trim()));
            }}
            placeholder="Ej. Hamburguesa Doble"
          />
        </View>

        {/* Acciones de Edición/Adición */}
        <View style={styles.actionsRow}>
          {recipe?.id ? (
            <>
              <Button
                containerStyle={styles.buttonContainer}
                disabled={isAddQuantity}
                buttonStyle={styles.buttonStyle}
                disabledStyle={styles.buttonDisabledStyle}
                disabledTitleStyle={styles.buttonDisabledTitleStyle}
                title="Editar Nombre"
                titleStyle={styles.buttonTitle}
                icon={{
                  name: "edit-2",
                  type: "feather",
                  size: 16,
                  color: isAddQuantity ? "#8E9AA6" : "white",
                }}
                iconContainerStyle={{ marginRight: 6 }}
                onPress={addIngredients}
              />
              <View style={{ width: 12 }} />
            </>
          ) : null}
          <Button
            containerStyle={styles.buttonContainer}
            disabled={isAddQuantity}
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonDisabledStyle}
            disabledTitleStyle={styles.buttonDisabledTitleStyle}
            title="Añadir Cantidades"
            titleStyle={styles.buttonTitle}
            icon={{
              name: "plus",
              type: "feather",
              size: 16,
              color: isAddQuantity ? "#8E9AA6" : "white",
                }}
            iconContainerStyle={{ marginRight: 6 }}
            onPress={addIngredients}
          />
        </View>

        {/* Listado de Ingredientes */}
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={recipe?.ingredients}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="layers" size={32} color="#8E9AA6" />
              <Text style={styles.emptyText}>Sin ingredientes añadidos</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.ingredientCard}>
              <View style={styles.cardLeft}>
                <View style={styles.bulletIconWrapper}>
                  <Feather name="layers" size={16} color="#5802F1" />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.ingredientName}>{item.description}</Text>
                  <Text style={styles.ingredientQty}>
                    Cantidad: {item.quantity} {item.unitOfMeasurement}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>
                    {item.coin || "USD"} {item.cost}
                  </Text>
                </View>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        {/* Panel Financiero Resumen (Dashboard) */}
        <View style={styles.financialCard}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Costo ({recipe?.coin || "USD"})</Text>
            <Text style={styles.metricValue}>{recipe?.cost || "0.00"}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Ganancia</Text>
            <Text style={styles.metricValue}>{recipe?.profit || "0"}%</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Precio ({recipe?.coin || "USD"})</Text>
            <Text style={[styles.metricValue, styles.priceValue]}>
              {recipe?.price || "0.00"}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Fondo Canvas
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E9AA6",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  buttonContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonStyle: {
    backgroundColor: "#5802F1", // Morado de marca
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonDisabledStyle: {
    backgroundColor: "#E0E0E0", // Gris suave Canvas
  },
  buttonDisabledTitleStyle: {
    color: "#8E9AA6", // Texto lavado
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E9AA6",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 13,
    color: "#8E9AA6",
    marginTop: 10,
    fontWeight: "600",
  },
  ingredientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // Sombra suave Canvas
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bulletIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#5802F110",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 2,
  },
  ingredientQty: {
    fontSize: 11,
    color: "#8E9AA6",
    fontWeight: "600",
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  costBadge: {
    backgroundColor: "#F3F4F6", // Fondo gris suave neutral
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  costText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  financialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
    // Sombras marcadas pero sutiles
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  metricColumn: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 10,
    color: "#8E9AA6",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D20",
  },
  priceValue: {
    color: "#137333", // Verde destacado para el precio de venta final
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#F3F4F6",
  },
});

export default RecipeScreens;
