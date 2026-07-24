// Tokens de color claro/oscuro para las pantallas nuevas de autenticación.
// No toca app/constants/themes.jsx a propósito: ese archivo lo importan
// directamente varias de las pantallas existentes, y el modo oscuro por
// ahora solo debe aplicar a las pantallas nuevas (LoginScreen).

export const lightTheme = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  inputBg: "#F7F8FA",
  headerBg: "#FFFFFF",
  textPrimary: "#1A1D20",
  textSecondary: "#8E9AA6",
  border: "#F0F0F0",
  brand: "#5802F1",
  danger: "#FF3B30",
  success: "#059669",
  warning: "#f4511e",
  shadowColor: "#000",
  shadowOpacity: 0.02,
};

export const darkTheme = {
  background: "#121212",
  surface: "#1E1E1E",
  inputBg: "#2A2A2E",
  headerBg: "#1A1A1D",
  textPrimary: "#F5F5F7",
  textSecondary: "#A0A8B4",
  border: "#2A2D31",
  brand: "#8B2FFF",
  danger: "#FF6B6B",
  success: "#34D399",
  warning: "#FF7A50",
  shadowColor: "#000",
  shadowOpacity: 0.35,
};
