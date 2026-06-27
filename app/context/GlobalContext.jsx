import React, { createContext, useEffect, useReducer } from "react";
import GlobalReducer, {
  actionCreators,
  initialState,
} from "../hooks/GlobalReducer";
import { ActivityIndicator, View } from "react-native";
import apis from "../apis";

const GlobalContext = createContext();
const { Provider, Consumer } = GlobalContext;
// const INITIAL_STATE = {
//   user: null,
//   token: null,
//   products: [],
//   recipes: [],
//   routeName: "index",
//   ordering: [],
//   locations: [],
//   isNewOrder: [],
//   newRecipe: null,
//   cardSelected: {},
//   isLoading: false,
//   tab: 0,
//   decimalPrecission: 2,
// };

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState);

  useEffect(() => {
    dispatch(actionCreators.loading());

    // async function fetchMaterials() {
    //   try {
    //     const { data } = await apis.allProducts();
    //     console.log(data);
    //     dispatch(actionCreators.success(data));
    //   } catch (error) {}
    // }

    return () => {
      setTimeout(() => {
        // fetchMaterials();
        dispatch(actionCreators.success({}));
      }, 6000);
    };
  }, []);

  // const value = useMemo(
  //   () => ({
  //     ordering: state.ordering,
  //     isNewOrder: state.isNewOrder,
  //     tabActive: state.tab,
  //     recipes: state.recipes,
  //     recipe,
  //     routeName: state.routeName,
  //     getRecipe,
  //     setRecipe,
  //     dispatch,
  //   }),
  //   [state]
  // );

  const value = {
    state,

    dispatch,
  };

  return <Provider value={value}>{children}</Provider>;
};

export { GlobalContext, GlobalProvider };
