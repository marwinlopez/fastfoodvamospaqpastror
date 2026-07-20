import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/themes";

const HomeScreens = ({ navigation }) => {
  const metrics = [
    {
      id: 1,
      title: "Ventas Hoy",
      value: "$1,450.00",
      icon: "dollar-sign",
      color: COLORS.default,
    },
    {
      id: 2,
      title: "Pedidos Totales",
      value: "124",
      icon: "shopping-bag",
      color: "#F4511E",
    },
    {
      id: 3,
      title: "Tiempo Promedio",
      value: "14 min",
      icon: "clock",
      color: "#059669",
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Gestionar Menú",
      icon: "book-open",
      color: COLORS.default,
      url: "ProductsSaleScreen",
    },
    {
      id: 2,
      title: "Ver Recetas",
      icon: "list",
      color: COLORS.default,
      url: "RecipesScreen",
    },
    {
      id: 3,
      title: "Inventario",
      icon: "package",
      color: COLORS.default,
      url: "MaterialsScreen",
    },
    {
      id: 4,
      title: "Personal",
      icon: "users",
      color: COLORS.default,
      url: "StaffSettingsScreen",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      orderNum: "#2481",
      name: "Combo Bacon",
      time: "Hace 2 min",
      table: "Mesa 4",
      status: "Preparando",
      statusColor: "#E28743",
      statusBg: "#FFF3E0",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100",
    },
    {
      id: 2,
      orderNum: "#2480",
      name: "Ensalada Mediterránea",
      time: "Hace 8 min",
      table: "Delivery",
      status: "Listo",
      statusColor: "#059669",
      statusBg: "#E6F4EA",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100",
    },
    {
      id: 3,
      orderNum: "#2479",
      name: "Pasta Pomodoro",
      time: "Hace 15 min",
      table: "Mesa 12",
      status: "Entregado",
      statusColor: "#6C757D",
      statusBg: "#F1F3F4",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Superior */}
        <View style={styles.topHeader}>
          <View style={styles.brandContainer}>
            <View style={[styles.logoCircle, { backgroundColor: COLORS.default }]}>
              <Feather name="coffee" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.brandTitle, { color: COLORS.default }]}>PA Q' PASTOR</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => ToastAndroid.show("No tienes notificaciones nuevas", ToastAndroid.SHORT)}
            >
              <Feather name="bell" size={20} color="#1A1D20" />
              <View style={[styles.notificationDot, { backgroundColor: COLORS.default }]} />
            </TouchableOpacity>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100" }}
              style={styles.profileAvatar}
            />
          </View>
        </View>

        {/* Bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Hola, Chef!</Text>
          <Text style={styles.welcomeSubtitle}>
            La cocina está en marcha. Aquí está el resumen de hoy.
          </Text>
        </View>

        {/* Métricas Diarias */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <View style={[styles.metricIconWrapper, { backgroundColor: `${metric.color}12` }]}>
                <Feather name={metric.icon} size={22} color={metric.color} />
              </View>
              <View style={styles.metricTextWrapper}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Capacidad de Cocina */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityTitle}>CAPACIDAD DE COCINA</Text>
            <View style={[styles.liveBadge, { backgroundColor: `${COLORS.default}15` }]}>
              <Text style={[styles.liveText, { color: COLORS.default }]}>En Vivo</Text>
            </View>
          </View>
          <View style={styles.demandRow}>
            <View style={[styles.demandBadge, { backgroundColor: `${COLORS.orange}15` }]}>
              <Text style={[styles.demandText, { color: COLORS.orange }]}>ALTA DEMANDA</Text>
            </View>
            <Text style={[styles.demandPercent, { color: COLORS.orange }]}>82%</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "82%", backgroundColor: COLORS.default }]} />
          </View>
          
          <Text style={styles.capacitySubtext}>
            6 fogones activos de 8 disponibles.
          </Text>
        </View>

        {/* Cuadrícula de Acciones Rápidas */}
        <View style={styles.gridContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => {
                if (action.url === "StaffScreen") {
                  alert("Esta sección estará disponible próximamente.");
                } else {
                  navigation.navigate(action.url, { recipe: null, item: null });
                }
              }}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: `${COLORS.default}08` }]}>
                <Feather name={action.icon} size={24} color={COLORS.default} />
              </View>
              <Text style={styles.actionCardText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Últimos Pedidos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Pedidos</Text>
          <TouchableOpacity onPress={() => ToastAndroid.show("Pedidos estará disponible próximamente", ToastAndroid.SHORT)}>
            <Text style={[styles.viewAllText, { color: COLORS.default }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ordersList}>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <Image source={{ uri: order.image }} style={styles.orderImage} />
              <View style={styles.orderTextContainer}>
                <Text style={styles.orderTitle}>{order.orderNum} - {order.name}</Text>
                <Text style={styles.orderSubtext}>{order.time} • {order.table}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: order.statusBg }]}>
                <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Feather name="home" size={20} color={COLORS.default} />
          <Text style={[styles.footerTabText, { color: COLORS.default }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => ToastAndroid.show("Pedidos estará disponible pronto", ToastAndroid.SHORT)}
        >
          <Feather name="shopping-bag" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("ProductsSaleScreen")}
        >
          <Feather name="book-open" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("SettingsScreen")}
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
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 90, // Margen para el footer
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBtn: {
    padding: 8,
    marginRight: 10,
    position: "relative",
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    top: 6,
    right: 8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1D20",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 18,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  metricTextWrapper: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E9AA6",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1D20",
  },
  capacityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  capacityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1D20",
    letterSpacing: 1,
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
  },
  demandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  demandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  demandText: {
    fontSize: 10,
    fontWeight: "800",
  },
  demandPercent: {
    fontSize: 14,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  capacitySubtext: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#6C757D",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionCardText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D20",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1D20",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
  },
  ordersList: {
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
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
  orderImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  orderTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 2,
  },
  orderSubtext: {
    fontSize: 11,
    color: "#6C757D",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
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
    color: "#8E9AA6",
  },
});

export default HomeScreens;
