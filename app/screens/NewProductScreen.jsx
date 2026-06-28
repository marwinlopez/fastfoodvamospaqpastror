import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { COLORS } from "../constants/themes";
import apis from "../apis";
import NebulaTextInput from "../components/NebulaTextInput";
import SelectDropdown from "react-native-select-dropdown";
import { Button } from "@rneui/themed";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BackgroundSyncService } from "../services/BackgroundSyncService";

const NewProductScreen = ({ navigation, route }) => {
  const { recipe, product } = route.params || {};
  const [name, setName] = useState(product ? product.producto : "");
  const [price, setPrice] = useState(product ? product.precioCompra?.toString() : "");
  const [qtyPresentacion, setQtyPresentacion] = useState(product ? product.cantidadPresentacion?.toString() : "");
  const [qtyEmpaque, setQtyEmpaque] = useState(product ? product.cantidadEmpaque?.toString() : "1");
  const [units, setUnits] = useState(["Seleccionar..."]);
  const [selectedUnit, setSelectedUnit] = useState(
    product
      ? { id: product.unidadMedidaId || 0, name: product.unidadMedida || "Seleccionar..." }
      : { id: 0, name: "Seleccionar..." }
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUnits = async () => {
      // 1. Carga desde cache local
      const cached = await BackgroundSyncService.getCachedUnits();
      if (cached && cached.length > 1) {
        setUnits(cached);
        if (product && product.unidadMedida) {
          const idx = cached.indexOf(product.unidadMedida);
          if (idx !== -1) {
            setSelectedUnit({ id: idx, name: product.unidadMedida });
          }
        }
      }

      // 2. Carga asíncrona de fondo
      try {
        const { data } = await apis.unitOfMeasurements();
        const { unitOf } = data;
        if (unitOf && unitOf.length > 0) {
          const uNames = ["Seleccionar...", ...unitOf.map((u) => u.name || u)];
          setUnits(uNames);
          BackgroundSyncService.preloadCatalogCache();
          if (product && product.unidadMedida) {
            const idx = uNames.indexOf(product.unidadMedida);
            if (idx !== -1) {
              setSelectedUnit({ id: idx, name: product.unidadMedida });
            }
          }
        }
      } catch (err) {
        console.log("[NewProductScreen] Falló pre-carga de unidades:", err);
        if (!cached || cached.length <= 1) {
          const fallbackUnits = [
            "Seleccionar...",
            "Gramos",
            "Kilogramos",
            "Unidades",
            "Mililitros",
            "Litros",
            "Libras",
          ];
          setUnits(fallbackUnits);
          if (product && product.unidadMedida) {
            const idx = fallbackUnits.indexOf(product.unidadMedida);
            if (idx !== -1) {
              setSelectedUnit({ id: idx, name: product.unidadMedida });
            }
          }
        }
      }
    };
    loadUnits();
  }, []);

  const handleSave = async () => {
    if (
      !name.trim() ||
      !price ||
      !qtyPresentacion ||
      !qtyEmpaque ||
      selectedUnit.name === "Seleccionar..."
    ) {
      ToastAndroid.show(
        "Por favor, rellene todos los campos",
        ToastAndroid.SHORT
      );
      return;
    }

    setLoading(true);

    const productId = product ? (product.productId || product.id) : Date.now().toString();
    const updatedProductItem = {
      productId: productId,
      producto: name.trim().toUpperCase(),
      precioCompra: parseFloat(price),
      cantidadPresentacion: parseFloat(qtyPresentacion),
      cantidadEmpaque: parseFloat(qtyEmpaque),
      unidadMedida: selectedUnit.name,
      unidadMedidaId: selectedUnit.id,
    };

    if (product) {
      const updatePayload = {
        producto: updatedProductItem.producto,
        precioCompra: updatedProductItem.precioCompra,
        cantidadPresentacion: updatedProductItem.cantidadPresentacion,
        cantidadEmpaque: updatedProductItem.cantidadEmpaque,
        unidadMedida: updatedProductItem.unidadMedida,
        unidadMedidaId: updatedProductItem.unidadMedidaId,
      };

      try {
        await apis.updateProduct(productId, updatePayload);
        await BackgroundSyncService.updateProductInCache(productId, updatedProductItem);
        ToastAndroid.show("Producto actualizado con éxito", ToastAndroid.SHORT);
        navigation.push("MaterialsScreen", { recipe });
      } catch (error) {
        console.log(
          "[NewProductScreen] Falló actualización de red. Encolando...",
          error
        );
        await BackgroundSyncService.updateProductInCache(productId, updatedProductItem);
        await BackgroundSyncService.enqueueSyncAction("editProduct", {
          id: productId,
          payload: updatePayload,
        });
        ToastAndroid.show(
          "Guardado local (se sincronizará en segundo plano)",
          ToastAndroid.LONG
        );
        navigation.push("MaterialsScreen", { recipe });
      } finally {
        setLoading(false);
      }
      return;
    }

    const payload = {
      products: [updatedProductItem],
    };

    try {
      await apis.createProduct(payload);
      await BackgroundSyncService.addProductToCache(updatedProductItem);
      ToastAndroid.show("Producto registrado con éxito", ToastAndroid.SHORT);
      navigation.push("MaterialsScreen", { recipe });
    } catch (error) {
      console.log(
        "[NewProductScreen] Error de red. Encolando producto...",
        error
      );
      await BackgroundSyncService.addProductToCache(updatedProductItem);
      await BackgroundSyncService.enqueueSyncAction("newProduct", payload);
      ToastAndroid.show(
        "Guardado local (se sincronizará en segundo plano)",
        ToastAndroid.LONG
      );
      navigation.push("MaterialsScreen", { recipe });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    price.length > 0 &&
    qtyPresentacion.length > 0 &&
    qtyEmpaque.length > 0 &&
    selectedUnit.name !== "Seleccionar...";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <Header
        title={product ? "EDITAR PRODUCTO" : "REGISTRAR PRODUCTO"}
        buttonLeft="arrow-left"
        actionLeft={() => navigation.push("MaterialsScreen", { recipe })}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View style={styles.formCard}>
          {/* Nombre del Producto */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del Producto</Text>
            <NebulaTextInput
              placeholder="Ej. Queso Mozzarella"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Precio de Compra */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Precio de Compra (USD)</Text>
            <NebulaTextInput
              placeholder="Ej. 5.50"
              inputMode="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Cantidades (Fila) */}
          <View style={styles.rowGroup}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Presentación (Cant.)</Text>
              <NebulaTextInput
                placeholder="Ej. 1000"
                inputMode="numeric"
                value={qtyPresentacion}
                onChangeText={setQtyPresentacion}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Empaque (Cant.)</Text>
              <NebulaTextInput
                placeholder="Ej. 1"
                inputMode="numeric"
                value={qtyEmpaque}
                onChangeText={setQtyEmpaque}
              />
            </View>
          </View>

          {/* Unidad de Medida */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Unidad de Medida</Text>
            <SelectDropdown
              data={units}
              defaultValueByIndex={selectedUnit.id}
              defaultButtonText={selectedUnit.name}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              dropdownStyle={styles.dropdownMenu}
              rowStyle={styles.dropdownRow}
              rowTextStyle={styles.dropdownRowText}
              renderDropdownIcon={(isOpened) => (
                <Feather
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color="#8E9AA6"
                  size={18}
                />
              )}
              dropdownIconPosition="right"
              onSelect={(selectedItem, index) => {
                setSelectedUnit({ id: index, name: selectedItem });
              }}
              buttonTextAfterSelection={(selectedItem) => selectedItem}
              rowTextForSelection={(item) => item}
            />
          </View>

          {/* Botón de Registro */}
          <Button
            containerStyle={styles.buttonContainer}
            disabled={!isFormValid || loading}
            loading={loading}
            buttonStyle={styles.buttonStyle}
            disabledStyle={styles.buttonDisabledStyle}
            disabledTitleStyle={styles.buttonDisabledTitleStyle}
            title={product ? "Guardar Cambios" : "Registrar Producto"}
            titleStyle={styles.buttonTitle}
            onPress={handleSave}
            icon={
              loading
                ? null
                : {
                    name: "check-circle",
                    type: "feather",
                    size: 16,
                    color: isFormValid ? "white" : "#8E9AA6",
                  }
            }
            iconContainerStyle={{ marginRight: 6 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 18,
  },
  rowGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E9AA6",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
    width: "100%",
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    color: "#1A1D20",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  dropdownRow: {
    borderBottomColor: "#F5F5F5",
    height: 44,
  },
  dropdownRowText: {
    color: "#1A1D20",
    fontSize: 14,
    textAlign: "left",
    paddingLeft: 16,
  },
  buttonContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  buttonStyle: {
    backgroundColor: "#5802F1",
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonDisabledStyle: {
    backgroundColor: "#E0E0E0",
  },
  buttonDisabledTitleStyle: {
    color: "#8E9AA6",
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default NewProductScreen;
