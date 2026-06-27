import React, { useEffect, useState, useReducer } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Header from "../components/Header";
import { COLORS } from "../constants/themes";
import apis from "../apis";
import MaterialReducer, {
  actionCreators,
  stateIngredients,
} from "../hooks/MaterialReducer";
import NebulaTextInput from "../components/NebulaTextInput";
import SelectDropdown from "react-native-select-dropdown";
import { Button } from "@rneui/themed";

const MaterialScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(MaterialReducer, stateIngredients);
  const [disabled, setDisabled] = useState(true);
  const [isAdd, setIsAdd] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [isError, setIsError] = useState(false);
  const [selectedValue, setSelectedValue] = useState({
    id: 0,
    name: "Seleccionar...",
  });

  useEffect(() => {
    fetchUnitOfMeasurement();
    return unsubscribe;
  }, []);

  const unsubscribe = navigation.addListener("focus", () => {
    dispatch(actionCreators.loading());
    setIsAdd(route.params.route === "addMaterial");
    switch (route.params.route) {
      case "editMaterial":
        break;
      case "newMaterial":
        const { recipeId } = route.params;

        break;
      case "addMaterial":
        const { product, recipe } = route.params;
        const { ingredients } = recipe;
        const ingredient = ingredients.filter((i) => i.id);
        dispatch(actionCreators.recipe(recipe));
        if (ingredient.length > 0) {
          Alert.alert(
            "Producto Existe!",
            `Ya el producto ${product.producto} esta agregado, ¿Desea modificar la cantidad?`,
            [
              {
                text: "Cancelar",
                onPress: () => null,
                style: "cancel",
              },
              { text: "Modificar", onPress: () => null },
            ]
          );
        } else {
          const ingredient = {
            id: 0,
            description: product.producto,
            priceProduct: product.precioCompra,
            quantityPack: product.cantidadPresentacion,
            quantityUnitOf: product.cantidadEmpaque,
            quantity: "",
            unitOfMeasurementId: product.unidadMedidaId,
            unitOfMeasurement: product.unidadMedida,
          };
          dispatch(actionCreators.success(ingredient));
          dispatch(actionCreators.product(product));
          setSelectedValue({
            id: ingredient.unitOfMeasurementId,
            name: ingredient.unitOfMeasurement,
          });
          console.log(product);
        }
        // console.log({ recipe });
        break;
      default:
        console.log("no existe parametro");
        break;
    }
  });

  const { ingredient, recipe, unitOf, product } = state;

  const fetchUnitOfMeasurement = () => {
    apis.unitOfMeasurements().then(({ data }) => {
      const { unitOf } = data;
      const unit = ["Seleccionar..."];
      unitOf.forEach(({ name }) => {
        unit.push(name);
      });
      console.log(unit);
      dispatch(actionCreators.unitof(unit));
    });
  };

  const redirectActionLeft = () => {
    navigation.push("RecipeScreen", {
      route: "editRecipe",
      recipe: recipe,
    });
  };

  const onSelect = (item, index) => {
    console.log(item, index);
    setDisabled(index == 0);
    setSelectedValue({ id: index, name: item });
  };

  const addQuantityRecipe = async () => {
    let id = 0;
    if (selectedValue != null && quantity > 0) {
      try {
        if (recipe.recipeId === 0) {
          try {
            const data = await actionCreators.addRecipe({
              id: 0,
              name: recipe.name,
              cost: 0,
              coin: "USD",
              isActive: true,
            });
            id = data.recipeId;
          } catch (error) {
            ToastAndroid.show(
              "Error al Guardar la receta",
              ToastAndroid.CENTER
            );
          }
        } else {
          id = recipe.recipeId;
        }

        const resp = await actionCreators.addIngredient({
          id: isAdd ? 0 : ingredient.idIngredient,
          recipeId: id,
          productId: product.productoId,
          unitOfMeasurement: selectedValue.name,
          quantityUnitOfMeasurement: quantity,
          fixedCost: 0,
          isActive: 1,
        });
        if (resp) {
          navigation.push("RecipeScreen", {
            route: "materialsAdd",
            recipeId: id,
          });
        }
      } catch (error) {
        console.log(error);
        ToastAndroid.show(
          "Error al Guardar los ingrediente",
          ToastAndroid.CENTER
        );
      }
    } else {
      setIsError(!isError);
      const msgError =
        !selectedValue && quantity === 0
          ? `Debe agregara la cantidad a usar y seleccionar una Unidad de medida`
          : !selectedValue && quantity > 0
          ? `Debe seleccionar una Unidad de medida`
          : selectedValue && quantity === 0
          ? `Debe agregara la cantidad a usar`
          : `Error Inesperado`;
      console.log(msgError);
      ToastAndroid.show(msgError, ToastAndroid.CENTER);
    }
  };

  // if (recipe === null) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator />
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <Grid>
        <Row style={{ height: 77 }}>
          <Col>
            <Header
              title={
                ingredient.length > 0
                  ? "MODIFICAR CANTIDAD"
                  : "AÑADIR CANTIDAD "
              }
              buttonLeft={"arrow-left"}
              actionLeft={redirectActionLeft}
            />
          </Col>
        </Row>
        <Row style={styles.rowContaninerStyles}>
          <Col
            style={{
              height: 50,
              width: 150,
              justifyContent: "center",
              // alignItems: "center",
              paddingLeft: 15,
            }}
          >
            <Text style={styles.textColStyles}>Receta :</Text>
          </Col>
          <Col>
            <Text style={styles.textColStyles2}>{recipe?.name}</Text>
          </Col>
        </Row>
        <Row
          style={{
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.default,
            borderTopWidth: 1,
          }}
        >
          <Text style={[styles.textColStyles2, { paddingLeft: 0 }]}>
            Descripción Ingrediente
          </Text>
        </Row>
        <Row style={styles.rowContaninerStyles}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Descripción :</Text>
          </Col>
          <Col style={styles.bgDetalle}>
            <Text style={styles.textColStyles2}>{ingredient?.description}</Text>
          </Col>
        </Row>
        <Row style={styles.rowContaninerStyles}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Precio :</Text>
          </Col>
          <Col style={styles.bgDetalle}>
            <Text style={styles.textColStyles2}>
              {ingredient?.priceProduct} $
            </Text>
          </Col>
        </Row>
        <Row style={styles.rowContaninerStyles}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Cantidad Emp :</Text>
          </Col>
          <Col style={styles.bgDetalle}>
            <Text style={styles.textColStyles2}>
              {ingredient.quantityPack} {ingredient?.unitOfMeasurement}
            </Text>
          </Col>
        </Row>
        <Row style={styles.rowContaninerStyles}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Cantidad a usar :</Text>
          </Col>
          <Col style={styles.bgDetalle}>
            <NebulaTextInput
              inputMode="numeric"
              defaultValue={`${ingredient?.quantity}`}
              placeholder="ingrese la cantidad"
              isDisabledBorder={true}
              onChangeText={(text) => {
                setQuantity(text);
                setDisabled(selectedValue.id == 0 || text == "");
              }}
            />
          </Col>
        </Row>
        <Row style={[styles.rowContaninerStyles]}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Unid. Med :</Text>
          </Col>
          <Col style={[styles.bgDetalle, { paddingHorizontal: 5 }]}>
            <SelectDropdown
              data={unitOf}
              defaultValueByIndex={selectedValue.id}
              defaultButtonText={selectedValue.name}
              defaultValue={selectedValue.name}
              buttonStyle={{
                borderColor: COLORS.default,
                borderWidth: 1,
                height: 35,
                width: "100%",
                borderRadius: 5,
              }}
              onSelect={(selectedItem, index) => {
                onSelect(selectedItem, index);
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                // text represented after item is selected
                // if data array is an array of objects then return selectedItem.property to render after item is selected
                return selectedItem;
              }}
              rowTextForSelection={(item, index) => {
                // text represented for each item in dropdown
                // if data array is an array of objects then return item.property to represent item in dropdown
                return item;
              }}
            />
          </Col>
        </Row>
        <Row style={styles.rowContaninerSeparador} />
        <Row
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              containerStyle={{
                paddingLeft: 0,
                borderRadius: 5,
                alignContent: "center",
              }}
              disabled={disabled}
              buttonStyle={{
                width: 150,
                backgroundColor: COLORS.default,
              }}
              title={
                ingredient?.ingredientId > 0
                  ? "Modificar Cantidad"
                  : "Añadir Cantidad"
              }
              onPress={addQuantityRecipe}
            />
          </Col>
        </Row>
      </Grid>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  textColStyles: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "normal",
    justifyContent: "center",
    textAlign: "right",
    textTransform: "capitalize",
    paddingRight: 10,
  },
  textColStyles2: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "left",
    textTransform: "capitalize",
    paddingLeft: 15,
  },
  colListStyles: {
    height: 50,
    width: 150,
    borderRightWidth: 1,
    borderColor: COLORS.default,
    justifyContent: "center",
    paddingLeft: 10,
  },
  bgDetalle: {
    height: 50,
    width: "60%",
    justifyContent: "center",
    backgroundColor: COLORS.lightGrey,
  },
  rowContaninerStyles: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.default,
  },
  rowContaninerSeparador: {
    height: 5,
    borderTopWidth: 1,
    borderColor: COLORS.default,
  },
});

export default MaterialScreens;
