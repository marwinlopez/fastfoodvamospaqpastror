import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "./src/constants/themes";
import NavigatorScreen from "./navigation";
import { GlobalProvider } from "./context/GlobalContext";

export default function App() {
  return (
    <GlobalProvider>
      <SafeAreaProvider>
        <StatusBar
          networkActivityIndicatorVisible
          style="inverted"
          backgroundColor={COLORS.default}
        />
        <NavigationContainer>
          <NavigatorScreen />
        </NavigationContainer>
      </SafeAreaProvider>
      {/* {Platform.OS === "android" ? <NavigatorScreen /> : <Web />} */}
    </GlobalProvider>
  );
}

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <NavigationContainer>
//         <GlobalProvider>
//           <StatusBar
//             networkActivityIndicatorVisible
//             style="inverted"
//             backgroundColor={COLORS.default}
//           />
//           {Platform.OS === "android" ? <NavigatorScreen /> : <Web />}
//         </GlobalProvider>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }
