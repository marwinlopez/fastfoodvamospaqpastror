import React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../src/constants/themes";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
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
  const handleSearch = (text) => {
    console.log(text);
  };
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingBottom: insets.bottom,
        paddingRight: insets.right,
      }}
    >
      <Row style={{ height: 50 }}>
        <Col
          style={{
            width: 40,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingLeft: 15,
            backgroundColor: COLORS.default,
          }}
        >
          {buttonLeft ? (
            <TouchableOpacity onPress={actionLeft}>
              <Icon type="feather" name={buttonLeft} color="white" />
            </TouchableOpacity>
          ) : null}
        </Col>
        <Col
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.default,
          }}
        >
          {search ? (
            <NebulaTextInput
              placeholder={placeholderSearch}
              onChangeText={(text) => {
                callback(text);
              }}
            />
          ) : (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {title}
            </Text>
          )}
        </Col>
        <Col
          style={{
            width: 50,
            height: 50,
            justifyContent: "center",
            alignItems: "flex-end",
            paddingRight: isSearch ? 10 : 7,
            backgroundColor: COLORS.default,
          }}
        >
          {buttonRight && !isSearch ? (
            <TouchableOpacity onPress={() => alert("hola")}>
              <Icon type="feather" name="more-vertical" color="white" />
            </TouchableOpacity>
          ) : isSearch ? (
            // <TouchableOpacity >
            <Icon
              type="feather"
              name={search ? "x" : "search"}
              size={20}
              color="white"
              style={{
                padding: 7,
                borderRadius: 50,
              }}
              onPress={() => setSearch(!search)}
            />
          ) : // </TouchableOpacity>
          null}
        </Col>
      </Row>
    </View>
  );
};

export default Header;
