import { ButtonGroup, Header, Icon } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";

const ProductScreen = ({ navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    switch (selectedIndex) {
      case 1:
        navigation.navigate("ProductScreen");
        break;

      default:
        break;
    }
  }, [selectedIndex]);

  const docsNavigate = () => {
    console.log("hola");
  };
  const onSubmit = (data) => console.log(data);
  console.log(errors);
  return (
    <SafeAreaView style={{ top: 0 }}>
      <Grid>
        <Row style={{ height: 50 }}>
          <Col
            style={{
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 70,
              backgroundColor: COLORS.default,
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>Agregar Ingredientes</Text>
          </Col>
        </Row>
        <Row></Row>
        <ButtonGroup
          buttons={["Pedidos", "Ordenes", "Mesa"]}
          buttonContainerStyle={{
            opacity: 20,
          }}
          selectedButtonStyle={{
            borderRadius: 5,
            backgroundColor: COLORS.default,
          }}
          selectedIndex={selectedIndex}
          onPress={(value) => {
            setSelectedIndex(value);
          }}
          containerStyle={{
            marginBottom: 30,
            backgroundColor: COLORS.default,
            padding: 1,
            borderBottomColor: "transparent",
            borderWidth: 0,
          }}
        />
        <Text>Hola</Text>
      </Grid>
    </SafeAreaView>
    // <form onSubmit={handleSubmit(onSubmit)}>
    //   <input type="text" placeholder="Nombre Receta" {...register("Nombre Receta", {required: true, maxLength: 200})} />
    //   <input type="text" placeholder="Last name" {...register("Last name", {required: true, maxLength: 100})} />
    //   <input type="text" placeholder="Email" {...register("Email", {required: true, pattern: /^\S+@\S+$/i})} />
    //   <input type="tel" placeholder="Mobile number" {...register("Mobile number", {required: true, minLength: 6, maxLength: 12})} />
    //   <select {...register("Title", { required: true })}>
    //     <option value="Mr">Mr</option>
    //     <option value="Mrs">Mrs</option>
    //     <option value="Miss">Miss</option>
    //     <option value="Dr">Dr</option>
    //   </select>

    //   <input {...register("Developer", { required: true })} type="radio" value="Yes" />
    //   <input {...register("Developer", { required: true })} type="radio" value="No" />

    //   <input type="submit" />
    // </form>
  );
};

export default ProductScreen;
const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.default,
    marginBottom: 20,
    width: "100%",
    paddingVertical: 15,
  },
  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
  },
  subheaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
