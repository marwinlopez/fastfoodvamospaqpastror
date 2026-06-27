import React, { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const useTabButtonFooter = () => {
  const { tabActive, dispatch } = useContext(GlobalContext);


  const selectTab = (tabIndex) => {
    // console.log(data)
    dispatch({ type: "TAB_ACTIVE", payload: data });
  }

  return {
    selectTab,
    tabActive
  };
};

export default useTabButtonFooter;