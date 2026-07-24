import React, { useEffect, useReducer, useState, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import NebulaTextInput from "../components/NebulaTextInput";
import ScreenHeader from "../components/ScreenHeader";
import RecipeReducer, {
  actionCreators,
  initialState,
} from "../hooks/RecipeReducer";
import { Button } from "@rneui/themed";
import apis from "../apis";
import { Feather } from "@expo/vector-icons";
import useGlobal from "../hooks/useGlobal";
import useTheme from "../hooks/useTheme";

const RecipeScreens = ({ navigation, route }) => {
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [state, dispatch] = useReducer(RecipeReducer, initialState);
  const [saving, setSaving] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [recipesList, setRecipesList] = useState([]);

  // Modal de mano de obra: null | { index (-1 = nuevo), role, rate, hours }
  const [laborModal, setLaborModal] = useState(null);
  const [laborSaving, setLaborSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      dispatch(actionCreators.loading());
      const { recipe } = route.params;
      switch (route.params.route) {
        case "editRecipe":
          // Carga inicial rápida con los datos básicos de la lista
          if (recipe && typeof recipe === "object" && recipe.name) {
            dispatch(actionCreators.success(recipe));
          }
          
          // Siempre buscamos los detalles completos en la API (ingredientes)
          const searchId = typeof recipe === "object" ? (recipe.recipeId || recipe.id) : recipe;
          if (searchId) {
            actionCreators.editRecipe(searchId).then((data) => {
              dispatch(actionCreators.success(data));
            }).catch(() => {
              console.log("[RecipeScreens] Error fetching full recipe details");
              dispatch(actionCreators.failure());
            });
          }
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
  }, [navigation, route]);

  const { isAddQuantity, recipe } = state;

  // Cargar productos y recetas para cálculo de porciones disponibles a producir
  useEffect(() => {
    const loadYieldData = async () => {
      try {
        const cachedProds = await apis.allProducts().catch(() => null);
        const listProds = cachedProds?.data?.data || cachedProds?.data?.products || (Array.isArray(cachedProds?.data) ? cachedProds.data : []);
        if (listProds.length > 0) {
          setProductsList(listProds);
        }
      } catch (err) {
        console.log("Error loading products for yield calculation:", err);
      }

      try {
        const recipeRes = await apis.recipeAll().catch(() => null);
        const listRecipes = recipeRes?.data?.recipes || (Array.isArray(recipeRes?.data) ? recipeRes.data : []);
        setRecipesList(listRecipes);
      } catch (err) {
        console.log("Error loading recipes for yield calculation:", err);
      }
    };
    loadYieldData();
  }, [recipe]);

  const convertUnits = (value, fromUnit, toUnit) => {
    const from = (fromUnit || "").toLowerCase().trim();
    const to = (toUnit || "").toLowerCase().trim();
    if (from === to) return value;
    if (from === "kilogramos" && to === "gramos") return value * 1000;
    if (from === "gramos" && to === "kilogramos") return value / 1000;
    if (from === "litros" && to === "mililitros") return value * 1000;
    if (from === "mililitros" && to === "litros") return value / 1000;
    if (from === "libras" && to === "gramos") return value * 453.592;
    if (from === "gramos" && to === "libras") return value / 453.592;
    return value;
  };

  const calculateMaxProduction = (rec, prods, recs, visited = new Set()) => {
    if (!rec || !rec.ingredients || rec.ingredients.length === 0) return 0;
    
    const recId = rec.recipeId || rec.id;
    if (recId) {
      if (visited.has(recId)) return 0;
      visited.add(recId);
    }

    let minProduction = Infinity;

    for (const ing of rec.ingredients) {
      const isSubRecipe = ing.subRecipeId !== null && ing.subRecipeId !== undefined;
      const ingQty = parseFloat(ing.quantity || ing.quantityUnitOfMeasurement || 0);
      if (ingQty <= 0) continue;

      if (isSubRecipe) {
        const subRec = recs.find(r => (r.recipeId || r.id) === ing.subRecipeId);
        if (subRec) {
          const subRecMax = calculateMaxProduction(subRec, prods, recs, new Set(visited));
          const ingredientMax = subRecMax / ingQty;
          minProduction = Math.min(minProduction, ingredientMax);
        } else {
          minProduction = 0;
        }
      } else {
        const pId = ing.productId || ing.id;
        const prod = prods.find(p => (p.productId || p.id || p.productoId) === pId);
        if (prod) {
          // Stock disponible = unidades individuales × contenido por unidad
          const productStock = parseFloat(prod.cantidadPresentacion || 0) * parseFloat(prod.stock || 0);
          const availableStock = convertUnits(productStock, prod.unidadMedida, ing.unitOfMeasurement);
          const ingredientMax = availableStock / ingQty;
          minProduction = Math.min(minProduction, ingredientMax);
        } else {
          minProduction = 0;
        }
      }
    }

    return minProduction === Infinity ? 0 : Math.floor(minProduction);
  };

  const maxProduceable = calculateMaxProduction(recipe, productsList, recipesList);

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

  const saveRecipeDetails = async () => {
    if (!recipe?.name?.trim()) {
      ToastAndroid.show("El nombre no puede estar vacío", ToastAndroid.SHORT);
      return;
    }
    setSaving(true);
    try {
      await apis.updateRecipe(recipe.recipeId || recipe.id, { 
        name: recipe.name.trim(),
        merma: parseFloat(recipe.merma || 0)
      });
      ToastAndroid.show("Detalles actualizados con éxito", ToastAndroid.SHORT);
      // Recargar receta para obtener el rendimiento recalculado
      getRecipeId(recipe.recipeId || recipe.id);
      // No navegamos atrás para que el usuario pueda ver el nuevo rendimiento
    } catch (err) {
      console.log("[RecipeScreens] Error al guardar detalles:", err);
      ToastAndroid.show("Error al guardar. Intenta de nuevo.", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  const addIngredients = () => {
    navigation.navigate("MaterialsScreen", { recipe: recipe });
  };

  // --- Mano de obra ---
  const laborList = Array.isArray(recipe?.labor) ? recipe.labor : [];
  const laborCost = laborList.reduce(
    (sum, l) => sum + (parseFloat(l.hourlyRate) || 0) * (parseFloat(l.hours) || 0),
    0
  );
  const insumosCost = (recipe?.ingredients || []).reduce(
    (sum, i) => sum + (parseFloat(i.cost) || 0),
    0
  );

  const saveLabor = async (newLabor) => {
    setLaborSaving(true);
    try {
      await apis.updateRecipe(recipe.recipeId || recipe.id, { labor: newLabor });
      setLaborModal(null);
      ToastAndroid.show("Mano de obra actualizada", ToastAndroid.SHORT);
      // Recargar receta con los costos recalculados por el servidor
      getRecipeId(recipe.recipeId || recipe.id);
    } catch (err) {
      console.log("[RecipeScreens] Error al guardar mano de obra:", err);
      ToastAndroid.show("Error al guardar. Intenta de nuevo.", ToastAndroid.SHORT);
    } finally {
      setLaborSaving(false);
    }
  };

  const confirmLaborModal = () => {
    const role = (laborModal?.role || "").trim();
    const rate = parseFloat(laborModal?.rate);
    const hours = parseFloat(laborModal?.hours);
    if (!role || !(rate > 0) || !(hours > 0)) {
      ToastAndroid.show(
        "Completa rol, tarifa y horas con valores válidos",
        ToastAndroid.SHORT
      );
      return;
    }
    const entry = { role: role.toUpperCase(), hourlyRate: rate, hours };
    const newLabor =
      laborModal.index >= 0
        ? laborList.map((l, i) => (i === laborModal.index ? entry : l))
        : [...laborList, entry];
    saveLabor(newLabor);
  };

  const deleteLabor = (index) => {
    const entry = laborList[index];
    Alert.alert(
      "Eliminar Mano de Obra",
      `¿Quitar ${entry.role} de la receta?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => saveLabor(laborList.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  const handleEditIngredient = (item) => {
    navigation.push("MaterialScreen", {
      route: "editMaterial",
      recipe: recipe,
      ingredient: item,
    });
  };

  const handleDeleteIngredient = (item) => {
    Alert.alert(
      "Eliminar Ingrediente",
      `¿Estás seguro de que deseas eliminar ${item.description} de la receta?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              dispatch(actionCreators.loading());
              await apis.deleteIngredient(item.idIngredient);
              ToastAndroid.show("Ingrediente eliminado", ToastAndroid.SHORT);
              // Refrescar receta
              const searchId = recipe.recipeId || recipe.id;
              const { data } = await actionCreators.editRecipe(searchId);
              dispatch(actionCreators.success(data));
            } catch (error) {
              console.log("Error al eliminar ingrediente:", error);
              ToastAndroid.show("Error al eliminar ingrediente", ToastAndroid.SHORT);
              dispatch(actionCreators.success(recipe)); // Restaurar estado
            }
          },
        },
      ]
    );
  };

  const ingredientsList = recipe?.ingredients || [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader theme={theme} onBack={redirectActionLeft} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        {/* Datos de la receta */}
        <View style={styles.formCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={[styles.formGroup, { flex: 2, marginRight: 8, marginBottom: 0 }]}>
              <Text style={styles.label}>Nombre de la Receta</Text>
              <NebulaTextInput
                theme={theme}
                defaultValue={recipe?.name}
                onChangeText={(text) => {
                  dispatch(actionCreators.changeName(text.trim()));
                }}
                placeholder="Ej. Hamburguesa Doble"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginBottom: 0 }]}>
              <Text style={styles.label}>Merma (%)</Text>
              <NebulaTextInput
                theme={theme}
                defaultValue={recipe?.merma !== undefined ? Number(recipe.merma).toFixed(2) : "0.00"}
                inputMode="numeric"
                onChangeText={(text) => {
                  if (recipe) recipe.merma = text.replace(/[^0-9.]/g, '');
                }}
                placeholder="Ej. 10"
              />
            </View>
          </View>

          {recipe?.id ? (
            <Button
              containerStyle={styles.saveButtonContainer}
              disabled={isAddQuantity || saving}
              loading={saving}
              buttonStyle={styles.saveButtonStyle}
              disabledStyle={styles.buttonDisabledStyle}
              disabledTitleStyle={styles.buttonDisabledTitleStyle}
              title="Guardar Detalles"
              titleStyle={styles.buttonTitle}
              icon={{
                name: "save",
                type: "feather",
                size: 15,
                color: isAddQuantity || saving ? theme.textSecondary : "white",
              }}
              iconContainerStyle={{ marginRight: 6 }}
              onPress={saveRecipeDetails}
            />
          ) : null}
        </View>

        {/* Cantidad disponible a producir */}
        {ingredientsList.length > 0 ? (
          <View
            style={[
              styles.yieldContainer,
              {
                backgroundColor:
                  (maxProduceable > 0 ? theme.success : theme.danger) + "1F",
              },
            ]}
          >
            <Feather
              name="info"
              size={16}
              color={maxProduceable > 0 ? theme.success : theme.danger}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.yieldText,
                { color: maxProduceable > 0 ? theme.success : theme.danger },
              ]}
            >
              Puedes producir <Text style={{ fontWeight: "800" }}>{maxProduceable} porciones</Text> con el inventario actual.
            </Text>
          </View>
        ) : null}

        {/* Ingredientes */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Ingredientes{ingredientsList.length > 0 ? ` (${ingredientsList.length})` : ""}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.addChip, isAddQuantity && styles.addChipDisabled]}
              onPress={addIngredients}
              disabled={isAddQuantity}
            >
              <Feather name="package" size={13} color={isAddQuantity ? theme.textSecondary : theme.brand} />
              <Text style={[styles.addChipText, isAddQuantity && styles.addChipTextDisabled]}>
                Producto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addChip, styles.addChipGreen, isAddQuantity && styles.addChipDisabled]}
              onPress={() => navigation.navigate("RecipesScreen", { isSelectionMode: true, recipe: recipe })}
              disabled={isAddQuantity}
            >
              <Feather name="book" size={13} color={isAddQuantity ? theme.textSecondary : theme.success} />
              <Text style={[styles.addChipText, { color: theme.success }, isAddQuantity && styles.addChipTextDisabled]}>
                Sub-Receta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {ingredientsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="layers" size={32} color={theme.textSecondary} />
            <Text style={styles.emptyText}>Sin ingredientes añadidos</Text>
            <Text style={styles.emptyHintText}>
              {isAddQuantity
                ? "Escribe el nombre de la receta para empezar."
                : "Usa los botones de arriba para agregar productos o sub-recetas."}
            </Text>
          </View>
        ) : (
          ingredientsList.map((item, index) => (
            <View key={index} style={styles.ingredientCard}>
              <View style={styles.cardLeft}>
                <View style={styles.bulletIconWrapper}>
                  <Feather
                    name={item.subRecipeId ? "book" : "package"}
                    size={15}
                    color={item.subRecipeId ? theme.success : theme.brand}
                  />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.ingredientName} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={styles.ingredientQty}>
                    {Number(item.quantity ?? item.quantityUnitOfMeasurement ?? 0).toFixed(2)}{" "}
                    {item.unitOfMeasurement} · {money}{" "}
                    {item.cost !== undefined ? Number(item.cost).toFixed(2) : "0.00"}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => handleEditIngredient(item)} style={{ padding: 8 }}>
                  <Feather name="edit-2" size={17} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteIngredient(item)} style={{ padding: 8 }}>
                  <Feather name="trash-2" size={17} color={theme.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Mano de Obra */}
        {recipe?.id ? (
          <View style={styles.laborCard}>
            <View style={styles.laborHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                Mano de Obra
              </Text>
              <TouchableOpacity
                style={styles.laborAddButton}
                onPress={() =>
                  setLaborModal({ index: -1, role: "", rate: "", hours: "" })
                }
              >
                <Feather name="plus" size={14} color={theme.brand} />
                <Text style={styles.laborAddText}>Añadir</Text>
              </TouchableOpacity>
            </View>
            {laborList.length === 0 ? (
              <Text style={styles.laborEmptyText}>
                Sin personal asignado a esta receta.
              </Text>
            ) : (
              laborList.map((l, idx) => (
                <View key={idx} style={styles.laborRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.laborRole}>{l.role}</Text>
                    <Text style={styles.laborDetail}>
                      {money} {Number(l.hourlyRate).toFixed(2)}/h ×{" "}
                      {Number(l.hours).toFixed(2)} h = {money}{" "}
                      {(
                        (parseFloat(l.hourlyRate) || 0) *
                        (parseFloat(l.hours) || 0)
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setLaborModal({
                        index: idx,
                        role: l.role,
                        rate: String(l.hourlyRate),
                        hours: String(l.hours),
                      })
                    }
                    style={{ padding: 6 }}
                  >
                    <Feather name="edit-2" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteLabor(idx)}
                    style={{ padding: 6 }}
                  >
                    <Feather name="trash-2" size={16} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : null}

      </KeyboardAwareScrollView>

      {/* Panel Financiero fijo */}
      <View style={styles.bottomPanel}>
        {recipe?.id ? (
          <Text style={styles.breakdownText}>
            Insumos: {money} {insumosCost.toFixed(2)} · M. Obra: {money}{" "}
            {laborCost.toFixed(2)} · Merma: {Number(recipe?.merma || 0).toFixed(2)}%
          </Text>
        ) : null}
        <View style={styles.financialCard}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: theme.warning + "1F" }]}>
                <Feather name="dollar-sign" size={14} color={theme.warning} />
              </View>
              <View>
                <Text style={styles.metricLabel}>Costo</Text>
                <Text style={styles.metricValue}>
                  {money} {recipe?.cost !== undefined ? Number(recipe.cost).toFixed(2) : "0.00"}
                </Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: theme.success + "1F" }]}>
                <Feather name="trending-up" size={14} color={theme.success} />
              </View>
              <View>
                <Text style={styles.metricLabel}>Ganancia</Text>
                <Text style={[styles.metricValue, { color: theme.success }]}>
                  {money} {recipe?.profit !== undefined ? Number(recipe.profit).toFixed(2) : "0.00"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: theme.success + "1F" }]}>
                <Feather name="tag" size={14} color={theme.success} />
              </View>
              <View>
                <Text style={styles.metricLabel}>Precio</Text>
                <Text style={[styles.metricValue, { color: theme.success }]}>
                  {money} {recipe?.price !== undefined ? Number(recipe.price).toFixed(2) : "0.00"}
                </Text>
              </View>
            </View>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconWrap, { backgroundColor: theme.brand + "1F" }]}>
                <Feather name="box" size={14} color={theme.brand} />
              </View>
              <View>
                <Text style={styles.metricLabel}>Rendimiento</Text>
                <Text style={[styles.metricValue, { color: theme.brand }]}>
                  {parseFloat(recipe?.weight || 0) > 0
                    ? (parseFloat(recipe.weight) >= 1000 ? `${(parseFloat(recipe.weight) / 1000).toFixed(2)} kg` : `${parseFloat(recipe.weight).toFixed(2)} g`)
                    : "0.00 g"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Modal de Mano de Obra */}
      <Modal
        visible={laborModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLaborModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {laborModal?.index >= 0 ? "Editar Mano de Obra" : "Añadir Mano de Obra"}
            </Text>

            <Text style={styles.modalLabel}>Rol / Puesto</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej. COCINERO / CHEF"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              value={laborModal?.role || ""}
              onChangeText={(t) => setLaborModal((m) => ({ ...m, role: t }))}
            />

            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalLabel}>Tarifa ({money}/hora)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. 12.50"
                  placeholderTextColor={theme.textSecondary}
                  inputMode="numeric"
                  value={laborModal?.rate || ""}
                  onChangeText={(t) => setLaborModal((m) => ({ ...m, rate: t }))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Horas</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej. 0.50"
                  placeholderTextColor={theme.textSecondary}
                  inputMode="numeric"
                  value={laborModal?.hours || ""}
                  onChangeText={(t) => setLaborModal((m) => ({ ...m, hours: t }))}
                />
              </View>
            </View>
            <Text style={styles.modalHintText}>
              Fracciones de hora: 0.25 = 15 min, 0.50 = 30 min.
            </Text>

            {parseFloat(laborModal?.rate) > 0 && parseFloat(laborModal?.hours) > 0 && (
              <Text style={styles.modalPreviewText}>
                Costo: {money}{" "}
                {(parseFloat(laborModal.rate) * parseFloat(laborModal.hours)).toFixed(2)}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setLaborModal(null)}
                disabled={laborSaving}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, laborSaving && { opacity: 0.5 }]}
                onPress={confirmLaborModal}
                disabled={laborSaving}
              >
                <Text style={styles.modalConfirmText}>
                  {laborSaving ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  formCard: {
    backgroundColor: t.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  saveButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
  },
  saveButtonStyle: {
    backgroundColor: t.brand,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonDisabledStyle: {
    backgroundColor: t.brand + "80",
  },
  buttonDisabledTitleStyle: {
    color: "#E4D5FF",
  },
  buttonTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.brand + "1A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  addChipGreen: {
    backgroundColor: t.success + "1F",
  },
  addChipDisabled: {
    backgroundColor: t.inputBg,
  },
  addChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: t.brand,
    marginLeft: 4,
  },
  addChipTextDisabled: {
    color: t.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.surface,
    borderRadius: 16,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 10,
    fontWeight: "700",
  },
  emptyHintText: {
    fontSize: 11,
    color: t.textSecondary,
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  ingredientCard: {
    backgroundColor: t.surface,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bulletIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: t.brand + "1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textContent: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 2,
  },
  ingredientQty: {
    fontSize: 11,
    color: t.textSecondary,
    fontWeight: "600",
  },
  bottomPanel: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: t.headerBg,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  financialCard: {
    backgroundColor: t.headerBg,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  metricItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  metricIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: t.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: t.textPrimary,
  },
  yieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: t.border,
  },
  yieldText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  laborCard: {
    backgroundColor: t.surface,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  laborHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  laborAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.brand + "1A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  laborAddText: {
    fontSize: 12,
    fontWeight: "700",
    color: t.brand,
    marginLeft: 4,
  },
  laborEmptyText: {
    fontSize: 12,
    color: t.textSecondary,
    fontWeight: "600",
  },
  laborRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  laborRole: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textPrimary,
  },
  laborDetail: {
    fontSize: 11,
    color: t.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  breakdownText: {
    fontSize: 11,
    fontWeight: "700",
    color: t.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: t.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: t.textPrimary,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: t.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: t.textPrimary,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: 12,
  },
  modalHintText: {
    fontSize: 11,
    color: t.textSecondary,
    marginBottom: 8,
  },
  modalPreviewText: {
    fontSize: 13,
    fontWeight: "800",
    color: t.success,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: t.textSecondary,
  },
  modalConfirmButton: {
    backgroundColor: t.brand,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default RecipeScreens;
