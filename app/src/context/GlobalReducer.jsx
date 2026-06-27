import {
  CARD_SELECTED,
  INIT,
  NEWRECIPE,
  NEW_ORDER,
  RECIPES,
  ROUTE_NAME,
  TAB_ACTIVE,
} from "./action";

export default (state, action) => {
  const { payload, type } = action;

  switch (type) {
    case INIT:
      return {
        ...state,
        isLoading: false,
      };
    case NEW_ORDER:
      return {
        ...state,
        isNewOrder: payload,
      };
    case CARD_SELECTED:
      return {
        ...state,
        cardSelected: payload,
      };
    case TAB_ACTIVE:
      return {
        ...state,
        tab: payload,
      };
    case RECIPES:
      return {
        ...state,
        recipes: payload,
      };
    case NEWRECIPE:
      console.log({ payload });
      return {
        ...state,
        newRecipe: payload,
      };
    case ROUTE_NAME:
      return {
        ...state,
        routeName: payload,
      };
    //  console.log(payload);
    default:
      return state;
  }
};
