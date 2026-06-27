import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { NewOrder } from "../constants/initial";
import GlobalReducer from "./GlobalReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../../database/firebase";
import { useNavigation } from "@react-navigation/native";
import apis from "../../api";

const GlobalContext = createContext();
const { Provider, Consumer } = GlobalContext;
const INITIAL_STATE = {
  user: null,
  token: null,
  products: [],
  recipes: [],
  routeName: "index",
  ordering: [],
  locations: [],
  isNewOrder: NewOrder,
  newRecipe: null,
  cardSelected: {},
  isLoading: false,
  tab: 0,
};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, INITIAL_STATE);

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
