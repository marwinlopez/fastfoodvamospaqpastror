import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import apis from "../apis";
import { lightTheme, darkTheme } from "../constants/theme.tokens";
import useGlobal from "../hooks/useGlobal";
import { actionCreators } from "../hooks/GlobalReducer";

// Monedas comunes de la región (código + símbolo)
const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "VES", symbol: "Bs" },
  { code: "EUR", symbol: "€" },
  { code: "COP", symbol: "$" },
  { code: "MXN", symbol: "$" },
  { code: "PEN", symbol: "S/" },
];

const THEME_OPTIONS = [
  { value: "system", label: "Sistema", icon: "smartphone" },
  { value: "light", label: "Claro", icon: "sun" },
  { value: "dark", label: "Oscuro", icon: "moon" },
];

const CompanySettingsScreen = ({ navigation }) => {
  const { company, dispatch } = useGlobal();
  const systemScheme = useColorScheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Se inicializa con la empresa ya conocida globalmente (cargada al
  // iniciar sesión) para que la pantalla de carga no parpadee en claro
  // mientras se espera la respuesta del servidor.
  const [name, setName] = useState(company?.name || "");
  const [slogan, setSlogan] = useState(company?.slogan || "");
  const [phone, setPhone] = useState(company?.phone || "");
  const [address, setAddress] = useState(company?.address || "");
  const [currency, setCurrency] = useState(company?.currency || "USD");
  const [currencySymbol, setCurrencySymbol] = useState(company?.currencySymbol || "$");
  const [themeMode, setThemeMode] = useState(company?.themeMode || "system");

  // Preview en vivo: el tema se deriva de la selección local (no del estado
  // global), así el usuario ve el cambio de inmediato antes de guardar.
  const effectiveScheme =
    themeMode === "dark" ? "dark" : themeMode === "light" ? "light" : systemScheme;
  const theme = effectiveScheme === "dark" ? darkTheme : lightTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const applyCompany = (c) => {
    setName(c.name || "");
    setSlogan(c.slogan || "");
    setPhone(c.phone || "");
    setAddress(c.address || "");
    setCurrency(c.currency || "USD");
    setCurrencySymbol(c.currencySymbol || "$");
    setThemeMode(c.themeMode || "system");
  };

  const fetchCompany = async () => {
    try {
      const { data } = await apis.getCompany();
      if (data?.company) {
        applyCompany(data.company);
        dispatch(actionCreators.companySet(data.company));
      }
    } catch (error) {
      console.log("[CompanySettings] Error al cargar empresa:", error);
      if (company) applyCompany(company);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCurrency = (c) => {
    setCurrency(c.code);
    setCurrencySymbol(c.symbol);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      ToastAndroid.show("El nombre de la empresa es obligatorio", ToastAndroid.SHORT);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slogan: slogan.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency,
        currencySymbol,
        themeMode,
      };
      const { data } = await apis.updateCompany(payload);
      if (data?.company) {
        dispatch(actionCreators.companySet(data.company));
      }
      ToastAndroid.show("Datos de la empresa actualizados", ToastAndroid.SHORT);
    } catch (error) {
      console.log("[CompanySettings] Error al guardar:", error);
      ToastAndroid.show("Error al guardar. Intenta de nuevo.", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  // Header propio (temeado) para que el preview sea coherente arriba y abajo
  const Header = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.brandName} numberOfLines={1}>
          {(name || company?.name || "PA Q' PASTOR").toUpperCase()}
        </Text>
      </View>
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Mi Empresa</Text>
        <Text style={styles.subtitleText}>
          Configura los datos, moneda y apariencia del negocio.
        </Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.brand} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Datos del negocio */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos del Negocio</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Empresa</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. PA Q' PASTOR"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Eslogan / Rubro</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Venta de comida"
                placeholderTextColor={theme.textSecondary}
                value={slogan}
                onChangeText={setSlogan}
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 0412-1234567"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Av. Principal"
                  placeholderTextColor={theme.textSecondary}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>
          </View>

          {/* Moneda */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Moneda</Text>
            <Text style={styles.cardSubtitle}>
              Se usa en precios, costos e inventario de toda la app.
            </Text>
            <View style={styles.chipWrap}>
              {CURRENCIES.map((c) => {
                const active = currency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyChip, active && styles.currencyChipActive]}
                    onPress={() => selectCurrency(c)}
                  >
                    <Text
                      style={[
                        styles.currencyChipText,
                        active && styles.currencyChipTextActive,
                      ]}
                    >
                      {c.code} ({c.symbol})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Apariencia */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Apariencia</Text>
            <Text style={styles.cardSubtitle}>
              Elige el modo de color. La vista previa se aplica al instante.
            </Text>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => {
                const active = themeMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.themeCard, active && styles.themeCardActive]}
                    onPress={() => setThemeMode(opt.value)}
                  >
                    <Feather
                      name={opt.icon}
                      size={20}
                      color={active ? theme.brand : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeCardText,
                        active && { color: theme.brand },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Guardar */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (t) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: t.headerBg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backButton: {
      padding: 4,
      marginRight: 10,
    },
    brandName: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: 0.5,
      color: t.brand,
      flex: 1,
    },
    titleSection: {
      paddingHorizontal: 20,
      paddingTop: 12,
      marginBottom: 8,
    },
    titleText: {
      fontSize: 22,
      fontWeight: "800",
      color: t.textPrimary,
      marginBottom: 4,
    },
    subtitleText: {
      fontSize: 13,
      color: t.textSecondary,
      lineHeight: 18,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: t.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: t.shadowOpacity,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: t.brand,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 12,
      color: t.textSecondary,
      marginBottom: 14,
      lineHeight: 16,
    },
    inputGroup: {
      marginBottom: 14,
    },
    rowGroup: {
      flexDirection: "row",
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: t.textPrimary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: t.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 14,
      color: t.textPrimary,
      fontWeight: "600",
      borderWidth: 1,
      borderColor: t.border,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    currencyChip: {
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.inputBg,
      marginRight: 8,
      marginBottom: 8,
    },
    currencyChipActive: {
      backgroundColor: t.brand,
      borderColor: t.brand,
    },
    currencyChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: t.textSecondary,
    },
    currencyChipTextActive: {
      color: "#FFFFFF",
    },
    themeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    themeCard: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.inputBg,
      alignItems: "center",
      marginHorizontal: 4,
    },
    themeCardActive: {
      borderColor: t.brand,
      backgroundColor: t.brand + "12",
    },
    themeCardText: {
      fontSize: 12,
      fontWeight: "700",
      color: t.textSecondary,
      marginTop: 8,
    },
    saveButton: {
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      backgroundColor: t.brand,
      elevation: 2,
    },
    saveButtonText: {
      color: "#FFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });

export default CompanySettingsScreen;
