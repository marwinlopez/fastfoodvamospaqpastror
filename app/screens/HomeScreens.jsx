import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import useGlobal from "../hooks/useGlobal";
import useTheme from "../hooks/useTheme";
import usePermissions from "../hooks/usePermissions";
import apis from "../apis";
import EmptyState from "../components/EmptyState";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const HomeScreens = ({ navigation }) => {
  const { user, company } = useGlobal();
  const theme = useTheme();
  const { can } = usePermissions();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [stats, setStats] = useState({ products: null, recipes: null, menu: null });

  const now = new Date();
  const dateText = `${DAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`;

  const fetchStats = async () => {
    try {
      const [prodRes, recRes, menuRes] = await Promise.allSettled([
        apis.allProducts(),
        apis.recipeAll(),
        apis.getMenuItems(),
      ]);
      const count = (res, keys) => {
        if (res.status !== "fulfilled") return null;
        const data = res.value?.data;
        for (const k of keys) {
          if (Array.isArray(data?.[k])) return data[k].length;
        }
        return Array.isArray(data) ? data.length : null;
      };
      setStats({
        products: count(prodRes, ["data", "products"]),
        recipes: count(recRes, ["recipes"]),
        menu: count(menuRes, ["menu", "menuItems", "items", "data"]),
      });
    } catch (error) {
      console.log("[HomeScreens] Error cargando resumen:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const unsubscribe = navigation.addListener("focus", fetchStats);
    return unsubscribe;
  }, [navigation]);

  const quickActions = [
    {
      id: 1,
      title: "Gestionar Menú",
      description: "Platillos y precios",
      icon: "book-open",
      color: "#5802F1",
      bg: "#F1EAFE",
      url: "ProductsSaleScreen",
      permissions: ["view_menu", "edit_menu"],
    },
    {
      id: 2,
      title: "Ver Recetas",
      description: "Costos y preparación",
      icon: "list",
      color: "#059669",
      bg: "#E2F6EF",
      url: "RecipesScreen",
      permissions: ["view_recipes"],
    },
    {
      id: 3,
      title: "Inventario",
      description: "Stock y reposición",
      icon: "package",
      color: "#D97706",
      bg: "#FDF0DC",
      url: "MaterialsScreen",
      permissions: ["view_inventory", "manage_inventory"],
    },
    {
      id: 4,
      title: "Personal",
      description: "Equipo y accesos",
      icon: "users",
      color: "#DB2777",
      bg: "#FCE7F0",
      url: "StaffSettingsScreen",
      permissions: ["manage_staff"],
    },
  ].filter((action) => !action.permissions || action.permissions.some(can));

  const canSeeMenuTab = can("view_menu") || can("edit_menu");

  const statItems = [
    {
      label: "Inventario",
      value: stats.products,
      icon: "package",
      permissions: ["view_inventory", "manage_inventory"],
    },
    {
      label: "Recetas",
      value: stats.recipes,
      icon: "list",
      permissions: ["view_recipes"],
    },
    {
      label: "Menú",
      value: stats.menu,
      icon: "book-open",
      permissions: ["view_menu", "edit_menu"],
    },
  ].filter((s) => !s.permissions || s.permissions.some(can));

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Superior */}
        <View style={styles.topHeader}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>V</Text>
              <View style={styles.logoBadgeDot} />
            </View>
            <Text
              style={[styles.brandTitle, { color: theme.brand }]}
              numberOfLines={1}
            >
              {(company?.name || "PA Q' PASTOR").toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() =>
                ToastAndroid.show("No tienes notificaciones nuevas", ToastAndroid.SHORT)
              }
            >
              <Feather name="bell" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={styles.profileAvatar}>
              <Feather name="user" size={18} color={theme.textSecondary} />
            </View>
          </View>
        </View>

        {/* Hero de bienvenida */}
        <LinearGradient
          colors={["#7C3AED", "#5802F1", "#3B0091"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />
          <Text style={styles.heroDate}>{dateText}</Text>
          <Text style={styles.heroTitle}>¡Hola, {user?.name || "Usuario"}! 👋</Text>
          <Text style={styles.heroSubtitle}>
            Administra tu cocina desde un solo lugar.
          </Text>

          {/* Resumen con datos reales */}
          <View style={styles.statsRow}>
            {statItems.map((s) => (
              <View key={s.label} style={styles.statChip}>
                <Feather name={s.icon} size={14} color="#E9DDFF" />
                <Text style={styles.statValue}>{s.value !== null ? s.value : "—"}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Accesos rápidos */}
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        {quickActions.length === 0 ? (
          <EmptyState
            theme={theme}
            icon="lock"
            title="Sin accesos adicionales"
            description="Tu rol no tiene accesos rápidos asignados. Contacta a un administrador si necesitas alguno."
          />
        ) : (
        <View style={styles.gridContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate(action.url, { recipe: null, item: null });
              }}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: action.bg }]}>
                <Feather name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.actionCardText}>{action.title}</Text>
              <Text style={styles.actionCardDescription}>{action.description}</Text>
              <View style={styles.actionArrow}>
                <Feather name="arrow-up-right" size={14} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Feather name="home" size={20} color={theme.brand} />
          <Text style={[styles.footerTabText, { color: theme.brand }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => ToastAndroid.show("Pedidos estará disponible pronto", ToastAndroid.SHORT)}
        >
          <Feather name="shopping-bag" size={20} color={theme.textSecondary} />
          <Text style={styles.footerTabText}>Órdenes</Text>
        </TouchableOpacity>

        {canSeeMenuTab && (
          <TouchableOpacity
            style={styles.footerTab}
            onPress={() => navigation.navigate("ProductsSaleScreen")}
          >
            <Feather name="book-open" size={20} color={theme.textSecondary} />
            <Text style={styles.footerTabText}>Menú</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => navigation.navigate("SettingsScreen")}
        >
          <Feather name="settings" size={20} color={theme.textSecondary} />
          <Text style={styles.footerTabText}>Ajustes</Text>
        </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 90, // Margen para el footer
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: t.brand,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  logoBadgeDot: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F97316",
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBtn: {
    padding: 8,
    marginRight: 8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: t.border,
    backgroundColor: t.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    overflow: "hidden",
  },
  heroCircleLarge: {
    position: "absolute",
    top: -70,
    right: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -50,
    left: -35,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroDate: {
    color: "#D9C9FF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#E4D9FF",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 3,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  statLabel: {
    color: "#D9C9FF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48.5%",
    backgroundColor: t.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: t.border,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: "700",
    color: t.textPrimary,
    marginBottom: 2,
  },
  actionCardDescription: {
    fontSize: 11,
    color: t.textSecondary,
    fontWeight: "600",
  },
  actionArrow: {
    position: "absolute",
    top: 14,
    right: 14,
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

export default HomeScreens;
