import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * Mensaje de estado vacío para secciones que un rol con permisos
 * limitados puede quedarse sin accesos que mostrar (en vez de dejar
 * el espacio en blanco, que se lee como que algo falló).
 *
 * Props:
 * - icon: nombre del ícono Feather
 * - title, description: textos
 * - theme: tokens de tema (opcional, ver ScreenHeader para el patrón)
 */
const EmptyState = ({ icon = "lock", title, description, theme }) => {
  const surface = theme?.surface || "#FFFFFF";
  const border = theme?.border || "#EAEAEA";
  const inputBg = theme?.inputBg || "#F4F4F6";
  const iconColor = theme?.textSecondary || "#6C757D";
  const titleColor = theme?.textPrimary || "#1A1D20";
  const descColor = theme?.textSecondary || "#6C757D";

  return (
    <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: inputBg }]}>
        <Feather name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: descColor }]}>{description}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
});

export default EmptyState;
