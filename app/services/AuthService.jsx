import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apis from "../apis";
import { BackgroundSyncService } from "./BackgroundSyncService";

const SECURE_KEYS = {
  TOKEN: "auth_token",
};

const CACHE_KEYS = {
  BIOMETRIC_ENABLED: "@auth_biometric_enabled",
  TOKEN_FALLBACK: "@auth_token_fallback",
};

// expo-secure-store usa el Keychain/Keystore nativo en iOS/Android, pero no
// tiene una implementación funcional en el navegador web (usado aquí solo
// como entorno de prueba). Si SecureStore falla, se cae a AsyncStorage para
// que el flujo de login siga siendo probable en web sin afectar el
// comportamiento real en dispositivo, donde SecureStore siempre funciona.
const secureSet = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    await AsyncStorage.setItem(CACHE_KEYS.TOKEN_FALLBACK, value);
  }
};

const secureGet = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return await AsyncStorage.getItem(CACHE_KEYS.TOKEN_FALLBACK);
  }
};

const secureDelete = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // no-op, SecureStore no disponible
  }
  await AsyncStorage.removeItem(CACHE_KEYS.TOKEN_FALLBACK).catch(() => {});
};

export const AuthService = {
  // Login con email/contraseña contra el backend
  async login(email, password) {
    const { data } = await apis.login({ email, password });
    await secureSet(SECURE_KEYS.TOKEN, data.token);
    apis.setAuthToken(data.token);
    return data.staff;
  },

  // Cierra sesión: limpia token y preferencia de biometría
  async logout() {
    try {
      await secureDelete(SECURE_KEYS.TOKEN);
      await AsyncStorage.removeItem(CACHE_KEYS.BIOMETRIC_ENABLED);
      await BackgroundSyncService.clearSyncQueue();
    } catch (error) {
      console.log("[AuthService] Error al cerrar sesión:", error);
    }
    apis.setAuthToken(null);
  },

  // Intenta restaurar una sesión guardada, validándola contra el backend.
  // Solo limpia el token si el backend lo rechaza explícitamente (401) —
  // un error de red (sin conexión) no debe borrar una sesión válida, para
  // que el desbloqueo por huella pueda reintentarla más tarde.
  async restoreSession() {
    try {
      const token = await secureGet(SECURE_KEYS.TOKEN);
      if (!token) return null;

      apis.setAuthToken(token);
      const { data } = await apis.getMe();
      return data.staff;
    } catch (error) {
      console.log("[AuthService] No se pudo restaurar la sesión:", error);
      apis.setAuthToken(null);
      if (error.response?.status === 401) {
        await secureDelete(SECURE_KEYS.TOKEN);
      }
      return null;
    }
  },

  async hasStoredToken() {
    const token = await secureGet(SECURE_KEYS.TOKEN);
    return !!token;
  },

  // ¿El dispositivo tiene sensor biométrico configurado y con huellas/rostro enrolados?
  async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.log("[AuthService] Error verificando hardware biométrico:", error);
      return false;
    }
  },

  async isBiometricEnabled() {
    try {
      const value = await AsyncStorage.getItem(CACHE_KEYS.BIOMETRIC_ENABLED);
      return value === "true";
    } catch (error) {
      return false;
    }
  },

  async setBiometricEnabled(enabled) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.BIOMETRIC_ENABLED, enabled ? "true" : "false");
    } catch (error) {
      console.log("[AuthService] Error guardando preferencia de biometría:", error);
    }
  },

  // Habilita biometría: confirma que el sensor funciona antes de activarlo
  async enableBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirma tu huella para activar el acceso rápido",
      });
      console.log("[AuthService] Resultado de authenticateAsync:", JSON.stringify(result));
      if (result.success) {
        await this.setBiometricEnabled(true);
      }
      return result;
    } catch (error) {
      console.log("[AuthService] Error activando biometría:", error);
      return { success: false, error: error?.message || "unknown" };
    }
  },

  // Desbloquea la app con biometría; el token ya guardado se re-arma en el
  // interceptor de axios. La huella nunca reemplaza ni guarda la contraseña.
  async promptBiometricUnlock() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Desbloquea con tu huella",
      });
      if (!result.success) return null;
      return await this.restoreSession();
    } catch (error) {
      console.log("[AuthService] Error en desbloqueo biométrico:", error);
      return null;
    }
  },
};

export default AuthService;
