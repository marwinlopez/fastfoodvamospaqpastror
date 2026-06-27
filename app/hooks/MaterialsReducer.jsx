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

export const initialState = {
  loading: true,
  error: false,
  products: [],
};

export default (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOADING:
      return { ...state, loading: true, error: false };
    case types.SUCCESS:
      return { loading: false, error: false, products: payload };
    case types.FAILURE:
      return { ...state, loading: false, error: true };
  }
};
