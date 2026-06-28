import React from "react";
import { COLORS } from "../src/constants/themes";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "@rneui/themed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import NebulaTextInput from "./NebulaTextInput";

const Header = ({
  title,
  buttonLeft,
  buttonRight,
  actionLeft,
  actionRight,
  isSearch = false,
  callback,
  placeholderSearch = "Buscar",
}) => {
  const [search, setSearch] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.headerRow}>
        {/* Botón Izquierdo */}
        <View style={styles.actionLeftContainer}>
          {buttonLeft ? (
            <TouchableOpacity onPress={actionLeft} style={styles.iconButton} activeOpacity={0.7}>
              <Icon type="feather" name={buttonLeft} color="#1A1D20" size={20} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Título o Input de Búsqueda */}
        <View style={styles.titleContainer}>
          {search ? (
            <NebulaTextInput
              placeholder={placeholderSearch}
              onChangeText={(text) => {
                callback(text);
              }}
            />
          ) : (
            <Text style={styles.titleText}>{title}</Text>
          )}
        </View>

        {/* Botón Derecho / Búsqueda */}
        <View style={styles.actionRightContainer}>
          {buttonRight && !isSearch ? (
            <TouchableOpacity onPress={actionRight || (() => {})} style={styles.iconButton} activeOpacity={0.7}>
              <Icon type="feather" name="more-vertical" color="#1A1D20" size={20} />
            </TouchableOpacity>
          ) : isSearch ? (
            <TouchableOpacity onPress={() => setSearch(!search)} style={styles.iconButton} activeOpacity={0.7}>
              <Icon
                type="feather"
                name={search ? "x" : "search"}
                size={18}
                color="#1A1D20"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FAFAFA", // Fondo Canvas limpio
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0", // Línea divisoria muy sutil
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 48,
    paddingVertical: 4,
  },
  actionLeftContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1D20", // Texto oscuro sofisticado
    letterSpacing: -0.3,
  },
  actionRightContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    // Sombras sutiles para los botones
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});

export default Header;
