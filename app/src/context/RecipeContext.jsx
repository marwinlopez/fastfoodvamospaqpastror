import { createContext, useEffect, useMemo, useState } from "react";

const RecipeContext = createContext();
const { Provider, Consumer } = RecipeContext;

const RecipeProvider = ({ children }) => {
  const [routeName, setRouteName] = useState("RecipesScreen");
  useEffect(() => {
    console.log("RecipeContext");
  }, []);

  const value = useMemo(
    () => ({
      routeName,
    }),
    [routeName]
  );

  return <Provider value={value}>{children}</Provider>;
};

export { RecipeContext, RecipeProvider };
