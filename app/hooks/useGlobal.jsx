import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const useGlobal = () => {
  const { state, dispatch } = useContext(GlobalContext);
  const [loading, setLoading] = useState(state.loading);
  const [isAuthenticated, setIsAuthenticated] = useState(state.isAuthenticated);
  const [user, setUser] = useState(state.user);
  const [biometricEnabled, setBiometricEnabled] = useState(state.biometricEnabled);
  const [isUnlocked, setIsUnlocked] = useState(state.isUnlocked);
  const [company, setCompany] = useState(state.company);

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

  useEffect(() => {
    setIsUnlocked(state.isUnlocked);
  }, [state.isUnlocked]);

  useEffect(() => {
    setCompany(state.company);
  }, [state.company]);

  return {
    loading,
    setLoading,
    isAuthenticated,
    user,
    biometricEnabled,
    isUnlocked,
    company,
    dispatch,
  };
};

export default useGlobal;
