import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { calculateComboCapacity } from "../utils/recipeYield";
import { suppressNextLock } from "../services/AppLockGuard";

const MenuScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  // Recuerda qué ítem ya se cargó en el formulario para no reiniciarlo con
  // los datos originales (sin la imagen recién subida) cada vez que la
  // pantalla recupera el foco — por ejemplo, al volver del selector de
  // imágenes del sistema, que también dispara un evento de foco.
  const loadedItemKeyRef = useRef(undefined);

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

  // Componentes del platillo (receta o producto + cantidad cada uno) — un
  // platillo simple es, con este modelo, un combo de un solo componente.
  // Al cambiar la lista se recalculan precio (suma), stock (capacidad del
  // combo) y descripción (nombres).
  const [recipesSummary, setRecipesSummary] = useState([]);
  const [detailedRecipes, setDetailedRecipes] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [components, setComponents] = useState([]);
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
      // Se retornan también los valores (no solo el estado) porque loadData
      // los necesita de inmediato, en la misma pasada, para migrar el
      // vínculo legado de un ítem — el estado recién asignado con setX no
      // está disponible todavía dentro de esta misma función async.
      return { listProds, summaryList, validRecipes };
    } catch (err) {
      console.log("Error loading recipe link data:", err);
      return { listProds: [], summaryList: [], validRecipes: [] };
    }
  };

  // Carga los componentes ya guardados de un platillo, o migra al vuelo el
  // vínculo simple legado (recipeId/productId sueltos) a un componente
  // único la primera vez que se abre para editar.
  const loadComponentsForItem = async (item, linkData) => {
    const itemId = item.id || item.menuId;
    try {
      const { data } = await apis.getMenuItemById(itemId);
      const existing = data?.menuItem?.components || [];
      if (existing.length > 0) {
        setComponents(existing.map((c) => ({
          recipeId: c.recipeId || null,
          productId: c.productId || null,
          quantity: parseFloat(c.quantity || 1),
          description: c.description || "",
        })));
        return;
      }
    } catch (err) {
      console.log("Error loading menu item components:", err);
    }

    if (item.recipeId) {
      const recipe = linkData.summaryList.find((r) => (r.recipeId || r.id) === item.recipeId);
      setComponents([{ recipeId: item.recipeId, productId: null, quantity: 1, description: recipe?.name || item.description || "" }]);
    } else if (item.productId) {
      const product = linkData.listProds.find((p) => (p.productId || p.id) === item.productId);
      setComponents([{ recipeId: null, productId: item.productId, quantity: 1, description: product?.producto || item.description || "" }]);
    } else {
      setComponents([]);
    }
  };

  // Cargar datos al enfocar la pantalla
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchMenuItems();
      const linkData = await fetchRecipeLinkData();

      const passedItem = route.params?.item;
      const itemKey = passedItem ? (passedItem.id || passedItem.menuId) : null;

      // Solo reinicializar el formulario cuando realmente cambia el ítem
      // que se edita (o se pasa de editar a crear uno nuevo) — si ya está
      // cargado, un nuevo evento de foco no debe pisar cambios sin guardar
      // (ej. la imagen recién subida) con los datos originales del servidor.
      if (loadedItemKeyRef.current === itemKey) return;
      loadedItemKeyRef.current = itemKey;

      if (passedItem) {
        setEditingId(passedItem.id || passedItem.menuId);
        setName(passedItem.name);
        setPrice(Number(passedItem.price || 0).toFixed(2));
        setDescription(passedItem.description || "");
        setSelectedCategory(passedItem.category);
        setImageUrl(passedItem.imageUrl || "");
        setImagePreviewUri("");
        setStock(passedItem.stock !== undefined ? String(Number(passedItem.stock)) : "0");
        await loadComponentsForItem(passedItem, linkData);
      } else {
        setEditingId(null);
        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setImagePreviewUri("");
        setStock("");
        setComponents([]);
      }
    };
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, route]);

  // Agrega un componente al combo (o suma 1 a su cantidad si ya estaba
  // agregado). El modal se deja abierto para poder seguir agregando más
  // componentes sin tener que reabrirlo cada vez.
  const handleAddComponent = (itemId, isRecipe) => {
    if (isRecipe) {
      const recipe = recipesSummary.find((r) => (r.recipeId || r.id) === itemId);
      if (!recipe) return;
      setComponents((prev) => {
        const idx = prev.findIndex((c) => c.recipeId === itemId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [...prev, { recipeId: itemId, productId: null, quantity: 1, description: recipe.name }];
      });
    } else {
      const product = productsList.find((p) => (p.productId || p.id) === itemId);
      if (!product) return;
      setComponents((prev) => {
        const idx = prev.findIndex((c) => c.productId === itemId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [...prev, { recipeId: null, productId: itemId, quantity: 1, description: product.producto }];
      });
    }
  };

  const handleUpdateComponentQuantity = (index, delta) => {
    setComponents((prev) => {
      const updated = [...prev];
      const newQty = Math.max(1, (updated[index].quantity || 1) + delta);
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveComponent = (index) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  // Recalcula precio (suma de las partes), stock (capacidad del combo) y
  // descripción cada vez que cambia la lista de componentes.
  useEffect(() => {
    if (components.length === 0) return;

    let totalPrice = 0;
    components.forEach((c) => {
      const qty = parseFloat(c.quantity || 0);
      if (c.recipeId) {
        const recipe = recipesSummary.find((r) => (r.recipeId || r.id) === c.recipeId);
        totalPrice += (Number(recipe?.price) || 0) * qty;
      } else if (c.productId) {
        const product = productsList.find((p) => (p.productId || p.id) === c.productId);
        totalPrice += (Number(product?.precioCompra) || 0) * qty;
      }
    });
    setPrice(totalPrice.toFixed(2));

    const capacity = calculateComboCapacity(components, productsList, detailedRecipes);
    setStock(String(capacity));

    const desc = components
      .map((c) => (c.quantity > 1 ? `${c.quantity}x ${c.description}` : c.description))
      .filter(Boolean)
      .join(", ");
    setDescription(desc);
  }, [components, recipesSummary, productsList, detailedRecipes]);

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
      recipeId: null,
      productId: null,
      components: components.map((c) => ({
        recipeId: c.recipeId || null,
        productId: c.productId || null,
        quantity: c.quantity,
        description: c.description,
      })),
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
      setComponents([]);
      setEditingId(null);
      loadedItemKeyRef.current = undefined;

      navigation.navigate("ProductsSaleScreen");
    } catch (error) {
      console.log("Error saving menu item:", error);
      ToastAndroid.show("Error al guardar platillo", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item) => {
    loadedItemKeyRef.current = item.id || item.menuId;
    setEditingId(item.id || item.menuId);
    setName(item.name);
    setPrice(Number(item.price || 0).toFixed(2));
    setDescription(item.description || "");
    setSelectedCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setImagePreviewUri("");
    setStock(item.stock ? String(Number(item.stock)) : "0");
    setFilterCategory(item.category);
    await loadComponentsForItem(item, { summaryList: recipesSummary, listProds: productsList });
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
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        ToastAndroid.show("Necesitamos acceso a tus fotos para subir una imagen", ToastAndroid.SHORT);
        return;
      }

      // Abrir el picker manda la app a segundo plano brevemente — sin esto,
      // el listener global de biometría lo interpreta como que el usuario
      // salió de la app y la bloquea al volver.
      suppressNextLock();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
      });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      setUploadingImage(true);

      let manipulated = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.4, format: SaveFormat.JPEG, base64: true }
      );

      if (!manipulated.base64) {
        ToastAndroid.show("No se pudo procesar la imagen seleccionada", ToastAndroid.SHORT);
        return;
      }

      // Resguardo: si aun así queda pesada (foto muy compleja), se
      // recomprime una vez más antes de rendirse — evita un 413 silencioso
      // del backend por payload demasiado grande.
      if (manipulated.base64.length > 3 * 1024 * 1024) {
        manipulated = await manipulateAsync(
          manipulated.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.3, format: SaveFormat.JPEG, base64: true }
        );
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
      const { data } = await apis.uploadImage(dataUri, name || "platillo");
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
              <Text style={styles.inputLabel}>Componentes del Platillo (opcional)</Text>
              <Text style={styles.linkHint}>
                Agrega recetas o productos (ej. hamburguesa + refresco + papas) — precio, stock y descripción se recalculan solos.
              </Text>

              {components.map((comp, idx) => (
                <View key={idx} style={[styles.componentRow, { borderColor: theme.border }]}>
                  <Feather
                    name={comp.recipeId ? "book-open" : "package"}
                    size={16}
                    color={theme.brand}
                  />
                  <Text style={styles.componentName} numberOfLines={1}>
                    {comp.description}
                  </Text>
                  <View style={[styles.quantityStepper, { backgroundColor: theme.inputBg }]}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => handleUpdateComponentQuantity(idx, -1)}
                    >
                      <Feather name="minus" size={13} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{comp.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => handleUpdateComponentQuantity(idx, 1)}
                    >
                      <Feather name="plus" size={13} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeComponentBtn}
                    onPress={() => handleRemoveComponent(idx)}
                  >
                    <Feather name="trash-2" size={16} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addComponentButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                onPress={() => setLinkModalVisible(true)}
              >
                <Feather name="plus-circle" size={16} color={theme.brand} />
                <Text style={[styles.addComponentText, { color: theme.brand }]}>
                  Agregar Receta o Producto
                </Text>
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
                  setComponents([]);
                  loadedItemKeyRef.current = undefined;
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

      {/* Modal: agregar componente (receta o producto) al combo */}
      <Modal
        visible={linkModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLinkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Componente</Text>
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
                const alreadyAdded = components.some((c) =>
                  isRecipe ? c.recipeId === itemId : c.productId === itemId
                );
                return (
                  <TouchableOpacity
                    style={[styles.modalItemRow, { borderColor: theme.border }, alreadyAdded && { backgroundColor: theme.brand + "14" }]}
                    onPress={() => handleAddComponent(itemId, isRecipe)}
                  >
                    <Text style={styles.modalItemName}>{isRecipe ? item.name : item.producto}</Text>
                    <Text style={[styles.modalItemMeta, { color: theme.textSecondary }]}>
                      {money} {Number(isRecipe ? item.price : item.precioCompra || 0).toFixed(2)}
                    </Text>
                    {alreadyAdded && <Feather name="check-circle" size={18} color={theme.brand} />}
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
  componentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  componentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: t.textPrimary,
    marginLeft: 10,
    marginRight: 8,
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 10,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textPrimary,
    minWidth: 18,
    textAlign: "center",
  },
  removeComponentBtn: {
    padding: 4,
  },
  addComponentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 12,
  },
  addComponentText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
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
