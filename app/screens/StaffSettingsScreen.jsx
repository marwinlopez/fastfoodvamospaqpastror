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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import apis from "../apis";
import { COLORS } from "../constants/themes";

const StaffSettingsScreen = ({ navigation }) => {
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesRes = await apis.getRoleList();
      const staffRes = await apis.getStaffList();
      
      if (rolesRes.data && rolesRes.data.success) {
        const fetchedRoles = rolesRes.data.roles || [];
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(fetchedRoles[0].id || fetchedRoles[0].roleId);
        }
      }
      
      if (staffRes.data && staffRes.data.success) {
        setStaffList(staffRes.data.staff || []);
      }
    } catch (error) {
      console.log("Error loading staff data:", error);
      ToastAndroid.show("Error al cargar datos", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show("Ingresa el nombre del colaborador", ToastAndroid.SHORT);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      roleId: selectedRoleId || null,
      isActive: isActive,
    };

    try {
      setLoading(true);
      if (editingId) {
        await apis.updateStaff(editingId, payload);
        ToastAndroid.show("Colaborador actualizado", ToastAndroid.SHORT);
      } else {
        await apis.createStaff(payload);
        ToastAndroid.show("Colaborador creado", ToastAndroid.SHORT);
      }

      setName("");
      setEmail("");
      setPhone("");
      setIsActive(true);
      setEditingId(null);
      await fetchData();
    } catch (error) {
      console.log("Error saving staff member:", error);
      ToastAndroid.show("Error al guardar colaborador", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id || item.staffId);
    setName(item.name);
    setEmail(item.email || "");
    setPhone(item.phone || "");
    setSelectedRoleId(item.roleId || "");
    setIsActive(item.isActive !== undefined ? item.isActive : true);
  };

  const handleDelete = (item) => {
    const id = item.id || item.staffId;
    Alert.alert(
      "Eliminar Colaborador",
      `¿Estás seguro de que deseas eliminar a "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apis.deleteStaff(id);
              ToastAndroid.show("Colaborador eliminado", ToastAndroid.SHORT);
              await fetchData();
            } catch (error) {
              console.log("Error deleting staff member:", error);
              ToastAndroid.show("Error al eliminar", ToastAndroid.SHORT);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => (r.id || r.roleId) === roleId);
    return role ? role.name : "Sin Rol";
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
              <Feather name="users" size={22} color={COLORS.default} style={styles.headerIcon} />
              <Text style={[styles.headerTitle, { color: COLORS.default }]}>Personal</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: COLORS.default }]}>
              {editingId ? "Editar Colaborador" : "Nuevo Colaborador"}
            </Text>
            <Text style={styles.formSubtitle}>
              Registra los datos de contacto y asigna roles a tu equipo de cocina.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor="#A3A3A3"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. juan@correo.com"
                placeholderTextColor="#A3A3A3"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. +58 412 1234567"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Selector de Rol */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Asignar Rol</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleSelectionRow}>
                {roles.map((role) => {
                  const roleId = role.id || role.roleId;
                  const isSelected = selectedRoleId === roleId;
                  return (
                    <TouchableOpacity
                      key={roleId}
                      style={[
                        styles.roleBadge,
                        isSelected ? { backgroundColor: COLORS.default } : styles.roleBadgeInactive
                      ]}
                      onPress={() => setSelectedRoleId(roleId)}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          isSelected ? styles.roleBadgeTextActive : styles.roleBadgeTextInactive
                        ]}
                      >
                        {role.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Activo / Inactivo Switch */}
            <View style={styles.switchGroup}>
              <Text style={styles.inputLabel}>Estado Activo</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#DCDADD", true: `${COLORS.default}40` }}
                thumbColor={isActive ? COLORS.default : "#8E9AA6"}
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
                  setEmail("");
                  setPhone("");
                  setSelectedRoleId(roles[0]?.id || roles[0]?.roleId || "");
                  setIsActive(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List Section */}
          <Text style={styles.listSectionTitle}>COLABORADORES REGISTRADOS</Text>
          
          {loading && staffList.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.default} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {staffList.map((item) => (
                <View key={item.id || item.staffId} style={[styles.itemRow, !item.isActive && styles.itemRowInactive]}>
                  <View style={styles.itemInfo}>
                    <View style={[styles.avatarCircle, { backgroundColor: `${COLORS.default}10` }]}>
                      <Feather name="user" size={18} color={item.isActive ? COLORS.default : "#8E9AA6"} />
                    </View>
                    <View style={styles.staffDetails}>
                      <Text style={[styles.itemName, !item.isActive && styles.itemNameInactive]}>{item.name}</Text>
                      <Text style={styles.itemRole}>{getRoleName(item.roleId)}</Text>
                      {item.phone ? <Text style={styles.itemPhone}>{item.phone}</Text> : null}
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

              {staffList.length === 0 && (
                <Text style={styles.emptyText}>No hay personal registrado</Text>
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
  roleSelectionRow: {
    marginTop: 4,
    paddingBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    marginRight: 8,
  },
  roleBadgeInactive: {
    backgroundColor: "#F0F0F0",
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  roleBadgeTextActive: {
    color: "#FFF",
  },
  roleBadgeTextInactive: {
    color: "#5C6B73",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
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
  itemRowInactive: {
    backgroundColor: "#FAFAFA",
    opacity: 0.6,
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  staffDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 2,
  },
  itemNameInactive: {
    textDecorationLine: "line-through",
  },
  itemRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C757D",
    marginBottom: 1,
  },
  itemPhone: {
    fontSize: 11,
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

export default StaffSettingsScreen;
