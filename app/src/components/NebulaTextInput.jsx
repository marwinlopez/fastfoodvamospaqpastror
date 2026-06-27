import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
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
  inputMode = 'text'
}) => {
  
  return (
    <View style={styles.row}>
      <TextInput
        defaultValue={defaultValue}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="characters"
        style={{
          borderColor: COLORS.default,
          borderBottomLeftRadius: 5,
          borderTopLeftRadius: 5,
          borderTopRightRadius: children ? 0 : 5,
          borderBottomRightRadius: children ? 0 : 5,
          borderWidth: 1,
          paddingHorizontal: 10,
          color: COLORS.text,
          height: 35,
          fontSize: 18,
          flex: 1,
        }}
        inputMode={inputMode}
        autoFocus={!focusable}
        id={id}
        editable={!disabled}
      />
      {children ? (
        <Pressable
          disabled={!disabled}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.default,
            borderBottomRightRadius: 5,
            borderTopRightRadius: 5,
            width: 35,
            height: 35,
          }}
        >
          {children}
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  box: {
    width: 50,
    height: 50,
  },
  rowChildren: {
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
});

export default NebulaTextInput;