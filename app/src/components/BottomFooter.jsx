import { BottomSheet, Button, ListItem } from "@rneui/themed";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Col } from "react-native-easy-grid";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "../constants/themes";
import useButtonFooter from "../hooks/useButtonFooter";

const BottomFooter = ({  text, action }) => {
  const [isVisible, setIsVisible] = useState(false);
  const {isNewOrder, newOrder} = useButtonFooter()

  const list = [
    {
      title: "Mesa 1",
      onPress: () =>{
        newOrder({
          name: "Mesa 1",
          isActive: true,
        })
        setIsVisible(false)
      }
    },
    {
      title: "Mesa 2",
      onPress: () =>{
        newOrder({
          name: "Mesa 2",
          isActive: true,
        })
        setIsVisible(false)
      }
    },
    {
      title: "Mesa 3",
      onPress: () =>{
        newOrder({
          name: "Mesa 3",
          isActive: true,
        })
        setIsVisible(false)
      }
    },
    { title: "+" },
    {
      title: "Cancel",
      containerStyle: { backgroundColor: "red" },
      titleStyle: { color: "white" },
      onPress: () => setIsVisible(false),
    },
  ];



  return (
    <SafeAreaProvider>
      <Button
        title={text}
        titleStyle={{ textTransform: "uppercase" }}
        onPress={() => setIsVisible(true)}
        buttonStyle={styles.button}
      />
      <BottomSheet modalProps={{}} isVisible={isVisible}>
        {list.map((l, i) => (
          <ListItem
            key={i}
            containerStyle={l.containerStyle}
            onPress={l.onPress}
          >
            <ListItem.Content>
              <ListItem.Title style={l.titleStyle}>{l.title}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </BottomSheet>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 0,
    padding: 5,
    backgroundColor: COLORS.default,
    borderRadius: 20,
  },
});

export default BottomFooter;
