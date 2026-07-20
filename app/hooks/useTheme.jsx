import { useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "../constants/theme.tokens";

const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
};

export default useTheme;
