import { Icon } from "@rneui/themed";
import React, { useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";

const DROPDOWN_WIDTH = 130;

const Dropdown = ({ label, data, onSelect, color = "#6C757D" }) => {
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const toggleDropdown = () => {
    if (visible) {
      setVisible(false);
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    if (DropdownButton.current) {
      DropdownButton.current.measure((_fx, _fy, w, h, px, py) => {
        setDropdownTop(py + h + 6);
        setDropdownLeft(px - DROPDOWN_WIDTH + w);
        setVisible(true);
      });
    }
  };

  const onItemPress = (item) => {
    if (item.method) {
      onSelect({
        method: item.method,
        value: item.value,
      });
    }
    setVisible(false);
  };

  const renderItem = ({ item, index }) => {
    const isDelete = item.label.toLowerCase() === "eliminar";
    const isCancel = item.label.toLowerCase() === "cancelar";

    return (
      <TouchableOpacity
        style={[styles.item, index === data.length - 1 && styles.lastItem]}
        onPress={() => onItemPress(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.itemText,
            isDelete && styles.deleteText,
            isCancel && styles.cancelText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDropdown = () => {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              { top: dropdownTop, left: dropdownLeft },
            ]}
          >
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <TouchableOpacity
      ref={DropdownButton}
      style={styles.button}
      onPress={toggleDropdown}
      activeOpacity={0.7}
    >
      <View style={styles.buttonText}>
        <Icon type="feather" name="more-vertical" color={color} size={20} />
      </View>
      {renderDropdown()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA", // Fondo muy claro para el botón en la tarjeta
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(26, 29, 32, 0.02)", // Fondo sutil casi invisible
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    width: DROPDOWN_WIDTH,
    borderRadius: 18,
    paddingVertical: 6,
    // Sombras Canvas sutiles y flotantes
    shadowColor: "#1A1D20",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5", // Separador sutil
  },
  lastItem: {
    borderBottomWidth: 0, // Sin separador para el último elemento
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1D20",
    textAlign: "center",
  },
  deleteText: {
    color: "#DC2626", // Rojo moderno de alerta
  },
  cancelText: {
    color: "#6C757D", // Gris neutro secundario
  },
});

export default Dropdown;
