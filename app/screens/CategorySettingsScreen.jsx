import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

const CategorySettingsScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await apis.getCategoryList();
      if (data && data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.log("Error loading categories:", error);
      ToastAndroid.show("Error al cargar categorías", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show("Ingresa el nombre de la categoría", ToastAndroid.SHORT);
      return;
    }

    try {
      setLoading(true);
      const payload = { name: name.trim() };
      
      if (editingId) {
        await apis.updateCategory(editingId, payload);
        ToastAndroid.show("Categoría actualizada", ToastAndroid.SHORT);
      } else {
        await apis.createCategory(payload);
        ToastAndroid.show("Categoría creada", ToastAndroid.SHORT);
      }
      
      setName("");
      setEditingId(null);
      await fetchCategories();
    } catch (error) {
      console.log("Error saving category:", error);
      ToastAndroid.show("Error al guardar categoría", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item.categoryId);
    setName(item.name);
  };

  const handleDelete = (item) => {
    const id = item.id || item.categoryId;
    Alert.alert(
      "Eliminar Categoría",
      `¿Estás seguro de que deseas eliminar la categoría "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apis.deleteCategory(id);
              ToastAndroid.show("Categoría eliminada", ToastAndroid.SHORT);
              await fetchCategories();
            } catch (error) {
              console.log("Error deleting category:", error);
              ToastAndroid.show("Error al eliminar", ToastAndroid.SHORT);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
              onPress={() => navigation.navigate("SettingsScreen")}
            >
              <Feather name="arrow-left" size={22} color={COLORS.default} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Feather name="grid" size={22} color={COLORS.default} style={styles.headerIcon} />
              <Text style={[styles.headerTitle, { color: COLORS.default }]}>Categorías</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: COLORS.default }]}>
              {editingId ? "Editar Categoría" : "Nueva Categoría"}
            </Text>
            <Text style={styles.formSubtitle}>
              Define los nombres de las categorías principales para organizar tus platillos.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Categoría</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Entradas, Postres, etc."
                placeholderTextColor="#A3A3A3"
                value={name}
                onChangeText={setName}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: COLORS.default }]} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Feather name="save" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>
                {editingId ? "Actualizar" : "Guardar"}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setEditingId(null);
                  setName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List Section */}
          <Text style={styles.listSectionTitle}>LISTADO DE CATEGORÍAS</Text>
          
          {loading && categories.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.default} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {categories.map((item) => (
                <View key={item.id || item.categoryId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Feather name="folder" size={18} color={COLORS.default} style={styles.folderIcon} />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <View style={styles.actionsWrapper}>
                    <TouchableOpacity 
                      style={styles.editIconButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Feather name="edit-2" size={16} color="#6C757D" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteIconButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={16} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {categories.length === 0 && (
                <Text style={styles.emptyText}>No hay categorías registradas</Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
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
    marginRight: 40,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: "#8E9AA6",
    marginBottom: 16,
    lineHeight: 16,
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
  saveButton: {
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 5,
  },
  cancelButtonText: {
    color: "#8E9AA6",
    fontSize: 14,
    fontWeight: "700",
  },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C757D",
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  listContainer: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  folderIcon: {
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
  },
  actionsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  editIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F7F8FA",
    marginRight: 6,
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E9AA6",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 20,
  },
});

export default CategorySettingsScreen;
