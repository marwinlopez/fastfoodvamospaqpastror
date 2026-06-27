import React, { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const useTabNavigation = () => {
  const { tabActive, dispatch } = useContext(GlobalContext);


  // const selectTab = (tabIndex) => {
  //   console.log({tabIndex})
  //   dispatch({ type: "TAB_ACTIVE", payload: tabIndex });
  // }
  const selectTab = (tabIndex) => {
    console.log({tabIndex})
    if(tabIndex ===0){
      dispatch({ type: "TAB_ACTIVE", payload: "Recetas" });
    }else if(tabIndex === 1){
      dispatch({ type: "TAB_ACTIVE", payload: "Materiales" });
    }else if(tabIndex === 2){
      dispatch({ type: "TAB_ACTIVE", payload: "Listas" });
    }else{
      dispatch({ type: "TAB_ACTIVE", payload: "Recetas" });
    }
  }
  return {
    selectTab,
    tabActive
  };
};

export default useTabNavigation;