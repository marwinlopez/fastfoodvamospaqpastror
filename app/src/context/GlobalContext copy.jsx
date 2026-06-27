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

const GlobalProvider2 = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, INITIAL_STATE);
  const [recipe, setRecipe] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const navigation = useNavigation();
  // const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } =
  //   firebase;

  // useEffect(() => {
  //   ((async) => {
  //     getScreen();
  //   })();
  // }, [initialState]);

  // const getScreen = async () => {
  //   if (initialState) {
  //     const { state } = initialState.routes[initialState.index];
  //     const current = state.routes[state.index].name;
  //     setLastScreen(currentScreen);
  //     setCurrentScreen(current);
  //   }
  // };

  useEffect(() => {
    // console.log("GlobalPRovider2", recipe);
    // dispatch({ type: "NEWRECIPE", payload: recipe });
  }, []);
  useEffect(() => {
    console.log("Actualizando GlobalProvider2", recipe, state);
    // setIsNewOrder(state.isNewOrder)
    // AsyncStorage.setItem("auth", JSON.stringify({
    //   email:'marwinlopez@gmail.com',
    //   password: 'password123456'
    // }));
    AsyncStorage.getItem("auth")
      .then((res) => {
        // const auth = JSON.parse(res);
        // console.log(auth);
        // if (auth) handleSignIn(auth.email, auth.password)
        // else navigation.navigate("Login");
      })
      .catch(() => console.log("error"));
    // apis.recipeAll().then(({ data })=>{
    //   return data;
    // }).then(({data})=>{
    //   dispatch({ type: "RECIPES", payload: data });
    // });
  }, []);

  const handleCreateAccount = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        handleSignIn(email, password);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleSignIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential;
        console.log(user);
        navigation.navigate("Home");
      })
      .catch((error) => {
        console.log("error");
        handleCreateAccount();
      });
  };

  const getRecipe = () => {
    return recipe;
  };

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
    ordering: state.ordering,
    isNewOrder: state.isNewOrder,
    tabActive: state.tab,
    recipes: state.recipes,
    recipe,
    routeName: state.routeName,
    initialState,
    setInitialState,
    getRecipe,
    setRecipe,
    dispatch,
  };

  return <Provider value={value}>{children}</Provider>;
};

export { GlobalContext, GlobalProvider2 };
