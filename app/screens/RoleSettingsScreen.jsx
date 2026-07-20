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

const AVAILABLE_PERMISSIONS = [
  { id: "view_menu", label: "Ver el Menú" },
  { id: "edit_menu", label: "Modificar el Menú" },
  { id: "manage_staff", label: "Gestionar Colaboradores" },
  { id: "manage_roles", label: "Configurar Roles y Accesos" },
  { id: "view_inventory", label: "Ver Inventario de Productos" },
  { id: "manage_inventory", label: "Editar Inventario de Productos" },
  { id: "create_orders", label: "Registrar Pedidos" },
];

const RoleSettingsScreen = ({ navigation }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await apis.getRoleList();
      if (data && data.success) {
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.log("Error loading roles:", error);
      ToastAndroid.show("Error al cargar roles", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTogglePermission = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show("Ingresa el nombre del rol", ToastAndroid.SHORT);
      return;
    }

    const payload = {
      name: name.trim(),
      permissions: selectedPermissions,
    };

    try {
      setLoading(true);
      if (editingId) {
        await apis.updateRole(editingId, payload);
        ToastAndroid.show("Rol actualizado", ToastAndroid.SHORT);
      } else {
        await apis.createRole(payload);
        ToastAndroid.show("Rol creado", ToastAndroid.SHORT);
      }

      setName("");
      setSelectedPermissions([]);
      setEditingId(null);
      await fetchRoles();
    } catch (error) {
      console.log("Error saving role:", error);
      ToastAndroid.show("Error al guardar rol", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item.roleId);
    setName(item.name);
    // Asegurar que sea un array
    setSelectedPermissions(Array.isArray(item.permissions) ? item.permissions : []);
  };

  const handleDelete = (item) => {
    const id = item.id || item.roleId;
    Alert.alert(
      "Eliminar Rol",
      `¿Estás seguro de que deseas eliminar el rol "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apis.deleteRole(id);
              ToastAndroid.show("Rol eliminado", ToastAndroid.SHORT);
              await fetchRoles();
            } catch (error) {
              console.log("Error deleting role:", error);
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
              <Feather name="shield" size={22} color={COLORS.default} style={styles.headerIcon} />
              <Text style={[styles.headerTitle, { color: COLORS.default }]}>Roles y Permisos</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: COLORS.default }]}>
              {editingId ? "Editar Rol" : "Nuevo Rol"}
            </Text>
            <Text style={styles.formSubtitle}>
              Crea perfiles de usuario y marca los accesos permitidos para los colaboradores.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Rol</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Ayudante, Supervisor..."
                placeholderTextColor="#A3A3A3"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Checklist de Permisos */}
            <View style={styles.permissionsListGroup}>
              <Text style={styles.inputLabel}>Permisos Permitidos</Text>
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.id);
                return (
                  <TouchableOpacity
                    key={perm.id}
                    style={styles.checkboxRow}
                    activeOpacity={0.7}
                    onPress={() => handleTogglePermission(perm.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isChecked ? { backgroundColor: COLORS.default, borderColor: COLORS.default } : styles.checkboxUnchecked
                      ]}
                    >
                      {isChecked && <Feather name="check" size={14} color="#FFF" />}
                    </View>
                    <Text style={styles.checkboxLabel}>{perm.label}</Text>
                  </TouchableOpacity>
                );
              })}
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
                  setSelectedPermissions([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List Section */}
          <Text style={styles.listSectionTitle}>ROLES CONFIGURADOS</Text>
          
          {loading && roles.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.default} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {roles.map((item) => (
                <View key={item.id || item.roleId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <View style={[styles.shieldIconCircle, { backgroundColor: `${COLORS.default}10` }]}>
                      <Feather name="shield" size={18} color={COLORS.default} />
                    </View>
                    <View style={styles.roleDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPermissionsText}>
                        {Array.isArray(item.permissions) && item.permissions.length > 0
                          ? `${item.permissions.length} accesos concedidos`
                          : "Sin permisos asignados"}
                      </Text>
                    </View>
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

              {roles.length === 0 && (
                <Text style={styles.emptyText}>No hay roles configurados</Text>
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
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 8,
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
  permissionsListGroup: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxUnchecked: {
    borderColor: "#DCDADD",
    backgroundColor: "#FFF",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1D20",
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
  shieldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  roleDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 2,
  },
  itemPermissionsText: {
    fontSize: 12,
    color: "#8E9AA6",
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

export default RoleSettingsScreen;
