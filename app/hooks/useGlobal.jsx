import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

const useGlobal = () => {
  const { state } = useContext(GlobalContext);
  const [loading, setLoading] = useState(state.loading);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(state.loading);
  }, [state.loading]);

  return {
    loading,
    setLoading,
  };
};

export default useGlobal;
