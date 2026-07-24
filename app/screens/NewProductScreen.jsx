import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import apis from "../apis";
import NebulaTextInput from "../components/NebulaTextInput";
import SelectDropdown from "react-native-select-dropdown";
import { Button } from "@rneui/themed";
import { Feather } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import { CameraView, Camera } from "expo-camera";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";

const NewProductScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { company } = useGlobal();
  const money = company?.currencySymbol || "$";
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { recipe, product } = route.params || {};
  const [name, setName] = useState(product ? product.producto : "");
  const [price, setPrice] = useState(
    product?.precioCompra != null ? Number(product.precioCompra).toFixed(2) : ""
  );
  const [qtyPresentacion, setQtyPresentacion] = useState(
    product?.cantidadPresentacion != null ? Number(product.cantidadPresentacion).toFixed(2) : ""
  );
  const [qtyEmpaque, setQtyEmpaque] = useState(
    product?.cantidadEmpaque != null ? Number(product.cantidadEmpaque).toFixed(2) : "1"
  );
  const [initialStock, setInitialStock] = useState("");
  const [units, setUnits] = useState([]);
  const [unitNames, setUnitNames] = useState(["Seleccionar..."]);
  const [selectedUnit, setSelectedUnit] = useState(
    product
      ? { id: product.unidadMedidaId || null, name: product.unidadMedida || "Seleccionar..." }
      : { id: null, name: "Seleccionar..." }
  );
  const [loading, setLoading] = useState(false);

  // Estados del escáner y código de barras
  const [barcode, setBarcode] = useState(product ? product.codigoBarra || "" : "");
  const [barcodeExists, setBarcodeExists] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const { data } = await apis.unitOfMeasurements();
        const { unitOf } = data;
        if (unitOf && unitOf.length > 0) {
          setUnits(unitOf);
          setUnitNames(["Seleccionar...", ...unitOf.map((u) => u.name)]);
          if (product && product.unidadMedidaId) {
            const match = unitOf.find((u) => u.id === product.unidadMedidaId);
            if (match) {
              setSelectedUnit({ id: match.id, name: match.name });
            }
          }
        }
      } catch (err) {
        console.log("[NewProductScreen] Error cargando unidades:", err);
      }
    };
    loadUnits();
  }, []);

  useEffect(() => {
    const loadExistingProducts = async () => {
      const cached = await BackgroundSyncService.getCachedProducts();
      if (cached && cached.length > 0) {
        setExistingProducts(cached);
      }
      try {
        const { data } = await apis.allProducts();
        const list = data?.data || data?.products;
        if (list && list.length > 0) {
          setExistingProducts(list);
        }
      } catch (err) {
        console.log("[NewProductScreen] Error cargando productos existentes:", err);
      }
    };
    loadExistingProducts();
  }, []);

  const askForCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    if (status === "granted") {
      setIsScannerVisible(true);
      setScanned(false);
    } else {
      Alert.alert(
        "Permiso Denegado",
        "Se requiere acceso a la cámara para poder escanear códigos de barra."
      );
    }
  };

  const handleBarcodeChange = (text) => {
    setBarcode(text);
    if (!text || text.trim() === "") {
      setBarcodeExists(false);
      return;
    }

    const exists = existingProducts.some(
      (p) =>
        p.codigoBarra &&
        p.codigoBarra.toString().trim() === text.trim() &&
        (!product || (p.productId || p.id) !== (product.productId || product.id))
    );
    setBarcodeExists(exists);
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setIsScannerVisible(false);
    handleBarcodeChange(data);
    ToastAndroid.show(`Código escaneado: ${data}`, ToastAndroid.SHORT);
  };

  const handleSave = async () => {
    if (
      !name.trim() ||
      !price ||
      !qtyPresentacion ||
      !qtyEmpaque
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
      unidadMedida: selectedUnit.name !== "Seleccionar..." ? selectedUnit.name : null,
      unidadMedidaId: selectedUnit.id || null,
      codigoBarra: barcode.trim() !== "" ? barcode.trim() : null,
      ...(product ? {} : { stock: parseFloat(initialStock || 0) }),
    };

    if (product) {
      const updatePayload = {
        producto: updatedProductItem.producto,
        precioCompra: updatedProductItem.precioCompra,
        cantidadPresentacion: updatedProductItem.cantidadPresentacion,
        cantidadEmpaque: updatedProductItem.cantidadEmpaque,
        unidadMedida: updatedProductItem.unidadMedida,
        unidadMedidaId: updatedProductItem.unidadMedidaId,
        codigoBarra: updatedProductItem.codigoBarra,
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
    !barcodeExists;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        theme={theme}
        onBack={() => navigation.push("MaterialsScreen", { recipe })}
        title={product ? "Editar Producto" : "Registrar Producto"}
        subtitle="Completa los datos del producto de inventario."
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
              theme={theme}
              placeholder="Ej. Queso Mozzarella"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Código de Barra */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Código de Barra</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <NebulaTextInput
                  theme={theme}
                  placeholder="Ej. 750123456789"
                  value={barcode}
                  onChangeText={handleBarcodeChange}
                />
              </View>
              <TouchableOpacity
                onPress={askForCameraPermission}
                style={styles.scanButton}
              >
                <Feather name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {barcodeExists && (
              <Text style={styles.errorText}>
                ⚠️ Este código de barra ya está registrado.
              </Text>
            )}
          </View>

          {/* Precio de Compra del Empaque */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Precio del Empaque ({money})</Text>
            <NebulaTextInput
              theme={theme}
              placeholder="Ej. 5.50"
              inputMode="numeric"
              value={price}
              onChangeText={setPrice}
            />
            <Text style={styles.helperText}>
              Precio de compra del empaque completo (ej. la caja).
            </Text>
          </View>

          {/* Estructura del empaque (Fila) */}
          <View style={styles.rowGroup}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Unid. por Empaque</Text>
              <NebulaTextInput
                theme={theme}
                placeholder="Ej. 36"
                inputMode="numeric"
                value={qtyEmpaque}
                onChangeText={setQtyEmpaque}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Contenido por Unid.</Text>
              <NebulaTextInput
                theme={theme}
                placeholder="Ej. 244"
                inputMode="numeric"
                value={qtyPresentacion}
                onChangeText={setQtyPresentacion}
              />
            </View>
          </View>
          <Text style={[styles.helperText, { marginTop: -8, marginBottom: 16 }]}>
            Ej. una caja de malta trae 36 botellas de 244 ml: Unid. por Empaque =
            36, Contenido por Unid. = 244, Unidad de Medida = Mililitros.
          </Text>

          {/* Unidad de Medida */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Unidad de Medida</Text>
            <SelectDropdown
              data={unitNames}
              defaultButtonText={selectedUnit.name}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              dropdownStyle={styles.dropdownMenu}
              rowStyle={styles.dropdownRow}
              rowTextStyle={styles.dropdownRowText}
              renderDropdownIcon={(isOpened) => (
                <Feather
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={theme.textSecondary}
                  size={18}
                />
              )}
              dropdownIconPosition="right"
              onSelect={(selectedItem, index) => {
                if (index === 0) {
                  setSelectedUnit({ id: null, name: "Seleccionar..." });
                } else {
                  const unit = units[index - 1];
                  setSelectedUnit({ id: unit?.id || null, name: selectedItem });
                }
              }}
              buttonTextAfterSelection={(selectedItem) => selectedItem}
              rowTextForSelection={(item) => item}
            />
          </View>

          {/* Stock inicial (solo al crear) */}
          {!product ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Stock Inicial (Unidades)</Text>
              <NebulaTextInput
                theme={theme}
                placeholder="Ej. 36"
                inputMode="numeric"
                value={initialStock}
                onChangeText={setInitialStock}
              />
              <Text style={styles.helperText}>
                Unidades individuales disponibles al registrar
                {parseFloat(initialStock) > 0 && parseFloat(qtyEmpaque) > 0
                  ? ` (equivale a ${(parseFloat(initialStock) / parseFloat(qtyEmpaque)).toFixed(2)} empaque(s))`
                  : ""}
                .
              </Text>
            </View>
          ) : (
            <View style={styles.stockInfoBox}>
              <Feather name="box" size={16} color={theme.brand} style={{ marginRight: 8 }} />
              <Text style={styles.stockInfoText}>
                Stock actual: {Number(product.stock || 0).toFixed(2)} unidades.
                Usa "Reponer" en el Inventario para ajustarlo.
              </Text>
            </View>
          )}

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
                    color: isFormValid ? "white" : "#F5F5F5",
                  }
            }
            iconContainerStyle={{ marginRight: 6 }}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Modal del Escáner */}
      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={styles.scannerModalContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "qr", "code128", "code39", "upc_a", "upc_e"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerText}>
              Apunta con la cámara al código de barra del producto
            </Text>
            <Button
              title="Cancelar"
              onPress={() => setIsScannerVisible(false)}
              buttonStyle={styles.cancelScannerButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const makeStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: t.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: t.shadowOpacity,
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
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 14,
    height: 46,
    width: "100%",
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    color: t.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
  },
  dropdownMenu: {
    backgroundColor: t.surface,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: t.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  dropdownRow: {
    borderBottomColor: t.border,
    height: 44,
  },
  dropdownRowText: {
    color: t.textPrimary,
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
    backgroundColor: t.brand,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonDisabledStyle: {
    backgroundColor: t.brand + "80",
  },
  buttonDisabledTitleStyle: {
    color: "#E4D5FF",
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  scanButton: {
    backgroundColor: t.brand,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    width: 46,
    height: 46,
    marginLeft: 8,
  },
  errorText: {
    color: t.danger,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  helperText: {
    fontSize: 11,
    color: t.textSecondary,
    marginTop: 6,
    lineHeight: 15,
  },
  stockInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.brand + "14",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: t.brand + "26",
  },
  stockInfoText: {
    flex: 1,
    fontSize: 12,
    color: t.textPrimary,
    fontWeight: "600",
    lineHeight: 16,
  },
  scannerModalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  scannerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 8,
  },
  cancelScannerButton: {
    backgroundColor: t.danger,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 14,
  },
});

export default NewProductScreen;
