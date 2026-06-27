import { Button, Icon } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import useProductIndex from "../../hooks/useProductIndex";
import NebulaTextInput from "../../components/NebulaTextInput";

const ProductScreen = ({ route, navigation }) => {
  const { create } = useProductIndex();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stateRecipe, setStateRecipe] = useState();
  const [state, setState] = useState({
    cantidadEmpaque: 0,
    cantidadPresentacion: 0,
    precioCompra: 0,
    producto: "",
    productoId: 0,
    receta: "",
    recetaId: 0,
    unidadMedida: "",
    unidadMedidaId: 0,
  });
  const [ingredients, setIngredients] = useState({
    quantity: "0.00",
    unitOf: 0,
  });
  const { product, recipe } = route.params;
  useEffect(()=>{
    console.log(product, recipe);
    if(product){
      setState(product);
      setStateRecipe(recipe)
    }
  },[])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const handleInput = (id, value) => {
		setIngredients(prevState => ({
			...prevState,
			[id]: value,
		}));
	};
  
  const reotor = (data)=>{
    navigation.navigate("RecipesScreen", { recipe: data })
  }

  const addIngredients = () => {
    state.recetaId = stateRecipe.idRecipe;
    create(state, ingredients,reotor);
  };
  const onSubmit = (data) => console.log(data);
  console.log(errors);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        top: 0,
      }}
    >
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
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Añadir Ingredientes
            </Text>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 70 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "flex-start",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text
                style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}
              >
                Nombre del Producto:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
              <Text
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderColor: COLORS.default,
                    borderBottomLeftRadius: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                    borderWidth: 1,
                    padding: 10,
                    color: COLORS.text,
                    height: 35,
                    fontSize: 18,
                    flex: 1,
                  }}
                >
                  {state.producto}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 70 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "flex-start",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text
                style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}
              >
                Precio Producto:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <Text
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderColor: COLORS.default,
                    borderBottomLeftRadius: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5,
                    borderWidth: 1,
                    padding: 10,
                    color: COLORS.text,
                    height: 35,
                    fontSize: 18,
                    flex: 1,
                  }}
                >
                  {state.precioCompra}
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 70 }}>
          <Col
            style={{
              flex: 1.5,
              justifyContent: "flex-start",
              padding: 5,
            }}
          >
            <Row style={{ height: 25 }}>
              <Text
                style={{ color: COLORS.white, fontSize: 18, fontWeight: "900" }}
              >
                Cantidad:
              </Text>
            </Row>
            <Row style={{ height: 40 }}>
              <Col size={1}>
                <NebulaTextInput
                  placeholder={'0.00'}
                  onChangeText={(e) => handleInput("quantity", e)}
                  focusable ={true}
                  disabled={false}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ padding: 5, height: 60 }}>
          <Col
            style={{
              flex: 1,
              justifyContent: "center",
              padding: 5,
            }}
          >
            <Row>
              <Col>
                <Button
                  containerStyle={{
                    paddingLeft: 0,
                    borderRadius: 25,
                    alignContent: "center",
                  }}
                  buttonStyle={{
                    backgroundColor: COLORS.default,
                  }}
                  title="Agregar"
                  onPress={addIngredients}
                />
              </Col>
              {/* <Col style={{ width: 5 }} />
              <Col>
                <Button
                  containerStyle={{
                    paddingLeft: 0,
                    borderRadius: 25,
                    alignContent: "center",
                  }}
                  disabled={stateButton}
                  buttonStyle={{
                    backgroundColor: COLORS.default,
                  }}
                  title="Guadar"
                  onPressIn={newRecipe}
                />
              </Col> */}
            </Row>
          </Col>
        </Row>
      </Grid>
    </SafeAreaView>
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
