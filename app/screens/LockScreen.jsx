import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import useTheme from "../hooks/useTheme";
import useGlobal from "../hooks/useGlobal";
import { actionCreators } from "../hooks/GlobalReducer";
import AuthService from "../services/AuthService";

const LockScreen = () => {
  const theme = useTheme();
  const { user, dispatch } = useGlobal();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const tryUnlock = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Desbloquea tu sesión",
      });
      if (result.success) {
        dispatch(actionCreators.unlock());
      } else {
        setErrorMessage("No se reconoció tu huella. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.log("[LockScreen] Error al desbloquear:", error);
      setErrorMessage("No se pudo abrir el sensor de huella.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    tryUnlock();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    dispatch(actionCreators.logout());
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.brand}15` }]}>
          <Feather name="lock" size={28} color={theme.brand} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>App bloqueada</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {user?.name ? `Hola, ${user.name}. ` : ""}Confirma tu huella para continuar.
        </Text>

        {errorMessage ? (
          <Text style={[styles.errorText, { color: theme.danger }]}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.unlockButton, { backgroundColor: theme.brand }]}
          onPress={tryUnlock}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="unlock" size={18} color="#FFFFFF" />
              <Text style={styles.unlockButtonText}>Desbloquear con huella</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
          <Text style={[styles.logoutLinkText, { color: theme.textSecondary }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  unlockButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  logoutLink: {
    marginTop: 20,
    paddingVertical: 10,
  },
  logoutLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default LockScreen;
