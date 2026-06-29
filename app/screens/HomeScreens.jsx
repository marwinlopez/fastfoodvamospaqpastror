import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../src/constants/themes";
import MenuButton from "../components/MenuButton";

const HomeScreens = ({ navigation }) => {
  const actions = [
    {
      id: 1,
      item: "Recetas",
      url: "RecipesScreen",
      icon: "book-open",
      color: "#5802F1",
      description: "Ver recetas y preparaciones",
    },
    {
      id: 2,
      item: "Pedidos",
      url: "OrderScreen",
      icon: "shopping-bag",
      color: "#F4511E",
      description: "Gestionar órdenes activas",
    },
    {
      id: 3,
      item: "Menú",
      url: "MenuScreen",
      icon: "file-text",
      color: "#059669",
      description: "Carta y productos de comida",
    },
    // {
    //   id: 4,
    //   item: "Mesas",
    //   url: "TableScreen",
    //   icon: "grid",
    //   color: "#2563EB",
    //   description: "Ver estado de las mesas",
    // },
    {
      id: 4,
      item: "Productos",
      url: "MaterialsScreen",
      icon: "book",
      color: "#2563EB",
      description: "Ver listado de productos",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado Elegante y Personalizado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>PA Q' PASTOR</Text>
            <Text style={styles.brandTitle}>¡Hola, Chef! 👋</Text>
            <Text style={styles.greetingText}>¿Qué gestionamos hoy?</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>PQ</Text>
          </View>
        </View>

        {/* Fila del Botón de Menú de Configuración / Acceso Rápido */}
        {/* <View style={styles.menuRow}>
          <MenuButton />
        </View> */}

        {/* Título de Sección */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        {/* Cuadrícula 2x2 */}
        <View style={styles.gridContainer}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => {
                if (action.url === "OrderScreen" || action.url === "MenuScreen") {
                  alert("Esta sección estará disponible próximamente.");
                } else {
                  navigation.navigate(action.url, { recipe: null, item: null });
                }
              }}
              style={styles.card}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: `${action.color}15` },
                ]}
              >
                <Feather name={action.icon} size={26} color={action.color} />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>{action.item}</Text>
                <Text style={styles.cardDescription}>{action.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tarjeta de Servicio de Delivery Destacada */}
        <Text style={styles.sectionTitle}>Servicios Integrados</Text>
        <TouchableOpacity
          onPress={() => alert("El servicio de delivery estará disponible próximamente.")}
          style={styles.deliveryCard}
          activeOpacity={0.8}
        >
          <View style={styles.deliveryLeft}>
            <View style={styles.deliveryIconWrapper}>
              <Feather name="truck" size={26} color="#5802F1" />
            </View>
            <View style={styles.deliveryTextContent}>
              <Text style={styles.deliveryTitle}>Servicio de Delivery</Text>
              <Text style={styles.deliveryDescription}>
                Llevamos tus hamburguesas calientes a donde estés
              </Text>
            </View>
          </View>
          <View style={styles.deliveryRight}>
            <Feather name="chevron-right" size={24} color="#8E9AA6" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA", // Fondo Canvas ultra-limpio
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5802F1",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1D20",
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 2,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#5802F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#5802F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  menuRow: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8E9AA6",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "47.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    justifyContent: "space-between",
    minHeight: 150,
    // Sombras premium súper sutiles
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTextContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 11,
    color: "#8E9AA6",
    lineHeight: 14,
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  deliveryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#5802F115",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  deliveryTextContent: {
    flex: 1,
    paddingRight: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1D20",
    marginBottom: 2,
  },
  deliveryDescription: {
    fontSize: 11,
    color: "#6C757D",
    lineHeight: 15,
  },
  deliveryRight: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreens;
