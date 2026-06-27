import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

const useGlobal = () => {
  const { state } = useContext(GlobalContext);
  const [globalState, setGlobalState] = useState();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  useEffect(() => {
    function loading() {
      // console.log(state);
      setLoading(!state.loading);
    }

    return () => {
      loading();
    };
  }, [state]);

  return {
    loading,
    setLoading,
  };
};

export default useGlobal;
