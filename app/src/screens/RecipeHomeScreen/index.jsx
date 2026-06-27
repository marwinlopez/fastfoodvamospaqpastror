import {
  FlatList,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../../constants/themes";
import { View } from "react-native-animatable";

const Menu = [
  {
    id: 1,
    item: "Recetas",
    url: "RecipesScreen",
    source: require("../../../assets/Menu.png"),
  },
  {
    id: 2,
    item: "Pedidos",
    url: "OrderScreen",
    source: require("../../../assets/pedidos.png"),
  },
  {
    id: 3,
    item: "Menu",
    url: "MenuScreen",
    source: require("../../../assets/menu-logo.png"),
  },
  {
    id: 4,
    item: "Mesas",
    url: "TableScreen",
    source: require("../../../assets/tables2.png"),
  },
  {
    id: 5,
    item: "Delivery",
    url: "DeliveryScreen",
    source: require("../../../assets/delivery.png"),
  },
];

const RecipeHomeScreen = ({ route, navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Grid>
        <Row
          style={{
            height: "30%",
            alignItems: "center",
            backgroundColor: COLORS.default,
          }}
        >
          <Col
            style={{
              flex: 1,
              height: "100%",
              paddingTop: 10,
            }}
          >
            <ImageBackground
              resizeMode="center"
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}
              imageStyle={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}
              source={require("../../../assets/logoJl.png")}
            ></ImageBackground>
          </Col>
        </Row>

        {/* <Row style={{ height: 35 }}>
          <Col>
            <ToastNebula title={"Mostrar Mensaje"} message={"Hola Mundo!!!"} />
          </Col>
        </Row> */}
        <Row
          style={{
            margin: 0,
          }}
        >
          <FlatList
            data={Menu}
            style={{
              paddingHorizontal: 10,
            }}
            renderItem={({ index, item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate(item.url)}
                style={{
                  aspectRatio: 1.05,
                  width: "49.5%",
                  marginRight: index % 2 !== 0 ? 0 : 5,
                  marginTop: 10,
                  marginBottom: 4,
                  padding: 1,
                  position: "relative",
                  backgroundColor: COLORS.lightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  borderColor: COLORS.default,
                  borderWidth: 2,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: "90%",
                  }}
                >
                  <Image
                    resizeMode="center"
                    style={{
                      width: "100%",
                      height: "90%",
                      marginTop: 5,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }}
                    source={item.source}
                  />
                </View>
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: item.disposable ? COLORS.white : COLORS.white,
                    backgroundColor: COLORS.default,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    bottom: 1,
                    fontSize: 15,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {item.item}
                </Text>
              </TouchableOpacity>
            )}
            numColumns={2}
          />
        </Row>
      </Grid>
    </SafeAreaView>
  );
};
export default RecipeHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
