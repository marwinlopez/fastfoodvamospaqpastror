import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const useGlobal = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [loading, setLoading] = useState(state.loading);
  const [isAuthenticated, setIsAuthenticated] = useState(state.isAuthenticated);
  const [user, setUser] = useState(state.user);
  const [biometricEnabled, setBiometricEnabled] = useState(state.biometricEnabled);

  useEffect(() => {
    setLoading(state.loading);
  }, [state.loading]);

  useEffect(() => {
    setIsAuthenticated(state.isAuthenticated);
  }, [state.isAuthenticated]);

  useEffect(() => {
    setUser(state.user);
  }, [state.user]);

  useEffect(() => {
    setBiometricEnabled(state.biometricEnabled);
  }, [state.biometricEnabled]);

  return {
    loading,
    setLoading,
    isAuthenticated,
    user,
    biometricEnabled,
    dispatch,
  };
};

export default useGlobal;
