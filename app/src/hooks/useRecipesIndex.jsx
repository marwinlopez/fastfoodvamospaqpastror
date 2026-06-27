import React, { useContext, useState } from "react";
import apis from "../../api";
import { GlobalContext } from "../context/GlobalContext";
import { useEffect } from "react";
import {} from "@react-navigation/stack";
const useRecipesIndex = () => {
  const { state, recipes, recipe, dispatch } = useContext(GlobalContext);

  useEffect(() => {
    if (recipes.length == 0) {
      // console.log("con data", recipes);
      apis
        .recipeAll()
        .then(({ data }) => {
          return data;
        })
        .then(({ data }) => {
          dispatch({ type: "RECIPES", payload: data });
        });
    }
    console.log(state.newRecipe);
  }, [recipes]);

  const getRecipe = () => {
    return state.newRecipe;
  };
  // useEffect(()=>{
  //   console.log(recipe);
  // },[recipe])

  return {
    recipes,
    recipe,
    getRecipe,
  };
};

export default useRecipesIndex;
