import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import EmptyState from "../components/EmptyState";
import useGlobal from "../hooks/useGlobal";
import useTheme from "../hooks/useTheme";
import usePermissions from "../hooks/usePermissions";
import { actionCreators } from "../hooks/GlobalReducer";
import AuthService from "../services/AuthService";

const SettingsScreen = ({ navigation }) => {
  const { dispatch } = useGlobal();
  const theme = useTheme();
  const { can } = usePermissions();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch(actionCreators.logout());
  };

  const options = [
    {
      id: 0,
      title: "Mi Empresa",
      description: "Nombre, moneda, apariencia y datos del negocio",
      icon: "briefcase",
      url: "CompanySettingsScreen",
      permissions: ["manage_company"],
    },
    {
      id: 1,
      title: "Categorías del Menú",
      description: "Agregar, editar y eliminar categorías de la carta",
      icon: "grid",
      url: "CategorySettingsScreen",
      permissions: ["manage_categories"],
    },
    {
      id: 2,
      title: "Unidades de Medida",
      description: "Gestionar unidades físicas (Gramos, Litros, etc.)",
      icon: "compass",
      url: "UnitSettingsScreen",
      permissions: ["manage_units"],
    },
    {
      id: 3,
      title: "Personal de Cocina",
      description: "Administrar datos de cocineros, cajeros y personal",
      icon: "users",
      url: "StaffSettingsScreen",
      permissions: ["manage_staff"],
    },
    {
      id: 4,
      title: "Roles y Permisos",
      description: "Configurar accesos y perfiles de usuario",
      icon: "shield",
      url: "RoleSettingsScreen",
      permissions: ["manage_roles"],
    },
  ].filter((opt) => !opt.permissions || opt.permissions.some(can));

  const canSeeMenuTab = can("view_menu") || can("edit_menu");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={() => navigation.navigate("HomeScreen")}
        title="Ajustes"
        subtitle="Configura y personaliza las bases de datos de soporte del sistema."
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Options List */}
        <View style={styles.listContainer}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(opt.url)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: theme.brand + "14" }]}>
                <Feather name={opt.icon} size={22} color={theme.brand} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDescription}>{opt.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}

          {options.length === 0 && (
            <EmptyState
              theme={theme}
              icon="lock"
              title="Sin opciones de configuración"
              description="Tu rol no tiene accesos de mantenimiento asignados. Contacta a un administrador si necesitas alguno."
            />
          )}
        </View>
      </ScrollView>

      {/* Barra fija inferior: cerrar sesión + navegación */}
      <View style={styles.bottomFixed}>
        <View style={[styles.logoutBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color={theme.danger} />
            <Text style={[styles.logoutButtonText, { color: theme.danger }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerTab}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Feather name="home" size={20} color={theme.textSecondary} />
            <Text style={styles.footerTabText}>Inicio</Text>
          </TouchableOpacity>

          {can("create_orders") && (
            <TouchableOpacity
              style={styles.footerTab}
              onPress={() => alert("Pedidos estará disponible pronto.")}
            >
              <Feather name="shopping-bag" size={20} color={theme.textSecondary} />
              <Text style={styles.footerTabText}>Órdenes</Text>
            </TouchableOpacity>
          )}

          {canSeeMenuTab && (
            <TouchableOpacity
              style={styles.footerTab}
              onPress={() => navigation.navigate("MenuScreen")}
            >
              <Feather name="book-open" size={20} color={theme.textSecondary} />
              <Text style={styles.footerTabText}>Menú</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.footerTab}>
            <Feather name="settings" size={20} color={theme.brand} />
            <Text style={[styles.footerTabText, { color: theme.brand }]}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 150,
  },
  listContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: t.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: t.border,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  logoutBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: t.danger + "14",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 11,
    color: t.textSecondary,
  },
  footer: {
    height: 64,
    backgroundColor: t.headerBg,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: t.border,
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
    color: t.textSecondary,
  },
});

export default SettingsScreen;
