import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { COLORS } from "../constants/themes";

/**
 * Input de texto de la app.
 * `theme` es opcional: si la pantalla ya soporta modo oscuro se lo pasa y el
 * input adopta esos colores; si se omite, mantiene el look claro por defecto.
 */
const NebulaTextInput = ({
  id,
  value,
  defaultValue,
  placeholder,
  onChangeText,
  children,
  focusable = false,
  disabled = false,
  inputMode = "text",
  placeholderTextColor,
  isDisabledBorder = false,
  secureTextEntry = false,
  autoCapitalize = "characters",
  theme,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const bgColor = theme?.surface || "#FFFFFF";
  const textColor = theme?.textPrimary || "#1A1D20";
  const idleBorder = theme?.border || "#E0E0E0";
  const focusBorder = theme?.brand || COLORS.default;
  const placeholderColor =
    placeholderTextColor || theme?.textSecondary || "#8E9AA6";

  return (
    <View style={styles.row}>
      <TextInput
        defaultValue={defaultValue}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            backgroundColor: bgColor,
            color: textColor,
            borderColor: isDisabledBorder
              ? "transparent"
              : isFocused
              ? focusBorder
              : idleBorder,
            borderTopRightRadius: children ? 0 : 14,
            borderBottomRightRadius: children ? 0 : 14,
          },
          disabled && {
            backgroundColor: theme?.inputBg || "#F3F4F6",
            color: theme?.textSecondary || "#8E9AA6",
          },
        ]}
        inputMode={inputMode}
        autoFocus={focusable}
        id={id}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {children ? (
        <Pressable
          disabled={!disabled}
          style={[styles.childrenWrapper, { backgroundColor: focusBorder }]}
        >
          {children}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },
  input: {
    borderWidth: 1,
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    minWidth: 0,
  },
  childrenWrapper: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomRightRadius: 14,
    borderTopRightRadius: 14,
    width: 46,
    height: 46,
  },
});

export default NebulaTextInput;
