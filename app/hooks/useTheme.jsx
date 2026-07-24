import { useContext } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "../constants/theme.tokens";
import { GlobalContext } from "../context/GlobalContext";

// Devuelve los tokens de color según la preferencia de la empresa:
//   - "light" / "dark": fuerza ese modo.
//   - "system" (default): sigue el esquema del sistema operativo.
const useTheme = () => {
  const systemScheme = useColorScheme();
  const context = useContext(GlobalContext);
  const themeMode = context?.state?.company?.themeMode || "system";

  let effective;
  if (themeMode === "dark") effective = "dark";
  else if (themeMode === "light") effective = "light";
  else effective = systemScheme; // "system"

  return effective === "dark" ? darkTheme : lightTheme;
};

export default useTheme;
