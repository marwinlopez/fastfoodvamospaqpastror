import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import apis from "../apis";
import { COLORS } from "../constants/themes";

const DEFAULT_IMAGES = {
  Hamburguesas: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
  Papas: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
  Bebidas: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
};

const ProductsSaleScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const fetchCategories = async () => {
    try {
      const { data } = await apis.getCategoryList();
      if (data && data.success) {
        const catNames = ["Todos", ...data.categories.map(c => c.name)];
        setCategories(catNames);
      }
    } catch (err) {
      console.log("Error loading categories:", err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data } = await apis.getMenuItems();
      if (data && data.success) {
        setMenuItems(data.menu || []);
      }
    } catch (error) {
      console.log("Error fetching menu items:", error);
      ToastAndroid.show("Error al cargar productos", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al enfocar
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchMenuItems();
    };
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (item) => {
    const id = item.id || item.menuId;
    Alert.alert(
      "Eliminar Producto",
      `¿Estás seguro de que deseas eliminar ${item.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apis.deleteMenuItem(id);
              ToastAndroid.show("Producto eliminado", ToastAndroid.SHORT);
              await fetchMenuItems();
            } catch (error) {
              console.log("Error deleting item:", error);
              ToastAndroid.show("Error al eliminar", ToastAndroid.SHORT);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Filtrado reactivo de productos
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100" }} 
            style={styles.avatar} 
          />
          <Text style={[styles.brandName, { color: COLORS.default }]}>PA Q' PASTOR</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Feather name="bell" size={22} color="#1A1D20" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Gestión de Productos</Text>
          <Text style={styles.subtitleText}>
            Administra los artículos para la venta y su disponibilidad en tienda.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Feather name="search" size={20} color="#8E9AA6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#8E9AA6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Tab Scroll */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryTab,
                    isActive ? { backgroundColor: COLORS.default } : styles.categoryTabInactive
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive ? styles.categoryTextActive : styles.categoryTextInactive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Cards List */}
        {loading && menuItems.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.default} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.productsList}>
            {filteredItems.map((item) => {
              const isAvailable = item.isActive && (item.stock !== undefined ? item.stock > 0 : true);
              const currentStock = item.stock !== undefined ? item.stock : 0;
              const displayImage = item.imageUrl || DEFAULT_IMAGES[item.category] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
              
              return (
                <View key={item.id || item.menuId} style={styles.productCard}>
                  {/* Image container with overlays */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: displayImage }} style={styles.productImage} />
                    
                    {/* Availability Badge */}
                    <View style={[
                      styles.availabilityBadge,
                      isAvailable ? styles.badgeAvailable : styles.badgeOutOfStock
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        isAvailable ? styles.badgeTextAvailable : styles.badgeTextOutOfStock
                      ]}>
                        • {isAvailable ? "DISPONIBLE" : "AGOTADO"}
                      </Text>
                    </View>

                    {/* Stock Badge */}
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>{currentStock} en inventario</Text>
                    </View>
                  </View>

                  {/* Product Details */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={[styles.productPrice, { color: COLORS.orange || "#F4511E" }]}>
                        ${parseFloat(item.price).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.productCategory}>CATEGORÍA: {item.category.toUpperCase()}</Text>

                    {/* Action buttons */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("MenuScreen", { item })}
                      >
                        <Feather name="edit-2" size={16} color="#5C6B73" style={styles.buttonIcon} />
                        <Text style={styles.editButtonText}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                        onPress={() => handleDelete(item)}
                      >
                        <Feather name="trash-2" size={18} color="#C62828" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {filteredItems.length === 0 && (
              <Text style={styles.emptyText}>No se encontraron productos</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB - Crear Producto */}
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: COLORS.default }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("MenuScreen", { item: null })}
      >
        <Feather name="plus" size={18} color="#FFF" style={styles.fabIcon} />
        <Text style={styles.fabText}>Crear Producto</Text>
      </TouchableOpacity>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Feather name="package" size={20} color={COLORS.default} />
          <Text style={[styles.footerTabText, { color: COLORS.default }]}>Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => ToastAndroid.show("Pedidos estará disponible pronto", ToastAndroid.SHORT)}
        >
          <Feather name="shopping-bag" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => ToastAndroid.show("Promos estará disponible pronto", ToastAndroid.SHORT)}
        >
          <Feather name="gift" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Promos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("SettingsScreen")}
        >
          <Feather name="settings" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bellButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  titleContainer: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D20",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1D20",
    fontWeight: "600",
  },
  categoriesContainer: {
    marginBottom: 25,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTabInactive: {
    backgroundColor: "#EAEAEA",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  categoryTextInactive: {
    color: "#5C6B73",
  },
  productsList: {
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  availabilityBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAvailable: {
    backgroundColor: "#E8F5E9",
  },
  badgeOutOfStock: {
    backgroundColor: "#FFEBEE",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  badgeTextAvailable: {
    color: "#2E7D32",
  },
  badgeTextOutOfStock: {
    color: "#C62828",
  },
  stockBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A1D20",
  },
  detailsContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1D20",
    flex: 1,
    marginRight: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
  },
  productCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E9AA6",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D20",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E9AA6",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 40,
  },
  fabButton: {
    position: "absolute",
    bottom: 84,
    right: 20,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabIcon: {
    marginRight: 6,
  },
  fabText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#FFF",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ECEFF1",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "25%",
  },
  footerTabText: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    color: "#8E9AA6",
  },
});

export default ProductsSaleScreen;
