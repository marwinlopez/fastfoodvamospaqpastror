import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/themes";
import useGlobal from "../hooks/useGlobal";

/**
 * Header estándar de la app: flecha de retroceso + marca de la empresa,
 * seguido de una sección de título con subtítulo opcional.
 *
 * Props:
 * - onBack: función al presionar la flecha (si se omite, no se muestra la flecha)
 * - title: título grande de la pantalla (opcional)
 * - subtitle: texto descriptivo bajo el título (opcional)
 * - rightContent: nodo a renderizar al lado derecho del header (opcional)
 * - theme: tokens de tema (opcional). Si se pasa, el header usa esos colores
 *   (modo oscuro). Si se omite, mantiene el look claro por defecto — así las
 *   pantallas que todavía no soportan modo oscuro siguen coherentes.
 */
const ScreenHeader = ({ onBack, title, subtitle, rightContent, theme }) => {
  const { company } = useGlobal();
  const brand = (company?.name || "PA Q' PASTOR").toUpperCase();

  // Colores por defecto (claro) o los del tema si la pantalla lo provee
  const headerBg = theme?.headerBg || "#FFF";
  const borderColor = theme?.border || "#EAEAEA";
  const arrowColor = theme?.textPrimary || "#1A1D20";
  const brandColor = theme?.brand || COLORS.default;
  const titleColor = theme?.textPrimary || "#1A1D20";
  const subtitleColor = theme?.textSecondary || "#6C757D";

  return (
    <>
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          {onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Feather name="arrow-left" size={22} color={arrowColor} />
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.brandName, { color: brandColor }]} numberOfLines={1}>
            {brand}
          </Text>
        </View>
        {rightContent ? <View style={styles.headerRight}>{rightContent}</View> : null}
      </View>

      {title ? (
        <View style={styles.titleSection}>
          <Text style={[styles.titleText, { color: titleColor }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitleText, { color: subtitleColor }]}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1D20",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
  },
});

export default ScreenHeader;
