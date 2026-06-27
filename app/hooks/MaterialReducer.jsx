import apis from "../apis";

const types = {
  LOADING: "LOADING",
  ADD_RECIPE: "ADD_RECIPE",
  ADD_PRODUCT: "ADD_PRODUCT",
  ADD_UNIT_OF: "ADD_UNIT_OF",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
};

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (payload) => ({ type: types.SUCCESS, payload }),
  recipe: (payload) => ({ type: types.ADD_RECIPE, payload }),
  unitof: (payload) => ({ type: types.ADD_UNIT_OF, payload }),
  product: (payload) => ({ type: types.ADD_PRODUCT, payload }),
  addRecipe: async (payload) => {
    const { data } = await apis.newRecipe(payload);
    const { recipe } = data;
    return recipe;
  },
  getMaterial: async (payload) => {
    const { data } = await apis.ingredientForId(payload);
    const { ingredient } = data;
    return ingredient;
  },
  addIngredient: async (payload) => {
    const { data } = await apis.newIngredient(payload);
    const { success } = data;
    return success;
  },
};

export const stateIngredients = {
  loading: true,
  error: false,
  recipe: {},
  unitOf: [],
  product: {},
  ingredient: {},
};

export default (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOADING:
      return {
        ...state,
        loading: true,
        error: false,
        recipe: {},
        unitOf: [],
        product: {},
        ingredient: {},
      };
    case types.SUCCESS:
      return {
        ...state,
        loading: false,
        ingredient: payload,
      };
    case types.ADD_RECIPE:
      console.log(payload);
      return { ...state, recipe: payload };
    case types.ADD_UNIT_OF:
      return { ...state, unitOf: payload };
    case types.ADD_PRODUCT:
      return { ...state, product: payload };
    case types.FAILURE:
      return { ...state, loading: false, error: true };
  }
};
