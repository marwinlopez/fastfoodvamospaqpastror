import React, { useEffect, useState, useReducer, useMemo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import apis from "../apis";
import MaterialReducer, {
  actionCreators,
  stateIngredients,
} from "../hooks/MaterialReducer";
import NebulaTextInput from "../components/NebulaTextInput";
import SelectDropdown from "react-native-select-dropdown";
import { Button } from "@rneui/themed";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";

const MaterialScreens = ({ navigation, route }) => {
  const theme = useTheme();
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [state, dispatch] = useReducer(MaterialReducer, stateIngredients);
  const [isAdd, setIsAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedValue, setSelectedValue] = useState({
    id: 0,
    name: "Seleccionar...",
  });

  useEffect(() => {
    fetchUnitOfMeasurement();
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(actionCreators.loading());
      const isEditing = route.params.route === "editMaterial";
      setIsAdd(route.params.route === "addMaterial" || isEditing);
      
      switch (route.params.route) {
        case "editMaterial": {
          const { recipe, ingredient } = route.params;
          dispatch(actionCreators.recipe(recipe));
          
          if (ingredient.subRecipeId) {
            // It's a sub-recipe ingredient
            dispatch(actionCreators.success({
              ...ingredient,
              isSubRecipe: true,
            }));
            setSelectedValue({
              id: ingredient.unitOfMeasurementId || 0,
              name: ingredient.unitOfMeasurement || "Unidades",
            });
          } else {
            apis.productForId(ingredient.productId).then((res) => {
              const prodData = res.data.product;
              const fullIngredient = {
                ...ingredient,
                priceProduct: prodData.precioCompra,
                quantityPack: prodData.cantidadPresentacion,
              };
              dispatch(actionCreators.success(fullIngredient));
              dispatch(actionCreators.product({ 
                producto: ingredient.description, 
                productoId: ingredient.productId 
              }));
              setSelectedValue({
                id: ingredient.unitOfMeasurementId || 0,
                name: ingredient.unitOfMeasurement,
              });
            }).catch(err => {
              console.log(err);
              dispatch(actionCreators.success(ingredient));
            });
          }
          break;
        }
        case "addMaterial": {
          const { product, recipe, ingredient: incomingIngredient } = route.params;
          const { ingredients } = recipe;
          dispatch(actionCreators.recipe(recipe));

          if (incomingIngredient && incomingIngredient.subRecipeId) {
            // Adding a sub-recipe
            const exists = ingredients.some((i) => i.subRecipeId === incomingIngredient.subRecipeId);
            if (exists) {
              Alert.alert(
                "Sub-Receta Existe!",
                `La receta ${incomingIngredient.description} ya está agregada.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } else {
              const newIng = {
                id: 0,
                subRecipeId: incomingIngredient.subRecipeId,
                description: incomingIngredient.description,
                quantity: "",
                unitOfMeasurementId: 3, // Assuming 3 is "Unidades" based on standard DB
                unitOfMeasurement: "Unidades",
                isSubRecipe: true,
              };
              dispatch(actionCreators.success(newIng));
              setSelectedValue({ id: 3, name: "Unidades" });
            }
          } else if (product) {
            // Adding a regular product
            const existingProd = ingredients.filter(
              (i) => i.productId === (product.productoId || product.id || product.productId)
            );
            if (existingProd.length > 0) {
              Alert.alert(
                "Producto Existe!",
                `Ya el producto ${product.producto} esta agregado, ¿Desea modificar la cantidad?`,
                [
                  { text: "Cancelar", onPress: () => null, style: "cancel" },
                  { text: "Modificar", onPress: () => null },
                ]
              );
            } else {
              const newIng = {
                id: 0,
                productId: product.productoId || product.id || product.productId,
                description: product.producto,
                priceProduct: product.precioCompra,
                quantityPack: product.cantidadPresentacion,
                quantityUnitOf: product.cantidadEmpaque,
                quantity: "",
                unitOfMeasurementId: product.unidadMedidaId,
                unitOfMeasurement: product.unidadMedida,
              };
              dispatch(actionCreators.success(newIng));
              dispatch(actionCreators.product(product));
              setSelectedValue({
                id: newIng.unitOfMeasurementId,
                name: newIng.unitOfMeasurement,
              });
            }
          }
          break;
        }
        default:
          console.log("no existe parametro");
          break;
      }
    });
    return unsubscribe;
  }, [navigation, route]);

  const { ingredient, recipe, unitOf, product } = state;

  useEffect(() => {
    if (ingredient) {
      const itemQuantity = ingredient.quantity || ingredient.quantityUnitOfMeasurement;
      if (itemQuantity !== undefined && itemQuantity !== null) {
        setQuantity(itemQuantity.toString());
      }
      if (ingredient.unitOfMeasurement) {
        setSelectedValue({
          id: ingredient.unitOfMeasurementId || 0,
          name: ingredient.unitOfMeasurement,
        });
      }
    }
  }, [ingredient]);

  const disabled =
    !quantity ||
    quantity.toString().trim() === "" ||
    selectedValue.name === "Seleccionar...";

  const fetchUnitOfMeasurement = async () => {
    // 1. Cargar de la caché local para evitar bloquear la pantalla
    const cached = await BackgroundSyncService.getCachedUnits();
    if (cached && cached.length > 1) {
      dispatch(actionCreators.unitof(cached));
    }

    // 2. Traer en segundo plano/asíncronamente la última versión del servidor
    try {
      const { data } = await apis.unitOfMeasurements();
      const { unitOf } = data;
      if (unitOf && unitOf.length > 0) {
        const unit = ["Seleccionar..."];
        unitOf.forEach(({ name }) => {
          unit.push(name);
        });
        dispatch(actionCreators.unitof(unit));
        BackgroundSyncService.preloadCatalogCache(); // Actualizar caché local de fondo
      }
    } catch (error) {
      console.log("[MaterialScreens] Sincronización asíncrona de fondo falló (usando caché):", error);
    }
  };

  const redirectActionLeft = () => {
    navigation.push("RecipeScreen", {
      route: "editRecipe",
      recipe: recipe,
    });
  };

  const onSelect = (item, index) => {
    setSelectedValue({ id: index, name: item });
  };

  const addQuantityRecipe = async () => {
    if (saving) return;
    let id = 0;
    if (selectedValue != null && quantity > 0) {
      setSaving(true);
      try {
        // El id puede venir como recipeId o id (string); 0/vacío = receta nueva
        const existingRecipeId = recipe.recipeId ?? recipe.id;
        if (!existingRecipeId || existingRecipeId === 0 || existingRecipeId === "0") {
          try {
            const data = await actionCreators.addRecipe({
              id: 0,
              name: recipe.name,
              cost: 0,
              coin: "USD",
              isActive: true,
            });
            id = data.recipeId || data.id;
          } catch (error) {
            ToastAndroid.show(
              "Error al Guardar la receta",
              ToastAndroid.CENTER
            );
          }
        } else {
          id = existingRecipeId;
        }

        const ingredientPayload = {
          id: route.params.route === "editMaterial" ? ingredient.idIngredient : 0,
          recipeId: id,
          ...(ingredient.isSubRecipe 
              ? { subRecipeId: ingredient.subRecipeId } 
              : { productId: product?.productoId || product?.productId || ingredient.productId }),
          unitOfMeasurement: selectedValue.name,
          quantityUnitOfMeasurement: quantity,
          fixedCost: 0,
          isActive: 1,
        };

        // Intentar guardar en el servidor inmediatamente
        try {
          let resp;
          if (route.params.route === "editMaterial") {
            resp = await apis.updateIngredient(ingredient.idIngredient, ingredientPayload);
          } else {
            resp = await actionCreators.addIngredient(ingredientPayload);
          }
          if (resp) {
            navigation.push("RecipeScreen", {
              route: "materialsAdd",
              recipeId: id,
            });
          }
        } catch (networkError) {
          console.log("[MaterialScreens] Error de red. Encolando acción para procesarse en segundo plano.", networkError);
          
          // Encolar asíncronamente en segundo plano
          await BackgroundSyncService.enqueueSyncAction("newIngredient", ingredientPayload);
          
          // Modificación local simulada
          recipe.ingredients.push({
            id: Date.now(),
            description: ingredient.isSubRecipe ? ingredient.description : product.producto,
            priceProduct: ingredient.isSubRecipe ? ingredient.cost : product.precioCompra,
            quantity: quantity,
            unitOfMeasurement: selectedValue.name,
            subRecipeId: ingredient.isSubRecipe ? ingredient.subRecipeId : null,
            productId: ingredient.isSubRecipe ? null : (product.productoId || product.productId),
          });

          ToastAndroid.show(
            "Guardado local (se sincronizará en segundo plano)",
            ToastAndroid.LONG
          );

          navigation.push("RecipeScreen", {
            route: "materialsAdd",
            recipeId: id,
            recipe: recipe, // pasar receta modificada
          });
        }
      } catch (error) {
        console.log(error);
        ToastAndroid.show(
          "Error al Guardar los ingrediente",
          ToastAndroid.CENTER
        );
      } finally {
        setSaving(false);
      }
    } else {
      setIsError(!isError);
      const msgError =
        !selectedValue && quantity === 0
          ? `Debe agregara la cantidad a usar y seleccionar una Unidad de medida`
          : !selectedValue && quantity > 0
          ? `Debe seleccionar una Unidad de medida`
          : selectedValue && quantity === 0
          ? `Debe agregara la cantidad a usar`
          : `Error Inesperado`;
      ToastAndroid.show(msgError, ToastAndroid.CENTER);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={redirectActionLeft}
        title={
          ingredient && ingredient.idIngredient > 0
            ? "Modificar Cantidad"
            : "Añadir Cantidad"
        }
        subtitle="Indica la cantidad y unidad de medida del ingrediente."
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>Receta Activa</Text>
          <Text style={styles.recipeNameText}>
            {recipe?.name || "Sin Nombre"}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descripción</Text>
            <View style={styles.readOnlyField}>
              <Feather
                name="layers"
                size={16}
                color={theme.textSecondary}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.readOnlyText}>
                {ingredient?.description || "Cargando..."}
              </Text>
            </View>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {money}{" "}
                  {ingredient?.priceProduct !== undefined ? Number(ingredient.priceProduct).toFixed(2) : "0.00"}
                </Text>
              </View>
            </View>

            {!ingredient?.isSubRecipe && (
              <View style={[styles.formGroup, { flex: 1.2 }]}>
                <Text style={styles.label}>Cantidad Empaque</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {Number(ingredient?.quantityPack || 0).toFixed(2)}{" "}
                    {ingredient?.unitOfMeasurement || ""}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cantidad a usar</Text>
            <NebulaTextInput
              theme={theme}
              inputMode="numeric"
              defaultValue={
                ingredient?.quantity || ingredient?.quantityUnitOfMeasurement
                  ? Number(
                      ingredient.quantity ?? ingredient.quantityUnitOfMeasurement
                    ).toFixed(2)
                  : ""
              }
              placeholder="Ej. 1.5"
              onChangeText={(text) => {
                setQuantity(text);
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Unid. Medida</Text>
            <SelectDropdown
              data={unitOf}
              defaultValueByIndex={selectedValue.id}
              defaultButtonText={selectedValue.name}
              defaultValue={selectedValue.name}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              dropdownStyle={styles.dropdownMenu}
              rowStyle={styles.dropdownRow}
              rowTextStyle={styles.dropdownRowText}
              renderDropdownIcon={(isOpened) => (
                <Feather
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={theme.textSecondary}
                  size={18}
                />
              )}
              dropdownIconPosition="right"
              onSelect={(selectedItem, index) => {
                onSelect(selectedItem, index);
              }}
              buttonTextAfterSelection={(selectedItem) => selectedItem}
              rowTextForSelection={(item) => item}
            />
          </View>

          <Button
            containerStyle={styles.buttonContainer}
            disabled={disabled || saving}
            loading={saving}
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonDisabledStyle}
            disabledTitleStyle={styles.buttonDisabledTitleStyle}
            title={
              ingredient?.idIngredient > 0
                ? "Actualizar"
                : "Añadir Cantidad"
            }
            titleStyle={styles.buttonTitle}
            onPress={addQuantityRecipe}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  contextCard: {
    backgroundColor: t.brand + "14",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: t.brand + "26",
  },
  contextLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: t.brand,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  recipeNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: t.textPrimary,
  },
  formCard: {
    backgroundColor: t.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 16,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 18,
  },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.inputBg,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 16,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: "600",
    color: t.textPrimary,
  },
  dropdownButton: {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
    width: "100%",
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    color: t.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  dropdownMenu: {
    backgroundColor: t.surface,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  dropdownRow: {
    borderBottomColor: t.border,
    height: 44,
  },
  dropdownRowText: {
    color: t.textPrimary,
    fontSize: 14,
    textAlign: "left",
    paddingLeft: 16,
  },
  buttonContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  buttonStyle: {
    backgroundColor: t.brand,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonDisabledStyle: {
    backgroundColor: t.brand + "80",
  },
  buttonDisabledTitleStyle: {
    color: "#E4D5FF",
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default MaterialScreens;
