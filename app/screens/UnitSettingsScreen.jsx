import React, { useState, useEffect, useMemo } from "react";
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
import ScreenHeader from "../components/ScreenHeader";
import useTheme from "../hooks/useTheme";

const UnitSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data } = await apis.unitOfMeasurements();
      if (data && data.success) {
        setUnits(data.unitOf || []);
      }
    } catch (error) {
      console.log("Error loading units:", error);
      ToastAndroid.show("Error al cargar unidades", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show("Ingresa el nombre de la unidad", ToastAndroid.SHORT);
      return;
    }

    try {
      setLoading(true);
      const payload = { name: name.trim() };

      if (editingId) {
        await apis.updateUnit(editingId, payload);
        ToastAndroid.show("Unidad de medida actualizada", ToastAndroid.SHORT);
      } else {
        await apis.createUnit(payload);
        ToastAndroid.show("Unidad de medida creada", ToastAndroid.SHORT);
      }

      setName("");
      setEditingId(null);
      await fetchUnits();
    } catch (error) {
      console.log("Error saving unit:", error);
      ToastAndroid.show("Error al guardar unidad", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
  };

  const handleDelete = (item) => {
    const id = item.id;
    Alert.alert(
      "Eliminar Unidad",
      `¿Estás seguro de que deseas eliminar la unidad "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apis.deleteUnit(id);
              ToastAndroid.show("Unidad de medida eliminada", ToastAndroid.SHORT);
              await fetchUnits();
            } catch (error) {
              console.log("Error deleting unit:", error);
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
      <ScreenHeader
        theme={theme}
        onBack={() => navigation.navigate("SettingsScreen")}
        title="Unidades de Medida"
        subtitle="Gestiona las unidades físicas usadas en inventario y recetas."
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.brand }]}>
              {editingId ? "Editar Unidad" : "Nueva Unidad"}
            </Text>
            <Text style={styles.formSubtitle}>
              Configura unidades de medida física que serán utilizadas en el inventario e ingredientes de recetas.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Unidad</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Gramos, Litros, Unidades..."
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.brand }]}
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
          <Text style={styles.listSectionTitle}>LISTADO DE UNIDADES</Text>

          {loading && units.length === 0 ? (
            <ActivityIndicator size="large" color={theme.brand} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {units.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Feather name="activity" size={18} color={theme.brand} style={styles.unitIcon} />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <View style={styles.actionsWrapper}>
                    <TouchableOpacity
                      style={styles.editIconButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Feather name="edit-2" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Feather name="trash-2" size={16} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {units.length === 0 && (
                <Text style={styles.emptyText}>No hay unidades registradas</Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: t.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: t.border,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
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
    color: t.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
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
    color: t.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  listContainer: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: t.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: t.border,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 4,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  unitIcon: {
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: t.textPrimary,
  },
  actionsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  editIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: t.inputBg,
    marginRight: 6,
  },
  deleteIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: t.danger + "1A",
  },
  emptyText: {
    textAlign: "center",
    color: t.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 20,
  },
});

export default UnitSettingsScreen;
