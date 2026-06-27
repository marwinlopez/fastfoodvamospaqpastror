import { StyleSheet } from "react-native";
import { COLORS } from "../constants/themes";

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  btnDetails: {
    flex: 1,
    flexDirection: "column",
    margin: 1,
    borderRadius: 10,
    backgroundColor: COLORS.default,
    justifyContent: "center",
    alignItems: "center",
  },

  card_template: {
    flex: 1,
    height: 50,
    flexDirection: "column",
    margin: 5,
    borderRadius: 10,
    backgroundColor: COLORS.default,
    padding: 5,
  },
  card_template_list: {
    margin: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    backgroundColor: COLORS.default,
    boxShadow: "10px 10px 17px -12px rgba(10,10,100,0.75)",
    // marginBottom: 10,
    padding: 1,
  },
  card_image: {
    height: 250,
    borderRadius: 10,
  },
  text_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.default,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  card_title: {
    fontWeight: "bold",
    color: "white",
  },
  imageThumbnail: {
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: 120,
  },
});

export default appStyles;
