import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import appStyles from "../../theme/app";

const lists = [
  {
    id: 1,
    name: "Mesa Nro 1",
    account: 0,
    coin: "dolar",
    available: true,
  },
  {
    id: 2,
    name: "Mesa Nro 2",
    account: 0,
    coin: "dolar",
    available: false,
  },
  {
    id: 3,
    name: "Mesa Nro 2",
    account: 0,
    coin: "dolar",
    available: true,
  },
];

const LocationScreen = ({ navigation }) => {
  return (
    <View style={appStyles.container}>
      <FlatList
        style={{
          padding: 10,
        }}
        data={lists}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        renderItem={({ item }) => (
          <Pressable
            key={`id-${item.id}`}
            onPress={() => navigation.navigate("OrderScreen")}
            style={appStyles.card_template}
          >
            <View
              style={{
                flex: 1,
                flexDirection:'row',
                height: "100%",
                justifyContent: "center",
                backgroundColor: "#d9d9d9",
                borderRadius: 10,
                padding: 9
              }}
            >
              {/* <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Text style={{
                    color: "#f4511e",
                    fontSize: 20,
                    fontWeight: "bold"
                }}>Mesa Nro 1</Text>
              </View>
              
              <View style={{
                flex:  item.available ? 1 : 0,
                alignItems: "center",
                justifyContent: "center",
                display:  item.available ? "" : "none"
              }}> */}
                <Text>Cuenta: </Text>
                <Text>$15</Text>
              {/* </View> */}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default LocationScreen;
