import apis from "../apis";

const types = {
  LOADING: "LOADING",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  ISADD: "ISADD",
  ISSHOWDETAILS: "ISSHOWDETAILS",
  CHANGENAME: "CHANGENAME",
};

const recipe = {
  recipeId: 0,
  name: "",
  coin: "$",
  cost: "0.00",
  profit: "0.00",
  price: "0.00",
  ingredients: [],
};

export const actionCreators = {
  loading: () => ({ type: types.LOADING }),
  failure: () => ({ type: types.FAILURE }),
  success: (payload) => ({ type: types.SUCCESS, payload }),
  changeName: (payload) => ({ type: types.CHANGENAME, payload }),
  isShowDetails: (payload) => ({ type: types.ISSHOWDETAILS, payload }),
  editRecipe: async (payload) => {
    const { data } = await apis.recipeForId(payload);
    const { recipe } = data;
    return recipe;
  },
};

export const initialState = {
  loading: true,
  error: false,
  isAddQuantity: true,
  isShowDetails: false,
  recipe: null,
};

export default (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case types.LOADING:
      return { ...state, loading: true, error: false, recipe: recipe };
    case types.SUCCESS:
      const { name } = payload;
      console.log(name);
      return {
        loading: false,
        error: false,
        recipe: payload,
        isAddQuantity: name === "",
      };
    case types.FAILURE:
      return { ...state, loading: false, error: true };
    case types.ISADD:
      return { ...state, loading: false, error: true };
    case types.ISSHOWDETAILS:
      return { ...state, isShowDetails: payload.ingredients?.length > 0 };
    case types.CHANGENAME:
      return {
        ...state,
        recipe: {
          ...(state.recipe || recipe),
          name: payload,
        },
        isAddQuantity: payload.trim().length === 0,
      };
  }
};
