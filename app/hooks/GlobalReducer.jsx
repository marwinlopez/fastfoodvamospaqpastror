const types = {
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
};

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (payload) => ({ type: types.SUCCESS, payload }),
};

export const state = {
  loading: true,
  error: false,
  initial_state: [],
  decimalPrecission: 2,
};

export default (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOADING:
      return { ...state, loading: true, error: false, decimalPrecission: 2 };
    case types.SUCCESS:
      return { loading: false, error: false, initial_state: payload.data };
    case types.FAILURE:
      return { ...state, loading: false, error: true };
  }
};
