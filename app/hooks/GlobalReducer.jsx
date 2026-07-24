const types = {
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SESSION_RESTORED: "SESSION_RESTORED",
  BIOMETRIC_SET: "BIOMETRIC_SET",
  LOCK: "LOCK",
  UNLOCK: "UNLOCK",
  COMPANY_SET: "COMPANY_SET",
};

// Empresa por defecto mientras carga (evita textos vacíos en el primer render)
export const DEFAULT_COMPANY = {
  id: "company-default",
  name: "PA Q' PASTOR",
  slogan: "Venta de comida",
  phone: "",
  address: "",
  currency: "USD",
  currencySymbol: "$",
  themeMode: "system",
};

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (payload) => ({ type: types.SUCCESS, payload }),
  loginSuccess: (staff) => ({ type: types.LOGIN_SUCCESS, payload: { staff } }),
  logout: () => ({ type: types.LOGOUT }),
  // requiresUnlock: true cuando la sesión se restaura sola al abrir la app
  // (debe pedir biometría antes de mostrar nada); false en un login recién
  // hecho a mano (ya se probó identidad, no hace falta bloquear de nuevo).
  sessionRestored: (staff, requiresUnlock) => ({
    type: types.SESSION_RESTORED,
    payload: { staff, requiresUnlock },
  }),
  biometricSet: (enabled) => ({ type: types.BIOMETRIC_SET, payload: { enabled } }),
  lock: () => ({ type: types.LOCK }),
  unlock: () => ({ type: types.UNLOCK }),
  companySet: (company) => ({ type: types.COMPANY_SET, payload: { company } }),
};

export const initialState = {
  loading: true,
  error: false,
  initial_state: [],
  decimalPrecission: 2,
  isAuthenticated: false,
  user: null,
  biometricEnabled: false,
  isUnlocked: true,
  company: DEFAULT_COMPANY,
};

export default (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOADING:
      return { ...state, loading: true, error: false, decimalPrecission: 2 };
    case types.SUCCESS:
      return { ...state, loading: false, error: false, initial_state: payload.data };
    case types.FAILURE:
      return { ...state, loading: false, error: true };
    case types.LOGIN_SUCCESS:
      return { ...state, isAuthenticated: true, user: payload.staff, isUnlocked: true };
    case types.SESSION_RESTORED:
      return {
        ...state,
        isAuthenticated: true,
        user: payload.staff,
        isUnlocked: !payload.requiresUnlock,
      };
    case types.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        biometricEnabled: false,
        isUnlocked: true,
        company: DEFAULT_COMPANY,
      };
    case types.BIOMETRIC_SET:
      return { ...state, biometricEnabled: payload.enabled };
    case types.LOCK:
      return { ...state, isUnlocked: false };
    case types.UNLOCK:
      return { ...state, isUnlocked: true };
    case types.COMPANY_SET:
      return { ...state, company: { ...DEFAULT_COMPANY, ...payload.company } };
    default:
      return state;
  }
};
