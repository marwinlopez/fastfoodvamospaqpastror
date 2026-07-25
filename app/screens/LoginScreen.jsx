import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import NebulaTextInput from "../components/NebulaTextInput";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";
import { actionCreators } from "../hooks/GlobalReducer";
import AuthService from "../services/AuthService";
import apis from "../apis";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Carga la empresa (marca/moneda/tema) tras un login exitoso.
const loadCompany = async (dispatch) => {
  try {
    const { data } = await apis.getCompany();
    if (data?.company) dispatch(actionCreators.companySet(data.company));
  } catch (err) {
    console.log("[LoginScreen] No se pudo cargar la empresa:", err?.message);
  }
};

const LoginScreen = () => {
  const theme = useTheme();
  const { dispatch } = useGlobal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showBiometricUnlock, setShowBiometricUnlock] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const [hasToken, biometricEnabled, biometricAvailable] = await Promise.all([
        AuthService.hasStoredToken(),
        AuthService.isBiometricEnabled(),
        AuthService.isBiometricAvailable(),
      ]);
      setShowBiometricUnlock(hasToken && biometricEnabled && biometricAvailable);
    };
    checkBiometric();
  }, []);

  const offerBiometricEnrollment = async () => {
    const available = await AuthService.isBiometricAvailable();
    const alreadyEnabled = await AuthService.isBiometricEnabled();
    if (!available || alreadyEnabled) return;

    Alert.alert(
      "Desbloqueo con huella",
      "¿Quieres activar el acceso rápido con tu huella para la próxima vez?",
      [
        { text: "Ahora no", style: "cancel" },
        {
          text: "Activar",
          onPress: async () => {
            // En Android, si el prompt nativo de huella se dispara mientras
            // este Alert todavía se está cerrando, el SO a veces lo ignora.
            await wait(300);
            const result = await AuthService.enableBiometric();
            if (result.success) {
              dispatch(actionCreators.biometricSet(true));
              Alert.alert("Listo", "Desbloqueo con huella activado.");
            } else {
              Alert.alert(
                "No se pudo activar",
                result.error || "No se reconoció tu huella. Inténtalo de nuevo desde Ajustes."
              );
            }
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Ingresa tu correo y contraseña");
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const staff = await AuthService.login(email.trim(), password);
      dispatch(actionCreators.loginSuccess(staff));
      await loadCompany(dispatch);
      await offerBiometricEnrollment();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Credenciales inválidas"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setBiometricBusy(true);
    setErrorMessage(null);
    try {
      const staff = await AuthService.promptBiometricUnlock();
      if (staff) {
        dispatch(actionCreators.loginSuccess(staff));
        await loadCompany(dispatch);
      }
    } finally {
      setBiometricBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={[styles.logoCircle, { backgroundColor: `${theme.brand}15` }]}>
            <Feather name="lock" size={28} color={theme.brand} />
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            PA Q' PASTOR
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Inicia sesión para continuar
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadowColor,
                shadowOpacity: theme.shadowOpacity,
              },
            ]}
          >
            {showBiometricUnlock ? (
              <>
                <TouchableOpacity
                  style={[styles.biometricButton, { backgroundColor: `${theme.brand}12` }]}
                  onPress={handleBiometricUnlock}
                  disabled={biometricBusy}
                  activeOpacity={0.8}
                >
                  {biometricBusy ? (
                    <ActivityIndicator color={theme.brand} />
                  ) : (
                    <>
                      <Feather name="unlock" size={20} color={theme.brand} />
                      <Text style={[styles.biometricButtonText, { color: theme.brand }]}>
                        Desbloquear con huella
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.useOtherAccount}
                  onPress={() => setShowBiometricUnlock(false)}
                >
                  <Text style={[styles.useOtherAccountText, { color: theme.textSecondary }]}>
                    Usar correo y contraseña
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Correo electrónico
                  </Text>
                  <NebulaTextInput
                    theme={theme}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@correo.com"
                    inputMode="email"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Contraseña
                  </Text>
                  <NebulaTextInput
                    theme={theme}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    autoCapitalize="none"
                    secureTextEntry
                  />
                </View>

                {errorMessage ? (
                  <Text style={[styles.errorText, { color: theme.danger }]}>
                    {errorMessage}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.brand }]}
                  onPress={handleLogin}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Iniciar sesión</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  submitButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  biometricButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  useOtherAccount: {
    alignItems: "center",
    paddingVertical: 14,
  },
  useOtherAccountText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default LoginScreen;
