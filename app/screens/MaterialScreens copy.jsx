import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import Header from "../components/Header";
import { COLORS } from "../constants/themes";
import apis from "../apis";
import { useReducer } from "react";
import MaterialReducer, {
  actionCreators,
  stateIngredients,
} from "../hooks/MaterialReducer";
import useCalculator from "../hooks/useCalculator";
import SelectDropdown from "react-native-select-dropdown";
import { Button } from "@rneui/themed";
import NebulaTextInput from "../components/NebulaTextInput";

const unitOfMeasurement = ["UND", "KG", "GR", "LT", "ML"];

const MaterialScreens = ({ navigation, route }) => {
  const [state, dispatch] = useReducer(MaterialReducer, stateIngredients);
  const { multiplicar } = useCalculator();
  // const [recipe, setRecipe] = useState({});
  const [isAdd, setIsAdd] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [isError, setIsError] = useState(false);
  const [selectedValue, setSelectedValue] = useState(0);

  useEffect(() => {
    setQuantity(0);
    setSelectedValue(0);
  }, [route]);

  useEffect(() => {
    console.log(route.params);
    // return unsubscribe;
    // const { recipe, product } = route.params;
    // // console.log(recipe);
    // setRecipe(recipe);
    // // dispatch(actionCreators.recipe(recipe));
    // dispatch(actionCreators.product(product));
  }, []);

  const fetchUnitOfMeasurement = () => {
    apis.unitOfMeasurements().then(({ data }) => {
      console.log(data);
      const unit = ["Seleccionar..."];
      data.data.forEach(({ Name }) => {
        unit.push(Name);
      });
      console.log(unit);
      // dispatch(actionCreators.unitof(unit));
    });
  };

  const unsubscribe = navigation.addListener("focus", () => {
    dispatch(actionCreators.loading());
    setIsAdd(route.params.route === "addMaterial");
    fetchUnitOfMeasurement();
    switch (route.params.route) {
      case "editMaterial":
        const { material } = route.params;
        actionCreators.getMaterial(material).then((ingredient) => {
          dispatch(actionCreators.success(ingredient));
          setQuantity(ingredient.quantity);
          setSelectedValue(ingredient.unitOfId);
        });
        // actionCreators.editRecipe(recipe).then((recipe) => {
        //   dispatch(actionCreators.success(recipe));
        // });
        break;
      case "newMaterial":
        const { recipeId } = route.params;
        // getRecipeId(recipeId);
        break;
      case "addMaterial":
        const { product, recipe } = route.params;
        dispatch(actionCreators.addRecipe(recipe));
        // dispatch(actionCreators.product(product));
        // console.log({ product, recipe });

        break;
      default:
        console.log("no existe parametro");
        break;
    }
  });

  const { ingredient, recipe } = state;
  // console.log({ recipe });
  useEffect(() => {
    setIsError(selectedValue ? false : true);
  }, [selectedValue]);

  const redirectActionLeft = () => {
    navigation.push("RecipeScreen", {
      route: "editRecipe",
      recipe: ingredient.recipeId,
    });
  };

  const addQuantityRecipe = async () => {
    let id = 0;
    console.log(selectedValue, quantity);
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
            console.log(error);
          }
        } else {
          id = recipe.recipeId;
        }
        // const resp = await actionCreators.addIngredient({
        //   id: isAdd ? 0 : ingredient.idIngredient,
        //   recipeId: id,
        //   productId: product.productoId,
        //   unitOfMeasurement: selectedValue,
        //   quantityUnitOfMeasurement: quantity,
        //   fixedCost: 0,
        //   isActive: 1,
        // });
        // if (resp) {
        //   navigation.push("RecipeScreen", {
        //     route: "materialsAdd",
        //     recipeId: id,
        //   });
        // }
      } catch (error) {
        console.log(error);
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

  const onSelect = (item, index) => {
    setDisabled(item != ingredient.unitOfId);
    setSelectedValue(item);
  };

  if (recipe === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ height: "100%" }}>
      <Grid>
        <Row style={{ height: 77 }}>
          <Col>
            <Header
              title={
                ingredient?.ingredientId > 0
                  ? "MODIFICAR CANTIDAD"
                  : "AÑADIR CANTIDAD"
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
              {product.cantidadPresentacion} {ingredient?.quantityUnitOf}
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
                setDisabled(text == ingredient.quantity || text == "");
              }}
            />
          </Col>
        </Row>
        <Row style={[styles.rowContaninerStyles]}>
          <Col style={styles.colListStyles}>
            <Text style={styles.textColStyles}>Unid. Med :</Text>
          </Col>
          <Col style={[styles.bgDetalle, { paddingHorizontal: 5 }]}>
            {/* <SelectDropdown
              data={unitOf}
              defaultValueByIndex={0}
              // defaultButtonText={"UNID"}
              // defaultValue={ingredient?.unitOfMeasurement}
              buttonStyle={{
                borderColor: isError ? COLORS.orange : COLORS.default,
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
            /> */}
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
    // textDecorationLine: "underline",
  },
  textColStyles2: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "left",
    textTransform: "capitalize",
    paddingLeft: 15,
    // textDecorationLine: "underline",
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
