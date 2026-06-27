import React from "react";
import PropTypes from "prop-types";
import { Col, Grid, Row } from "react-native-easy-grid";
import { Text, TouchableOpacity } from "react-native";
import { Icon } from "@rneui/themed";
import MenuButton from "./MenuButton";

const LinkItemList = ({
  id,
  name,
  quantity,
  coin,
  cost,
  icon = "more-vertical",
  url,
}) => {
  return (
    <Grid>
      <Row key={id} style={{ height: 80, backgroundColor: "#000100" }}>
        <Col
          style={{
            justifyContent: "center",
            paddingLeft: 10,
          }}
        >
          <Row
            style={{
              alignItems: "center",
              height: 30,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {name}
            </Text>
          </Row>
          {quantity ? (
            <Row
              style={{
                alignItems: "center",
                height: 20,
              }}
            >
              <Col size={0.4}>
                <Text>Cantidad: </Text>
              </Col>
              <Col>
                <Text>{quantity}</Text>
              </Col>
            </Row>
          ) : null}
          <Row
            style={{
              alignItems: "center",
              height: 20,
            }}
          >
            <Col size={0.4}>
              <Text>Costo: </Text>
            </Col>
            <Col>
              <Text>
                {coin} {cost}
              </Text>
            </Col>
          </Row>
        </Col>
        <Col
          size={0.15}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <TouchableOpacity
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() =>
              console.log("Menu ", { id, name, quantity, coin, cost })
            }
          >
            <Icon type="feather" name={icon} color="white" />
          </TouchableOpacity> */}
          <MenuButton id={id} url={url} />
        </Col>
      </Row>
    </Grid>
  );
};

export default LinkItemList;
