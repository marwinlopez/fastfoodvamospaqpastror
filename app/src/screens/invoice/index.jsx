import React from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";

const InvoiceScreen = () => {
  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.2)",
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          position: "absolute",
          bottom: 10,
          right: 10,
          height: 50,
          backgroundColor: "#fff",
          borderRadius: 100,
        }}
      >
        <Text style={{fontSize:20}}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InvoiceScreen;
