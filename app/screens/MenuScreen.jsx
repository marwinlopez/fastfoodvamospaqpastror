import React, { useState, useEffect, useMemo } from "react";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import apis from "../apis";
import ScreenHeader from "../components/ScreenHeader";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";
import { calculateMaxProduction } from "../utils/recipeYield";

const MenuScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Vista previa local (archivo ya en el dispositivo, sin red) — evita
  // volver a descargar/decodificar la imagen recién subida justo cuando la
  // memoria ya está bajo presión por el procesamiento previo.
  const [imagePreviewUri, setImagePreviewUri] = useState("");
  const [stock, setStock] = useState("");
  const [activeTab, setActiveTab] = useState("Menu");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Vinculación con receta o producto: al elegir uno, se autocompletan
  // precio, stock (porciones/unidades disponibles) y descripción.
  const [recipesSummary, setRecipesSummary] = useState([]);
  const [detailedRecipes, setDetailedRecipes] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkModalTab, setLinkModalTab] = useState("recipes");

  // Filter category state
  const [filterCategory, setFilterCategory] = useState("");

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
        setMenuItems(data.menu || []);
      }
    } catch (error) {
      console.log("Error fetching menu items:", error);
      ToastAndroid.show("Error al cargar platillos", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  // Recetas y productos para la vinculación receta → platillo. Se necesita
  // el detalle completo (con ingredientes) de cada receta, no el listado
  // resumido, tanto para calcular porciones producibles como para armar
  // la descripción a partir de los ingredientes.
  const fetchRecipeLinkData = async () => {
    try {
      const [prodRes, recipeRes] = await Promise.all([
        apis.allProducts().catch(() => null),
        apis.recipeAll().catch(() => null),
      ]);
      const listProds = prodRes?.data?.data || prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
      const summaryList = recipeRes?.data?.recipes || (Array.isArray(recipeRes?.data) ? recipeRes.data : []);

      const detailedResults = await Promise.all(
        summaryList.map((r) =>
          apis.recipeForId(r.recipeId || r.id).then((res) => res?.data?.recipe).catch(() => null)
        )
      );
      const validRecipes = detailedResults.filter(Boolean);

      setProductsList(listProds);
      setRecipesSummary(summaryList);
      setDetailedRecipes(validRecipes);
    } catch (err) {
      console.log("Error loading recipe link data:", err);
    }
  };

  // Cargar datos al enfocar la pantalla
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchMenuItems();
      await fetchRecipeLinkData();

      const passedItem = route.params?.item;
      if (passedItem) {
        setEditingId(passedItem.id || passedItem.menuId);
        setName(passedItem.name);
        setPrice(Number(passedItem.price || 0).toFixed(2));
        setDescription(passedItem.description || "");
        setSelectedCategory(passedItem.category);
        setImageUrl(passedItem.imageUrl || "");
        setImagePreviewUri("");
        setStock(passedItem.stock !== undefined ? String(Number(passedItem.stock)) : "0");
        setSelectedRecipeId(passedItem.recipeId || null);
        setSelectedProductId(passedItem.productId || null);
      } else {
        setEditingId(null);
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setImagePreviewUri("");
        setStock("");
        setSelectedRecipeId(null);
        setSelectedProductId(null);
      }
    };
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, route]);

  const handleSelectRecipe = (recipeId) => {
    const recipeDetail = detailedRecipes.find((r) => (r.recipeId || r.id) === recipeId);
    if (!recipeDetail) return;

    setSelectedRecipeId(recipeId);
    setSelectedProductId(null);
    setPrice(Number(recipeDetail.price || 0).toFixed(2));
    const producible = calculateMaxProduction(recipeDetail, productsList, detailedRecipes);
    setStock(String(producible));
    const ingredientNames = (recipeDetail.ingredients || [])
      .map((ing) => ing.description)
      .filter(Boolean);
    setDescription(ingredientNames.join(", "));
    setLinkModalVisible(false);
  };

  const handleSelectProduct = (productId) => {
    const product = productsList.find((p) => (p.productId || p.id) === productId);
    if (!product) return;

    setSelectedProductId(productId);
    setSelectedRecipeId(null);
    setPrice(Number(product.precioCompra || 0).toFixed(2));
    setStock(String(Math.floor(parseFloat(product.stock || 0))));
    setDescription(product.producto || "");
    setLinkModalVisible(false);
  };

  const handleClearLink = () => {
    setSelectedRecipeId(null);
    setSelectedProductId(null);
    setLinkModalVisible(false);
  };

  const linkedRecipe = selectedRecipeId
    ? recipesSummary.find((r) => (r.recipeId || r.id) === selectedRecipeId)
    : null;
  const linkedProduct = selectedProductId
    ? productsList.find((p) => (p.productId || p.id) === selectedProductId)
    : null;
  const linkedLabel = linkedRecipe?.name || linkedProduct?.producto || "Ninguna";

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
      imageUrl: imageUrl || "",
      stock: stock ? parseInt(stock) : 0,
      recipeId: selectedRecipeId || null,
      productId: selectedProductId || null,
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
      setImagePreviewUri("");
      setStock("");
      setSelectedRecipeId(null);
      setSelectedProductId(null);
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
    setPrice(Number(item.price || 0).toFixed(2));
    setDescription(item.description || "");
    setSelectedCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setImagePreviewUri("");
    setStock(item.stock ? String(Number(item.stock)) : "0");
    setSelectedRecipeId(item.recipeId || null);
    setSelectedProductId(item.productId || null);
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

  const handlePickImage = async () => {
    try {
      console.log("[imagen] pidiendo permiso...");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        ToastAndroid.show("Necesitamos acceso a tus fotos para subir una imagen", ToastAndroid.SHORT);
        return;
      }

      console.log("[imagen] abriendo galería...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
      });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      console.log("[imagen] elegida:", asset.uri, asset.width, asset.height, asset.fileSize);

      setUploadingImage(true);

      console.log("[imagen] redimensionando...");
      let manipulated = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.4, format: SaveFormat.JPEG, base64: true }
      );
      console.log("[imagen] redimensionada, base64 length:", manipulated.base64?.length);

      if (!manipulated.base64) {
        ToastAndroid.show("No se pudo procesar la imagen seleccionada", ToastAndroid.SHORT);
        return;
      }

      // Resguardo: si aun así queda pesada (foto muy compleja), se
      // recomprime una vez más antes de rendirse — evita un 413 silencioso
      // del backend por payload demasiado grande.
      if (manipulated.base64.length > 3 * 1024 * 1024) {
        console.log("[imagen] aún pesada, recomprimiendo...");
        manipulated = await manipulateAsync(
          manipulated.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.3, format: SaveFormat.JPEG, base64: true }
        );
        console.log("[imagen] recomprimida, base64 length:", manipulated.base64?.length);
      }

      if (manipulated.base64.length > 4 * 1024 * 1024) {
        ToastAndroid.show("La imagen sigue siendo muy pesada, prueba con otra", ToastAndroid.SHORT);
        return;
      }

      // Vista previa inmediata con el archivo local ya procesado — no
      // requiere red, así que no se suma a la presión de memoria del paso
      // de subida que viene a continuación.
      setImagePreviewUri(manipulated.uri);

      const dataUri = `data:image/jpeg;base64,${manipulated.base64}`;
      console.log("[imagen] subiendo al servidor...");
      const { data } = await apis.uploadImage(dataUri, name || "platillo");
      console.log("[imagen] respuesta del servidor:", JSON.stringify(data));
      if (data?.success && data?.url) {
        setImageUrl(data.url);
      } else {
        ToastAndroid.show("Error al subir la imagen", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error picking/uploading image:", error?.message || error);
      ToastAndroid.show("Error al subir la imagen", ToastAndroid.SHORT);
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredItems = menuItems.filter(item => item.category === filterCategory);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={() => navigation.navigate("ProductsSaleScreen")}
        title="Crear Menú"
        subtitle="Diseña los platillos y precios de tu carta."
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                      isActive ? { backgroundColor: theme.brand } : styles.categoryTabInactive
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
            <Text style={[styles.formTitle, { color: theme.brand }]}>
              {editingId ? "Editar Platillo" : "Nuevo Platillo"}
            </Text>
            <Text style={styles.formSubtitle}>
              Ingresa los detalles para tu nueva creación culinaria.
            </Text>

            {/* Imagen Box */}
            <TouchableOpacity
              style={[styles.imageUploadBox, { backgroundColor: theme.brand + "0D", borderColor: theme.brand + "66" }]}
              activeOpacity={0.7}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="small" color={theme.brand} />
                  <Text style={[styles.uploadText, { marginTop: 8 }]}>Subiendo imagen...</Text>
                </View>
              ) : imagePreviewUri || imageUrl ? (
                <View style={styles.uploadedImageContainer}>
                  <Image source={{ uri: imagePreviewUri || imageUrl }} style={styles.uploadedImage} />
                  <View style={styles.imageOverlay}>
                    <Feather name="refresh-cw" size={20} color="#FFF" />
                    <Text style={styles.changeImageText}>Cambiar</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <View style={styles.cameraIconCircle}>
                    <Feather name="camera" size={24} color={theme.brand} />
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
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vincular con Receta o Producto (opcional)</Text>
              <Text style={styles.linkHint}>
                Al elegir uno se autocompletan precio, stock y descripción.
              </Text>
              <TouchableOpacity
                style={[styles.linkSelectorButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                onPress={() => setLinkModalVisible(true)}
              >
                <Feather
                  name={linkedRecipe ? "book-open" : linkedProduct ? "package" : "link"}
                  size={16}
                  color={selectedRecipeId || selectedProductId ? theme.brand : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.linkSelectorText,
                    { color: selectedRecipeId || selectedProductId ? theme.textPrimary : theme.textSecondary },
                  ]}
                >
                  {linkedLabel}
                </Text>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Precio ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
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
                placeholderTextColor={theme.textSecondary}
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
                placeholderTextColor={theme.textSecondary}
                multiline={true}
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Guardar Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.brand }, uploadingImage && { opacity: 0.6 }]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={uploadingImage}
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
                  setImagePreviewUri("");
                  setStock("");
                  setSelectedRecipeId(null);
                  setSelectedProductId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar Edición</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Menú Actual */}
          <View style={styles.menuListHeader}>
            <Text style={styles.menuSectionTitle}>MENÚ ACTUAL</Text>
            <Text style={[styles.menuItemsCount, { color: theme.warning }]}>{filteredItems.length} Items</Text>
          </View>

          {loading && menuItems.length === 0 ? (
            <ActivityIndicator size="large" color={theme.brand} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.menuList}>
              {filteredItems.map((item) => (
                <View key={item.id || item.menuId} style={styles.itemRow}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                      <Feather name="image" size={20} color={theme.textSecondary} />
                    </View>
                  )}
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={[styles.itemPrice, { color: theme.brand }]}>${parseFloat(item.price).toFixed(2)}</Text>
                  </View>
                  <View style={styles.actionsWrapper}>
                    <TouchableOpacity
                      style={styles.editIconButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Feather name="edit-2" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={18} color={theme.danger} />
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
          <Feather name="home" size={20} color={theme.textSecondary} />
          <Text style={styles.footerTabText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => {
            setActiveTab("Orders");
            ToastAndroid.show("Pedidos estará disponible pronto", ToastAndroid.SHORT);
          }}
        >
          <Feather name="shopping-bag" size={20} color={theme.textSecondary} />
          <Text style={styles.footerTabText}>Órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => setActiveTab("Menu")}
        >
          <Feather name="book-open" size={20} color={theme.brand} />
          <Text style={[styles.footerTabText, { color: theme.brand }]}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => {
            setActiveTab("Settings");
            navigation.navigate("ProductsSaleScreen");
          }}
        >
          <Feather name="settings" size={20} color={theme.textSecondary} />
          <Text style={styles.footerTabText}>Ajustes</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: vincular con Receta o Producto */}
      <Modal
        visible={linkModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vincular con Receta o Producto</Text>
              <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
                <Feather name="x" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalTabsRow}>
              <TouchableOpacity
                style={[
                  styles.modalTab,
                  linkModalTab === "recipes" ? { backgroundColor: theme.brand } : { backgroundColor: theme.inputBg },
                ]}
                onPress={() => setLinkModalTab("recipes")}
              >
                <Text style={linkModalTab === "recipes" ? styles.modalTabTextActive : styles.modalTabText}>
                  Recetas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalTab,
                  linkModalTab === "products" ? { backgroundColor: theme.brand } : { backgroundColor: theme.inputBg },
                ]}
                onPress={() => setLinkModalTab("products")}
              >
                <Text style={linkModalTab === "products" ? styles.modalTabTextActive : styles.modalTabText}>
                  Productos
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalClearRow} onPress={handleClearLink}>
              <Feather name="slash" size={16} color={theme.danger} />
              <Text style={[styles.modalClearText, { color: theme.danger }]}>Ninguna (quitar vínculo)</Text>
            </TouchableOpacity>

            <FlatList
              data={linkModalTab === "recipes" ? recipesSummary : productsList}
              keyExtractor={(item, idx) => String(item.recipeId || item.productId || item.id || idx)}
              style={styles.modalList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {linkModalTab === "recipes" ? "No hay recetas registradas" : "No hay productos registrados"}
                </Text>
              }
              renderItem={({ item }) => {
                const itemId = item.recipeId || item.productId || item.id;
                const isRecipe = linkModalTab === "recipes";
                const isActive = isRecipe ? selectedRecipeId === itemId : selectedProductId === itemId;
                return (
                  <TouchableOpacity
                    style={[styles.modalItemRow, { borderColor: theme.border }, isActive && { backgroundColor: theme.brand + "14" }]}
                    onPress={() => (isRecipe ? handleSelectRecipe(itemId) : handleSelectProduct(itemId))}
                  >
                    <Text style={styles.modalItemName}>{isRecipe ? item.name : item.producto}</Text>
                    <Text style={[styles.modalItemMeta, { color: theme.textSecondary }]}>
                      {money} {Number(isRecipe ? item.price : item.precioCompra || 0).toFixed(2)}
                    </Text>
                    {isActive && <Feather name="check-circle" size={18} color={theme.brand} />}
                  </TouchableOpacity>
                );
              }}
            />
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
    paddingTop: 8,
    paddingBottom: 100, // Espacio para el footer
  },
  sectionLabelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
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
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryTabInactive: {
    backgroundColor: t.inputBg,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  categoryTextInactive: {
    color: t.textSecondary,
  },
  formCard: {
    backgroundColor: t.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: t.shadowOpacity,
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
    color: t.textSecondary,
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
    backgroundColor: t.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 4,
    elevation: 1,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: t.textSecondary,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 6,
  },
  linkHint: {
    fontSize: 11,
    color: t.textSecondary,
    marginBottom: 10,
  },
  linkSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  linkSelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: t.textPrimary,
  },
  modalTabsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textSecondary,
  },
  modalTabTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  modalClearRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  modalClearText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalList: {
    flexGrow: 0,
  },
  modalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  modalItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: t.textPrimary,
  },
  modalItemMeta: {
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
  },
  input: {
    backgroundColor: t.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: t.textPrimary,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: t.border,
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
    color: t.textSecondary,
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
    color: t.textSecondary,
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
    backgroundColor: t.surface,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: t.inputBg,
  },
  itemImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: t.textPrimary,
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
    backgroundColor: t.inputBg,
    marginRight: 6,
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: t.danger + "1A",
  },
  emptyText: {
    textAlign: "center",
    color: t.textSecondary,
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
    backgroundColor: t.headerBg,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: t.border,
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
    color: t.textSecondary,
  },
});

export default MenuScreen;
