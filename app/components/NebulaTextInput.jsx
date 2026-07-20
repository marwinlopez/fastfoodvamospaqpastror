import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { COLORS } from "../constants/themes";

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
  placeholderTextColor = "#8E9AA6",
  isDisabledBorder = false,
  secureTextEntry = false,
  autoCapitalize = "characters",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.row}>
      <TextInput
        defaultValue={defaultValue}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            borderColor: isDisabledBorder
              ? "transparent"
              : isFocused
              ? COLORS.default
              : "#E0E0E0",
            borderTopRightRadius: children ? 0 : 14,
            borderBottomRightRadius: children ? 0 : 14,
          },
          disabled && styles.inputDisabled,
        ]}
        inputMode={inputMode}
        autoFocus={focusable}
        id={id}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {children ? (
        <Pressable disabled={!disabled} style={styles.childrenWrapper}>
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
  },
  input: {
    borderWidth: 1,
    borderBottomLeftRadius: 14,
    borderTopLeftRadius: 14,
    paddingHorizontal: 16,
    color: "#1A1D20",
    height: 46,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#8E9AA6",
  },
  childrenWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.default,
    borderBottomRightRadius: 14,
    borderTopRightRadius: 14,
    width: 46,
    height: 46,
  },
});

export default NebulaTextInput;
