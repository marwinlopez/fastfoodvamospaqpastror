import React, { useState, useEffect, useReducer, useMemo } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB } from "@rneui/themed";
import MaterialsReducer, {
  actionCreators,
  initialState,
} from "../hooks/MaterialsReducer";
import apis from "../apis";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import useGlobal from "../hooks/useGlobal";
import useTheme from "../hooks/useTheme";

const MaterialsScreens = ({ navigation, route }) => {
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [state, dispatch] = useReducer(MaterialsReducer, initialState);
  const [products, setProducts] = useState(state.products);
  const [refreshing] = useState(false);
  const { recipe } = route.params || {};

  // Estado del modal de reposición de inventario
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockMode, setRestockMode] = useState("empaque"); // "empaque" | "unidad"
  const [restockSaving, setRestockSaving] = useState(false);

  const backActionHandler = () => {
    redirectActionLeft();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backActionHandler
    );
    return () => subscription.remove();
  }, [navigation, route]);

  // Helper: deduplica por productId, dando prioridad al último elemento visto
  const deduplicateById = (list) => {
    const seen = new Map();
    list.forEach((p) => {
      const id = p.productId || p.id || p.productoId;
      if (id) seen.set(id.toString(), p);
    });
    return Array.from(seen.values());
  };

  const mapProducts = (list) =>
    deduplicateById(
      list.map((p) => ({
        ...p,
        productId: p.productId || p.id || p.productoId || Date.now().toString(),
        productoId: p.productId || p.id || p.productoId,
      }))
    );

  const fetchMaterials = async () => {
    try {
      const { data } = await apis.allProducts();
      const productsList = data?.data || data?.products || (Array.isArray(data) ? data : null);

      if (productsList && productsList.length > 0) {
        const mapped = mapProducts(productsList);
        dispatch(actionCreators.success(mapped));
        BackgroundSyncService.preloadCatalogCache();
      } else {
        dispatch(actionCreators.success([]));
      }
    } catch (error) {
      console.log("[MaterialsScreens] Error de red, usando caché:", error);
      const cached = await BackgroundSyncService.getCachedProducts();
      if (cached && cached.length > 0) {
        dispatch(actionCreators.success(mapProducts(cached)));
      } else {
        dispatch(actionCreators.success([]));
      }
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchMaterials();

    // ⚡ Polling cada 15 segundos para sincronizar con otros dispositivos
    const interval = setInterval(() => {
      fetchMaterials();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProducts(state.products);
  }, [state]);

  const { loading, error } = state;

  const redirectActionLeft = () => {
    if (!recipe) {
      navigation.navigate("HomeScreen");
      return;
    }
    // El id puede venir como recipeId o id (string); 0 = receta nueva sin guardar
    const recipeId = recipe.recipeId ?? recipe.id;
    if (recipeId && recipeId !== 0 && recipeId !== "0") {
      navigation.push("RecipeScreen", { route: "materialsAdd", recipeId });
    } else {
      // Receta nueva aún sin guardar: volver conservando el estado local
      navigation.push("RecipeScreen", { route: "newRecipe", recipe });
    }
  };

  const handleSearch = (text) => {
    if (!text || text.trim() === "") {
      setProducts(state.products);
      return;
    }
    const query = text.toLowerCase();
    const filtered = state.products.filter((item) =>
      item.producto.toLowerCase().includes(query)
    );
    setProducts(filtered);
  };

  const addIngredients = () => {
    navigation.navigate("MaterialScreens", { recipe: recipe });
  };

  const openRestock = (item) => {
    setRestockItem(item);
    setRestockQty("");
    setRestockMode("empaque");
  };

  // Unidades individuales que se sumarían al stock según el modo elegido
  const computeRestockUnits = () => {
    const qty = parseFloat(restockQty) || 0;
    if (qty <= 0) return 0;
    if (restockMode === "empaque") {
      const unitsPerPack = parseFloat(restockItem?.cantidadEmpaque) || 1;
      return qty * unitsPerPack;
    }
    return qty;
  };

  const handleRestock = async () => {
    const unidades = computeRestockUnits();
    if (unidades <= 0) {
      ToastAndroid.show("Ingresa una cantidad válida", ToastAndroid.SHORT);
      return;
    }
    const productId = restockItem.productId || restockItem.id;
    setRestockSaving(true);
    try {
      await apis.restockProduct(productId, { unidades });
      ToastAndroid.show(
        `Stock actualizado: +${unidades.toFixed(2)} unidades`,
        ToastAndroid.SHORT
      );
      setRestockItem(null);
      fetchMaterials();
    } catch (error) {
      if (error.response) {
        console.log("[MaterialsScreens] Error al reponer:", error);
        ToastAndroid.show("Error al reponer el inventario", ToastAndroid.SHORT);
      } else {
        // Sin conexión: encolar para sincronizar en segundo plano
        await BackgroundSyncService.enqueueSyncAction("restockProduct", {
          id: productId,
          unidades,
        });
        ToastAndroid.show(
          "Reposición guardada local (se sincronizará)",
          ToastAndroid.LONG
        );
        setRestockItem(null);
      }
    } finally {
      setRestockSaving(false);
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={redirectActionLeft}
        title={recipe ? "Añadir a la Receta" : "Inventario"}
        subtitle={
          recipe
            ? "Selecciona un producto para agregar."
            : "Consulta y gestiona los productos en existencia."
        }
      />

      <View style={styles.searchBarContainer}>
        <Feather name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ingrediente..."
          placeholderTextColor={theme.textSecondary}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.brand} />
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={products}
            keyExtractor={(item) => item.productId.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Feather name="folder-minus" size={40} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No existen productos disponibles</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (recipe) {
                    navigation.push("MaterialScreen", {
                      route: "addMaterial",
                      product: item,
                      recipe: recipe,
                    });
                  } else {
                    navigation.push("NewProductScreen", {
                      product: item,
                      recipe: null,
                    });
                  }
                }}
                style={styles.card}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.iconWrapper}>
                    <Feather name="package" size={20} color={theme.brand} />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.producto}
                    </Text>
                    <Text style={styles.presentationText}>
                      Empaque: {Number(item.cantidadEmpaque || 0).toFixed(0)} ud ×{" "}
                      {Number(item.cantidadPresentacion || 0).toFixed(2)} {item.unidadMedida || ""}
                    </Text>
                    {!recipe && (
                      <TouchableOpacity
                        style={styles.restockButton}
                        onPress={() => openRestock(item)}
                      >
                        <Feather name="plus-square" size={13} color={theme.brand} />
                        <Text style={styles.restockButtonText}>Reponer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.priceValue}>
                    {money} {Number(item.precioCompra || 0).toFixed(2)}
                  </Text>
                  <View style={[
                    styles.stockBadge,
                    { backgroundColor: Number(item.stock || 0) > 0 ? "#E8F5E9" : "#FFEBEE" }
                  ]}>
                    <Text style={[
                      styles.stockText,
                      { color: Number(item.stock || 0) > 0 ? "#2E7D32" : "#C62828" }
                    ]}>
                      Stock: {Number(item.stock || 0).toFixed(2)} ud
                    </Text>
                  </View>
                </View>
                {recipe && (
                  <View style={styles.addIconWrap}>
                    <Feather name="plus-circle" size={22} color={theme.brand} />
                  </View>
                )}
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchMaterials}
                colors={[theme.brand]}
              />
            }
            numColumns={1}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Modal de Reposición de Inventario */}
      <Modal
        visible={restockItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRestockItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reponer Inventario</Text>
            <Text style={styles.modalProductName}>{restockItem?.producto}</Text>
            <Text style={styles.modalInfoText}>
              1 empaque = {Number(restockItem?.cantidadEmpaque || 1).toFixed(0)} ud ×{" "}
              {Number(restockItem?.cantidadPresentacion || 0).toFixed(2)}{" "}
              {restockItem?.unidadMedida || ""} · Stock actual:{" "}
              {Number(restockItem?.stock || 0).toFixed(2)} ud
            </Text>

            {/* Selector Empaques / Unidades */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[
                  styles.modeChip,
                  restockMode === "empaque" && styles.modeChipActive,
                ]}
                onPress={() => setRestockMode("empaque")}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    restockMode === "empaque" && styles.modeChipTextActive,
                  ]}
                >
                  Empaques
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeChip,
                  restockMode === "unidad" && styles.modeChipActive,
                ]}
                onPress={() => setRestockMode("unidad")}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    restockMode === "unidad" && styles.modeChipTextActive,
                  ]}
                >
                  Unidades
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder={
                restockMode === "empaque"
                  ? "Cantidad de empaques (ej. 1 o 0.5)"
                  : "Cantidad de unidades (ej. 12)"
              }
              placeholderTextColor={theme.textSecondary}
              inputMode="numeric"
              value={restockQty}
              onChangeText={setRestockQty}
            />

            {computeRestockUnits() > 0 && (
              <Text style={styles.modalPreviewText}>
                Se sumarán {computeRestockUnits().toFixed(2)} unidades → stock
                final:{" "}
                {(Number(restockItem?.stock || 0) + computeRestockUnits()).toFixed(2)}{" "}
                ud
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setRestockItem(null)}
                disabled={restockSaving}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  (computeRestockUnits() <= 0 || restockSaving) && { opacity: 0.5 },
                ]}
                onPress={handleRestock}
                disabled={computeRestockUnits() <= 0 || restockSaving}
              >
                <Text style={styles.modalConfirmText}>
                  {restockSaving ? "Guardando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FAB
        visible={true}
        onPress={() =>
          navigation.push("NewProductScreen", {
            recipe: recipe,
          })
        }
        placement="right"
        title="Nuevo Producto"
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
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.inputBg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: t.textPrimary,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80, // Espacio para el FAB flotante
  },
  emptyContainer: {
    paddingVertical: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.surface,
    borderRadius: 20,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: t.textSecondary,
    marginTop: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: t.surface,
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.border,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: t.brand + "1A", // Fondo suave de marca
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: t.success,
    marginBottom: 6,
  },
  stockBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
  },
  presentationText: {
    fontSize: 11,
    color: t.textSecondary,
    fontWeight: "600",
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  addIconWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
  restockButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: t.brand + "1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  restockButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: t.brand,
    marginLeft: 4,
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
    marginBottom: 4,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: t.brand,
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 12,
    color: t.textSecondary,
    lineHeight: 17,
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: t.inputBg,
  },
  modeChipActive: {
    backgroundColor: t.brand,
    borderColor: t.brand,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textSecondary,
  },
  modeChipTextActive: {
    color: "#FFFFFF",
  },
  modalInput: {
    backgroundColor: t.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: t.textPrimary,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: 10,
  },
  modalPreviewText: {
    fontSize: 12,
    fontWeight: "700",
    color: t.success,
    marginBottom: 12,
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

export default MaterialsScreens;
