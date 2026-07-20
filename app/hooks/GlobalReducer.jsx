const types = {
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  SESSION_RESTORED: "SESSION_RESTORED",
  BIOMETRIC_SET: "BIOMETRIC_SET",
};

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (payload) => ({ type: types.SUCCESS, payload }),
  loginSuccess: (staff) => ({ type: types.LOGIN_SUCCESS, payload: { staff } }),
  logout: () => ({ type: types.LOGOUT }),
  sessionRestored: (staff) => ({ type: types.SESSION_RESTORED, payload: { staff } }),
  biometricSet: (enabled) => ({ type: types.BIOMETRIC_SET, payload: { enabled } }),
};

export const initialState = {
  loading: true,
  error: false,
  initial_state: [],
  decimalPrecission: 2,
  isAuthenticated: false,
  user: null,
  biometricEnabled: false,
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
    case types.SESSION_RESTORED:
      return { ...state, isAuthenticated: true, user: payload.staff };
    case types.LOGOUT:
      return { ...state, isAuthenticated: false, user: null, biometricEnabled: false };
    case types.BIOMETRIC_SET:
      return { ...state, biometricEnabled: payload.enabled };
    default:
      return state;
  }
};
