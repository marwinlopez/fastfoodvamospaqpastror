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

const MenuScreen = ({ navigation, route }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(["Hamburguesas", "Papas", "Bebidas"]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Hamburguesas");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [activeTab, setActiveTab] = useState("Menu");

  // Filter category state
  const [filterCategory, setFilterCategory] = useState("Hamburguesas");

  const fetchCategories = async () => {
    try {
      const { data } = await apis.getCategoryList();
      if (data && data.success && data.categories.length > 0) {
        const catNames = data.categories.map(c => c.name);
        setCategories(catNames);
        // Si la categoría actual no está en la nueva lista, seleccionamos la primera
        if (!catNames.includes(filterCategory)) {
          setFilterCategory(catNames[0]);
          setSelectedCategory(catNames[0]);
        }
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
        let items = data.menu || [];
        
        // Si está vacía, creamos los platos por defecto del screenshot
        if (items.length === 0) {
          const defaultItems = [
            {
              name: "Cheeseburger Clásica",
              price: 5.99,
              description: "Hamburguesa clásica con queso fundido y vegetales frescos.",
              category: "Hamburguesas",
              imageUrl: DEFAULT_IMAGES.Hamburguesas,
              stock: 24,
            },
            {
              name: "Papas Grandes",
              price: 3.50,
              description: "Papas fritas crujientes doradas al punto perfecto.",
              category: "Papas",
              imageUrl: DEFAULT_IMAGES.Papas,
              stock: 0,
            },
            {
              name: "Refresco XL",
              price: 2.25,
              description: "Vaso gigante de gaseosa bien fría con limón.",
              category: "Bebidas",
              imageUrl: DEFAULT_IMAGES.Bebidas,
              stock: 142,
            }
          ];
          
          for (const item of defaultItems) {
            await apis.createMenuItem(item);
          }
          
          const refreshRes = await apis.getMenuItems();
          items = refreshRes.data.menu || [];
        }
        
        setMenuItems(items);
      }
    } catch (error) {
      console.log("Error fetching menu items:", error);
      ToastAndroid.show("Error al cargar platillos", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al enfocar la pantalla
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchMenuItems();
      
      const passedItem = route.params?.item;
      if (passedItem) {
        setEditingId(passedItem.id || passedItem.menuId);
        setName(passedItem.name);
        setPrice(passedItem.price.toString());
        setDescription(passedItem.description || "");
        setSelectedCategory(passedItem.category);
        setImageUrl(passedItem.imageUrl || "");
        setStock(passedItem.stock !== undefined ? passedItem.stock.toString() : "0");
      } else {
        setEditingId(null);
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setStock("");
      }
    };
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, route]);

  const handleSave = async () => {
    if (!name.trim() || !price) {
      ToastAndroid.show("Por favor ingresa nombre y precio", ToastAndroid.SHORT);
      return;
    }

    const payload = {
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      category: selectedCategory,
      imageUrl: imageUrl || DEFAULT_IMAGES[selectedCategory] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      stock: stock ? parseInt(stock) : 0,
    };

    try {
      setLoading(true);
      if (editingId) {
        await apis.updateMenuItem(editingId, payload);
        ToastAndroid.show("Platillo actualizado", ToastAndroid.SHORT);
      } else {
        await apis.createMenuItem(payload);
        ToastAndroid.show("Platillo guardado", ToastAndroid.SHORT);
      }
      
      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("");
      setStock("");
      setEditingId(null);
      
      navigation.navigate("ProductsSaleScreen");
    } catch (error) {
      console.log("Error saving menu item:", error);
      ToastAndroid.show("Error al guardar platillo", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item.menuId);
    setName(item.name);
    setPrice(item.price.toString());
    setDescription(item.description || "");
    setSelectedCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setStock(item.stock ? item.stock.toString() : "0");
    setFilterCategory(item.category);
    ToastAndroid.show("Editando platillo...", ToastAndroid.SHORT);
  };

  const handleDelete = (item) => {
    const id = item.id || item.menuId;
    Alert.alert(
      "Eliminar Platillo",
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
              ToastAndroid.show("Platillo eliminado", ToastAndroid.SHORT);
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

  const toggleDemoImage = () => {
    const keys = Object.keys(DEFAULT_IMAGES);
    const nextIndex = (keys.indexOf(selectedCategory) + 1) % keys.length;
    const nextCategory = keys[nextIndex >= 0 ? nextIndex : 0];
    setImageUrl(DEFAULT_IMAGES[nextCategory] || DEFAULT_IMAGES.Hamburguesas);
    ToastAndroid.show("Imagen del platillo cargada", ToastAndroid.SHORT);
  };

  const filteredItems = menuItems.filter(item => item.category === filterCategory);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate("ProductsSaleScreen")}
            >
              <Feather name="arrow-left" size={22} color={COLORS.default} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Feather name="coffee" size={22} color={COLORS.default} style={styles.headerIcon} />
              <Text style={[styles.headerTitle, { color: COLORS.default }]}>Crear Menú</Text>
            </View>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100" }} 
              style={styles.avatar} 
            />
          </View>

          {/* Categorías */}
          <Text style={styles.sectionLabelTitle}>CATEGORÍAS</Text>
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => {
                const isActive = filterCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTab,
                      isActive ? { backgroundColor: COLORS.default } : styles.categoryTabInactive
                    ]}
                    onPress={() => {
                      setFilterCategory(cat);
                      setSelectedCategory(cat);
                    }}
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

          {/* Formulario */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: COLORS.default }]}>
              {editingId ? "Editar Platillo" : "Nuevo Platillo"}
            </Text>
            <Text style={styles.formSubtitle}>
              Ingresa los detalles para tu nueva creación culinaria.
            </Text>

            {/* Imagen Box */}
            <TouchableOpacity 
              style={[styles.imageUploadBox, { backgroundColor: `${COLORS.default}05`, borderColor: `${COLORS.default}40` }]} 
              activeOpacity={0.7}
              onPress={toggleDemoImage}
            >
              {imageUrl ? (
                <View style={styles.uploadedImageContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
                  <View style={styles.imageOverlay}>
                    <Feather name="refresh-cw" size={20} color="#FFF" />
                    <Text style={styles.changeImageText}>Cambiar</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View style={styles.cameraIconCircle}>
                    <Feather name="camera" size={24} color={COLORS.default} />
                  </View>
                  <Text style={styles.uploadText}>Subir Imagen del Platillo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Platillo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Signature Bacon Burger"
                placeholderTextColor="#A3A3A3"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#A3A3A3"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cantidad en Inventario (Stock)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#A3A3A3"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe los ingredientes y el sabor..."
                placeholderTextColor="#A3A3A3"
                multiline={true}
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Guardar Button */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: COLORS.default }]} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Feather name="save" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>
                {editingId ? "Actualizar Platillo" : "Guardar Platillo"}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setEditingId(null);
                  setName("");
                  setPrice("");
                  setDescription("");
                  setImageUrl("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar Edición</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Menú Actual */}
          <View style={styles.menuListHeader}>
            <Text style={styles.menuSectionTitle}>MENÚ ACTUAL</Text>
            <Text style={[styles.menuItemsCount, { color: COLORS.orange }]}>{filteredItems.length} Items</Text>
          </View>

          {loading && menuItems.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.default} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.menuList}>
              {filteredItems.map((item) => (
                <View key={item.id || item.menuId} style={styles.itemRow}>
                  <Image source={{ uri: item.imageUrl || DEFAULT_IMAGES[filterCategory] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" }} style={styles.itemImage} />
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={[styles.itemPrice, { color: COLORS.default }]}>${parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                  <View style={styles.actionsWrapper}>
                    <TouchableOpacity 
                      style={styles.editIconButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Feather name="edit-2" size={18} color="#6C757D" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteIconButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={18} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {filteredItems.length === 0 && (
                <Text style={styles.emptyText}>No hay platillos en esta categoría</Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Feather name="home" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => {
            setActiveTab("Orders");
            ToastAndroid.show("Pedidos estará disponible pronto", ToastAndroid.SHORT);
          }}
        >
          <Feather name="shopping-bag" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => setActiveTab("Menu")}
        >
          <Feather name="book-open" size={20} color={COLORS.default} />
          <Text style={[styles.footerTabText, { color: COLORS.default }]}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => {
            setActiveTab("Settings");
            navigation.navigate("ProductsSaleScreen");
          }}
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
    backgroundColor: "#F7F8FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100, // Espacio para el footer
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  sectionLabelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C757D",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryTabInactive: {
    backgroundColor: "#E0E0E0",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  categoryTextInactive: {
    color: "#5C6B73",
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: "#8E9AA6",
    marginBottom: 16,
    lineHeight: 16,
  },
  imageUploadBox: {
    height: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  uploadedImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeImageText: {
    color: "#FFF",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 12,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C757D",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1D20",
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#8E9AA6",
    fontSize: 14,
    fontWeight: "700",
  },
  menuListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C757D",
    letterSpacing: 1.5,
  },
  menuItemsCount: {
    fontSize: 12,
    fontWeight: "700",
  },
  menuList: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  editIconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#F7F8FA",
    marginRight: 6,
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E9AA6",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 20,
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
    paddingBottom: Platform.OS === "ios" ? 15 : 0,
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

export default MenuScreen;
