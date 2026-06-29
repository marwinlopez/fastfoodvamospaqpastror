import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Dropdown from "./Dropdown";
import { useNavigation } from "@react-navigation/native";

const MenuButton = ({ recipe, id, url, color = "#6C757D" }) => {
  const [selected, setSelected] = useState(undefined);
  const navigation = useNavigation();
  // Soporte legacy: si recibe id en lugar de recipe, usa id como valor
  const recipeValue = recipe ?? id;
  const data = [
    { label: "Editar", method: "edit", value: recipeValue },
    { label: "Eliminar", method: "delete", value: recipeValue },
    { label: "Cancelar", method: "close", value: 0 },
  ];
  useEffect(() => {
    if (selected) {
      console.log(`${selected?.method}${url}`, `${url}Screen`);
      if (url === "Recipe")
        navigation.navigate(`${url}Screen`, {
          route: `${selected?.method}${url}`,
          recipe: selected?.value,
        });
      else
        navigation.navigate(`${url}Screen`, {
          route: `${selected?.method}${url}`,
          material: selected?.value,
        });
    }
  }, [selected]);

  return (
    <View style={styles.container}>
      {/* {!!selected && (
        <Text>
          Selected: label = {selected.label} and value = {selected.value}
        </Text>
      )} */}
      <Dropdown label="Select Item" data={data} onSelect={setSelected} color={color} />
      {/* <Text>This is the rest of the form.</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
});

export default MenuButton;
