import React, { createContext, useEffect, useRef, useReducer } from "react";
import { AppState } from "react-native";
import GlobalReducer, {
  actionCreators,
  initialState,
} from "../hooks/GlobalReducer";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import AuthService from "../services/AuthService";
import { isLockSuppressed } from "../services/AppLockGuard";
import apis from "../apis";

const GlobalContext = createContext();
const { Provider } = GlobalContext;

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    apis.setUnauthorizedHandler(() => dispatch(actionCreators.logout()));

    const initializeApp = async () => {
      dispatch(actionCreators.loading());
      try {
        // 1. Restaurar sesión primero: todas las rutas requieren token, así
        // que hay que armarlo antes de disparar cualquier llamada a la API
        // (si no, la pre-carga y la cola de sincronización salen sin
        // Authorization y rebotan con 401).
        // Si tiene biometría activada, la app arranca bloqueada (como el
        // bloqueo de WhatsApp/bancos) y hay que confirmar la huella antes
        // de mostrar cualquier pantalla.
        const biometricEnabled = await AuthService.isBiometricEnabled();
        const restoredStaff = await AuthService.restoreSession();
        if (restoredStaff) {
          dispatch(actionCreators.sessionRestored(restoredStaff, biometricEnabled));
        }
        dispatch(actionCreators.biometricSet(biometricEnabled));

        // 2. Con el token ya armado (si hay sesión), recién ahí pre-cargar
        // catálogos, la empresa (marca/moneda/tema) y procesar la cola de
        // sincronización pendiente.
        if (restoredStaff) {
          BackgroundSyncService.preloadCatalogCache();
          BackgroundSyncService.processSyncQueue();
          try {
            const { data } = await apis.getCompany();
            if (data?.company) dispatch(actionCreators.companySet(data.company));
          } catch (err) {
            console.log("[GlobalContext] No se pudo cargar la empresa:", err?.message);
          }
        }
      } catch (error) {
        console.log("[GlobalContext] Error en inicialización:", error);
      } finally {
        dispatch(actionCreators.success({}));
      }
    };

    initializeApp();

    // Vuelve a bloquear la app cada vez que regresa de segundo plano
    // (no solo al arranque en frío), si la huella está activada.
    const subscription = AppState.addEventListener("change", (nextState) => {
      const { isAuthenticated, biometricEnabled } = stateRef.current;
      if (nextState === "active" && isAuthenticated && biometricEnabled) {
        // No bloquear si el segundo plano fue por algo esperado dentro del
        // propio flujo (selector de imágenes, cámara), no por salir de la app.
        if (isLockSuppressed()) return;
        dispatch(actionCreators.lock());
      }
    });

    return () => subscription.remove();
  }, []);

  const value = {
    state,
    dispatch,
  };

  return <Provider value={value}>{children}</Provider>;
};

export { GlobalContext, GlobalProvider };
