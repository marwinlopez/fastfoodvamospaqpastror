import { Button, CheckBox, Dialog, Icon, ListItem } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { Pressable, Text, View } from "react-native";
import { Col, Row } from "react-native-easy-grid";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useCardItem from "../hooks/useCardItem";
import appStyles from "../theme/app";


const CardMenu = ({ item }) => {
  const { init,isNewOrder } = useCardItem();
  const [isVisible, setIsVisible] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => {
  }, []);
  
  useEffect(() => {
    setIsSelected(isNewOrder.isActive);
  }, [isNewOrder]);
  
  const toggleDialog = () => {
    const { recipeId } = item;
    console.log(item)
    if (recipeId) {
      init(item.recipeId).then((data) => {
        setItems(data);
      });

      setIsVisible(!isVisible);
    }
  };

  const check = (item) => {
    if (isSelected) {
      const result = items.map((i) => {
        if (i.id == item.id) i.isActive = !i.isActive;
        return i;
      });
      setItems(result);
    }
  };

  return (
    <SafeAreaProvider>
      <Pressable onPress={toggleDialog} style={appStyles.card_template}>
        <View style={appStyles.text_container}>
          <Text style={appStyles.card_title}>{item.description}</Text>
        </View>
      </Pressable>
      <Dialog
        style={{
          backgroundColor: "#fff",
        }}
        isVisible={isVisible}
        onBackdropPress={toggleDialog}
      >
        <Dialog.Title
          titleStyle={{ width: "100%", height: 40 }}
          title={`${item.description}  Ref: ${item.retailprice}`}
        />
        {items.map((item, i) => (
          <ListItem key={i} >
            <CheckBox
              center
              containerStyle={{ margin: 0, paddingVertical: 5 }}
              wrapperStyle={{
                // backgroundColor: "#100100",
                padding: 0,
                margin: 0,
              }}
              title={item.description}
              checked={true}
              onPress={() => check(item)}
            />
          </ListItem>
        ))}
        
        <Dialog.Actions>
          <Row>
            {isSelected ? (
              <Col style={{ marginHorizontal: 5 }}>
                <Button radius={"lg"} type="solid">
                  Agregar
                  <Icon name="add" color="white" />
                </Button>
              </Col>
            ) : null}
            <Col style={{ marginHorizontal: 5 }}>
              <Button radius={"lg"} type="solid" onPress={toggleDialog}>
                Cancelar
                <Icon name="cancel" color="white" />
              </Button>
            </Col>
          </Row>
        </Dialog.Actions>
      </Dialog>
    </SafeAreaProvider>
  );
};

export default CardMenu;
