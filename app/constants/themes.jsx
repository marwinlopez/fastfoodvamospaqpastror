const { Dimensions } = require("react-native");

const { width, height } = Dimensions.get('window');

export const COLORS = {
  default: '#5802F1',
  orange: "#f4511e",
  primary: '#570758',  // 99, 57, 116
  lightPurple: '#EBDEF0',
  grey: '#585656',
  lightGrey: '#DCDADD',
  white: '#FFFFFF',
  title: '#482755',
};

export const FORMSIZE = {
  default: 230,
  secundary: 270
}

export const SIZES = {
  h1: 24,
  h2: 20,
  h3: 18,
  h4: 16,
  h5: 14,
  h6: 12,
  h7: 10,
  width,
  height,
};

export const FONTWEIGHT = {
  bold: 'bold',
  normal: 'normal',
  weight500: '500',
  weight700: '700',
};