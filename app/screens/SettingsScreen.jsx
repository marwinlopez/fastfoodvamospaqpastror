import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/themes";

const SettingsScreen = ({ navigation }) => {
  const options = [
    {
      id: 1,
      title: "Categorías del Menú",
      description: "Agregar, editar y eliminar categorías de la carta",
      icon: "grid",
      url: "CategorySettingsScreen",
    },
    {
      id: 2,
      title: "Unidades de Medida",
      description: "Gestionar unidades físicas (Gramos, Litros, etc.)",
      icon: "compass",
      url: "UnitSettingsScreen",
    },
    {
      id: 3,
      title: "Personal de Cocina",
      description: "Administrar datos de cocineros, cajeros y personal",
      icon: "users",
      url: "StaffSettingsScreen",
    },
    {
      id: 4,
      title: "Roles y Permisos",
      description: "Configurar accesos y perfiles de usuario",
      icon: "shield",
      url: "RoleSettingsScreen",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Feather name="arrow-left" size={22} color={COLORS.default} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Feather name="settings" size={22} color={COLORS.default} style={styles.headerIcon} />
            <Text style={[styles.headerTitle, { color: COLORS.default }]}>Ajustes</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Panel de Mantenimiento</Text>
          <Text style={styles.infoSubtitle}>
            Configura y personaliza las bases de datos de soporte del sistema.
          </Text>
        </View>

        {/* Options List */}
        <View style={styles.listContainer}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(opt.url)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.default}08` }]}>
                <Feather name={opt.icon} size={22} color={COLORS.default} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDescription}>{opt.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#8E9AA6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Feather name="home" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => alert("Pedidos estará disponible pronto.")}
        >
          <Feather name="shopping-bag" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerTab}
          onPress={() => navigation.navigate("MenuScreen")}
        >
          <Feather name="book-open" size={20} color="#8E9AA6" />
          <Text style={styles.footerTabText}>Menú</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab}>
          <Feather name="settings" size={20} color={COLORS.default} />
          <Text style={[styles.footerTabText, { color: COLORS.default }]}>Ajustes</Text>
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
    paddingBottom: 90,
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
    marginRight: 40, // Balancear el botón de atrás
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  infoSection: {
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D20",
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
  },
  listContainer: {
    marginBottom: 20,
  },
  optionCard: {
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
    color: "#1A1D20",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 11,
    color: "#8E9AA6",
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

export default SettingsScreen;
