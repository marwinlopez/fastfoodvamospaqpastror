import React, { createContext, useEffect, useReducer } from "react";
import GlobalReducer, {
  actionCreators,
  initialState,
} from "../hooks/GlobalReducer";
import { BackgroundSyncService } from "../services/BackgroundSyncService";
import AuthService from "../services/AuthService";
import apis from "../apis";

const GlobalContext = createContext();
const { Provider } = GlobalContext;

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);

  useEffect(() => {
    apis.setUnauthorizedHandler(() => dispatch(actionCreators.logout()));

    const initializeApp = async () => {
      dispatch(actionCreators.loading());
      try {
        // 1. Iniciar pre-carga de catálogos en segundo plano
        BackgroundSyncService.preloadCatalogCache();

        // 2. Intentar procesar cola de sincronización pendiente
        BackgroundSyncService.processSyncQueue();

        // 3. Restaurar sesión guardada, si hay una y sigue siendo válida
        const restoredStaff = await AuthService.restoreSession();
        if (restoredStaff) {
          dispatch(actionCreators.sessionRestored(restoredStaff));
        }
        const biometricEnabled = await AuthService.isBiometricEnabled();
        dispatch(actionCreators.biometricSet(biometricEnabled));
      } catch (error) {
        console.log("[GlobalContext] Error en inicialización:", error);
      } finally {
        dispatch(actionCreators.success({}));
      }
    };

    initializeApp();
  }, []);

  const value = {
    state,
    dispatch,
  };

  return <Provider value={value}>{children}</Provider>;
};

export { GlobalContext, GlobalProvider };
