import { Icon } from "@rneui/themed";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";

const Dropdown = ({ label, data, onSelect }) => {
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [dropdownTop, setDropdownTop] = useState(50);

  useEffect(() => {
    DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
      // console.log(_fx, _fy, _w, h, _px, py);
      setDropdownTop(py);
    });
  }, [visible]);

  const toggleDropdown = () => {
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = () => {
    setVisible(true);
  };

  const onItemPress = (item) => {
    setSelected(item);
    if (item.value > 0) {
      onSelect({
        method: item.method,
        value: item.value,
      });
    }
    setVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => onItemPress(item)}>
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderDropdown = () => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setVisible(false);
          }}
        >
          <View
            style={[styles.dropdown, { top: dropdownTop, left: 350 - 100 }]}
          >
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
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
    >
      <Text style={styles.buttonText}>
        {/* {(!!selected && selected.label) || label} */}
        <Icon type="feather" name="more-vertical" color="white" />
      </Text>
      {renderDropdown()}
      {/* <Icon style={styles.icon} type="font-awesome" name="chevron-down" /> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#efefef",
    height: 50,
    zIndex: 1,
  },
  buttonText: {
    flex: 1,
    textAlign: "center",
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    width: "100%",
    shadowColor: "#000000",
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.5,
  },
  overlay: {
    width: 100,
    height: "100%",
  },
  item: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});

export default Dropdown;
