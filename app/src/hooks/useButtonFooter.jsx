import React, { useContext, useState } from "react";
import apis from "../../api";
import { GlobalContext } from "../context/GlobalContext";

const useButtonFooter = () => {
  const { ordering, isNewOrder, dispatch } = useContext(GlobalContext);


  const newOrder = (data) => {
    // console.log(data)
    dispatch({ type: "NEW_ORDER", payload: data });
  }

  return {
    ordering,
    isNewOrder,
    newOrder
  };
};

export default useButtonFooter;
