import { Icon } from "@rneui/themed";
import { FlatList, Pressable, Text, View } from "react-native"
import { Col, Grid, Row } from "react-native-easy-grid";
import useGlobal from "../../hooks/useGlobal";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import useTabNavigation from "../../hooks/useTabNavigation";

const OrderScreen = ({navigation, route}) => {
    const { recipe, dispatch } = useGlobal();
    const { selectTab } = useTabNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      selectTab(0);
      // The screen is focused
      // Call any action
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, []);
    return (
      <View style={{ flex: 1 }}>
        
        <FlatList
          data={recipe}
          ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("RecipesScreen", { recipe: item })
              }
            >
              <Grid>
                <Row
                  key={item.id}
                  style={{ height: 70, backgroundColor: "#000100" }}
                >
                  <Col
                    style={{
                      justifyContent: "center",
                      paddingLeft: 10,
                    }}
                  >
                    <Row
                      style={{
                        alignItems: "flex-end",
                      }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                    </Row>
                    <Row
                      style={{
                        alignItems: "flex-start",
                      }}
                    >
                      <Col size={0.4}>
                        <Text>Precio Costo: </Text>
                      </Col>
                      <Col>
                        <Text>
                          {item.coin} {item.cost}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col
                    size={0.1}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Pressable
                      style={{
                        flex: 1,
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        // backgroundColor: COLORS.orange,
                      }}
                      onPress={() => console.log("Menu ", item.name)}
                    >
                      <Icon type="feather" name="more-vertical" color="white" />
                    </Pressable>
                  </Col>
                </Row>
              </Grid>
            </Pressable>
          )}
        />
      </View>
    );
}

export default OrderScreen