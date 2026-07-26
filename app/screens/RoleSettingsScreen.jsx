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

const AVAILABLE_PERMISSIONS = [
  { id: "view_menu", label: "Ver el Menú" },
  { id: "edit_menu", label: "Modificar el Menú" },
  { id: "manage_staff", label: "Gestionar Colaboradores" },
  { id: "manage_roles", label: "Configurar Roles y Accesos" },
  { id: "view_inventory", label: "Ver Inventario de Productos" },
  { id: "manage_inventory", label: "Editar Inventario de Productos" },
  { id: "create_orders", label: "Registrar Pedidos" },
  { id: "manage_company", label: "Configurar Mi Empresa" },
  { id: "manage_categories", label: "Gestionar Categorías del Menú" },
  { id: "manage_units", label: "Gestionar Unidades de Medida" },
];

const RoleSettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
      <ScreenHeader
        theme={theme}
        onBack={() => navigation.navigate("SettingsScreen")}
        title="Roles y Permisos"
        subtitle="Configura los accesos y perfiles de usuario del sistema."
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
                placeholderTextColor={theme.textSecondary}
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
                        isChecked ? { backgroundColor: theme.brand, borderColor: theme.brand } : styles.checkboxUnchecked
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
            <ActivityIndicator size="large" color={theme.brand} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {roles.map((item) => (
                <View key={item.id || item.roleId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <View style={[styles.shieldIconCircle, { backgroundColor: theme.brand + "1A" }]}>
                      <Feather name="shield" size={18} color={theme.brand} />
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
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 8,
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
    borderColor: t.border,
    backgroundColor: t.surface,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: t.textPrimary,
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
    color: t.textPrimary,
    marginBottom: 2,
  },
  itemPermissionsText: {
    fontSize: 12,
    color: t.textSecondary,
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

export default RoleSettingsScreen;
