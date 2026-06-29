import React, { useState, useEffect, useReducer } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { COLORS } from "../src/constants/themes";
import { FAB } from "@rneui/themed";
import MaterialsReducer, {
  actionCreators,
  initialState,
} from "../hooks/MaterialsReducer";
import apis from "../apis";
import { Feather } from "@expo/vector-icons";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MaterialsScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(MaterialsReducer, initialState);
  const [products, setProducts] = useState(state.products);
  const [refreshing] = useState(false);
  const { recipe } = route.params || {};

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
  }, []);

  // Helper: deduplica por productId, dando prioridad al último elemento visto
  const deduplicateById = (list) => {
    const seen = new Map();
    list.forEach((p) => {
      const id = p.productId || p.id || p.productoId;
      if (id) seen.set(id.toString(), p);
    });
    return Array.from(seen.values());
  };

  const fetchMaterials = async () => {
    // 1. Carga inmediata desde caché local
    const cached = await BackgroundSyncService.getCachedProducts();
    if (cached && cached.length > 0) {
      const mappedCached = cached.map((p) => ({
        ...p,
        productId: p.productId || p.id || p.productoId || Date.now().toString(),
        productoId: p.productId || p.id || p.productoId,
      }));
      dispatch(actionCreators.success(deduplicateById(mappedCached)));
    }

    // 2. Refrescar desde el servidor REST
    try {
      const { data } = await apis.allProducts();
      const productsList = data?.data || data?.products || (Array.isArray(data) ? data : null);
      const success = data?.status || data?.success || Array.isArray(data);

      if (success && productsList !== null && productsList !== undefined) {
        if (productsList.length > 0) {
          const mappedList = productsList.map((p) => ({
            ...p,
            productId: p.productId || p.id || p.productoId || Date.now().toString(),
            productoId: p.productId || p.id || p.productoId,
          }));
          const deduped = deduplicateById(mappedList);
          dispatch(actionCreators.success(deduped));
          await AsyncStorage.setItem("products_cache", JSON.stringify(deduped));
        } else {
          // El servidor devolvió una lista vacía con éxito (datos borrados)
          dispatch(actionCreators.success([]));
          await AsyncStorage.removeItem("products_cache");
        }
      } else if (!cached || cached.length === 0) {
        dispatch(actionCreators.success([]));
      }
    } catch (error) {
      console.log(
        "[MaterialsScreens] Error de red, usando caché:",
        error
      );
      if (!cached || cached.length === 0) {
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
    if (recipe && recipe.recipeId > 0) {
      navigation.push("RecipeScreen", { route: "materialsAdd", recipe: recipe });
    } else {
      navigation.navigate("HomeScreen");
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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <Header
        title={recipe ? "AÑADIR A LA RECETA" : "PRODUCTOS"}
        buttonLeft={"arrow-left"}
        actionLeft={redirectActionLeft}
        isSearch={true}
        callback={handleSearch}
        placeholderSearch="Buscar ingrediente..."
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.default} />
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
                <Feather name="folder-minus" size={40} color="#8E9AA6" />
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
                    <Feather name="package" size={20} color="#5802F1" />
                  </View>
                  <View style={styles.textContent}>
                    <Text style={styles.productName}>{item.producto}</Text>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>
                        Precio Costo: USD {item.precioCompra}
                      </Text>
                    </View>
                  </View>
                </View>
                {recipe && (
                  <View style={styles.cardRight}>
                    <Feather name="plus-circle" size={22} color="#5802F1" />
                  </View>
                )}
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchMaterials}
                colors={[COLORS.default]}
              />
            }
            numColumns={1}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <FAB
        visible={true}
        onPress={() =>
          navigation.push("NewProductScreen", {
            recipe: recipe,
          })
         
          // console.log(recipe)
        }
        placement="right"
        title="Nuevo Producto"
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
    backgroundColor: "#FAFAFA", // Fondo Canvas
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E9AA6",
    marginTop: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    // Sombras premium sutiles (Efecto Canvas)
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
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
    backgroundColor: "#5802F110", // Fondo suave púrpura
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
    color: "#1A1D20", // Texto oscuro carbón
    marginBottom: 6,
  },
  priceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F4EA", // Verde suave Canvas
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#137333", // Verde destacado
  },
  cardRight: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
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

export default MaterialsScreens;
