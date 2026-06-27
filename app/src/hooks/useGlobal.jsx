import React, { useContext, useEffect, useState } from "react";
import apis from "../../api";
import { GlobalContext } from "../context/GlobalContext";

const useGlobal = () => {
  const { ordering, isNewOrder, tabActive, recipes, newRecipe, dispatch } = useContext(GlobalContext);
  const [recipe, setRecipe] = useState([])
  
  useEffect(() => {
    // console.log('se ordeno');
    setRecipe(recipes.sort((a, b) => (a.name.toString().localeCompare(b.name))));
  }, [recipes])

  const newOrder = (data) => {
    dispatch({ type: "NEW_ORDER", payload: data });
  }

  return {
    recipe: recipe,
    ordering,
    isNewOrder,
    tabActive,
    newOrder,
    newRecipe,
    dispatch: dispatch
  };
};

export default useGlobal;
