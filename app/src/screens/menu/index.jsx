import React from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import appStyles from "../../theme/app";
import { COLORS } from "../../constants/themes";

const lists = [
    {
        id: 1,
        name: "Perro Grande",
        price: 1,
        coin: "dolar",
        existence: 20,
        src:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1sfWrbJqLWDCyqqcPFwh8I__XInO3cMiZ-w&usqp=CAU"
      },
      {
        id: 2,
        name: "Combo Perro Grande",
        price: 1,
        coin: "dolar",
        existence: 20,
        src:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuIBEFvojchYgPsg_IV1934oK-exi6BYxdsA&usqp=CAU"
      },
      {
        id: 3,
        name: "Pepito",
        price: 1,
        coin: "dolar",
        existence: 20,
        src:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK8o6cQsZ8sHs0hz2oFcsPnebqRa6m93yyfQ&usqp=CAU"
      },
      {
        id: 4,
        name: "Salchi Papas",
        price: 1,
        coin: "dolar",
        existence: 20,
        src:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd0zEbDzBs8tV6H0lPElfLyL2zu6g2cmFC2A&usqp=CAU"
      },
      {
        id: 5,
        name: "Hamburgueza",
        price: 1,
        coin: "dolar",
        existence: 20,
        src:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd0zEbDzBs8tV6H0lPElfLyL2zu6g2cmFC2A&usqp=CAU"
      }
];

const MenuScreen = ({ navigation }) => {
  return (
    <View style={appStyles.container}>
      <FlatList
        style={{
          padding: 10,
        }}
        data={lists}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        renderItem={({ index, item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("OrderScreen")}
            style={{
              aspectRatio: 1,
              width: "49.5%",
              marginRight: index % 2 !== 0 ? 0 : 5,
              marginTop: 15,
              marginBottom: 4,
              padding: 1,
              position: "relative",
              backgroundColor: COLORS.lightGrey,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
              borderColor: COLORS.orange,
              borderWidth: 2,
            }}
          >
            <Image
              resizeMode="cover"
              style={{
                width: "100%",
                height: "90%",
                paddingTop: 15,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10
              }}
              source={{ uri: item.src }}
            />
            <Text
              style={{
                width: "100%",
                textAlign: "center",
                color: item.disposable ? COLORS.white : COLORS.white,
                backgroundColor: COLORS.default,
                borderBottomLeftRadius: 10,
                borderBottomEndRadius: 10,
                bottom: 1,
                fontSize: 15,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        numColumns={2}
      />
    </View>
  );
};

export default MenuScreen;
