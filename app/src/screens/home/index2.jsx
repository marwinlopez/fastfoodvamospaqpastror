import React from "react";
import {
  Button,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const lists = [
  {
    id: 1,
    name: "Perro Grande",
    price: 1,
    coin: "dolar",
    existence: 20,
    uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1sfWrbJqLWDCyqqcPFwh8I__XInO3cMiZ-w&usqp=CAU"
  },
  {
    id: 2,
    name: "Combo Perro Grande",
    price: 1,
    coin: "dolar",
    existence: 20,
    uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuIBEFvojchYgPsg_IV1934oK-exi6BYxdsA&usqp=CAU"
  },
  {
    id: 3,
    name: "Pepito",
    price: 1,
    coin: "dolar",
    existence: 20,
    uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSK8o6cQsZ8sHs0hz2oFcsPnebqRa6m93yyfQ&usqp=CAU"
  },
  {
    id: 4,
    name: "Salchi Papas",
    price: 1,
    coin: "dolar",
    existence: 20,
    uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd0zEbDzBs8tV6H0lPElfLyL2zu6g2cmFC2A&usqp=CAU"
  },
  {
    id: 5,
    name: "Hamburgueza",
    price: 1,
    coin: "dolar",
    existence: 20,
    uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd0zEbDzBs8tV6H0lPElfLyL2zu6g2cmFC2A&usqp=CAU"
  },
];

const HomeScreen2 = ({ navigation }) => {


  
  return (
    <View >
      <Button title="Nuevo" onPress={() => navigation.navigate("ProductIndex")} />
      <FlatList
        style={{
          padding: 10,
        }}
        data={lists}
        ItemSeparatorComponent={() => (
          <View style={{ height: 20 }} />
        )}
       
        renderItem={({ item }) => (
          <Pressable onPress={()=>alert(item.name)}
            style={styles.card_template}
            >
            <Image
              style={styles.card_image}
              source={item.uri}
            />
            <View style={styles.text_container}>
              <Text style={styles.card_title}>{item.name}</Text>
            </View>
          </Pressable>
        )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingTop: 10,
    backgroundColor: "Transparent",
  },
  card_template: {
    height: 250,
    boxShadow: "10px 10px 17px -12px rgba(0,0,0,0.75)",
    marginBottom: 10,
  },
  card_image: {
    height: 250,
    borderRadius: 10,
  },
  text_container: {
    position: "absolute",
    alignSelf: "center",
    width: "40vh",
    height: 30,
    bottom: 10,
    padding: 5,
    textAlign: "center",
    backgroundColor: "rgba(250,0,0, 0.3)",
    borderRadius: 10,
  },
  card_title: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});

export default HomeScreen2;
