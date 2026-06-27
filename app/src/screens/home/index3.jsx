import { Button } from "@rneui/themed";
import React from "react";
import { Pressable } from "react-native";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import BottomFooter from "../../components/BottomFooter";
import CardMenu from "../../components/CardMenu";
import { COLORS } from "../../constants/themes";
import useGlobal from "../../hooks/useGlobal";

const INITIAL = {
  name: "",
  isActive: false,
};

const HomeScreens = ({ navigation }) => {
  const {product,ordering, isNewOrder, newOrder} = useGlobal()
  console.log(product)
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Grid style={{ flex: 1, paddingTop: 10, alignItems: "center" }}>
        <Row style={{ height: 150 }}>
          <Image
            resizeMode="center"
            style={{ width: "80%", height: "100%" }}
            source={require("../../../assets/logo-nebula2.png")}
          />
        </Row>
        <Row
          style={{
            backgroundColor: COLORS.default,
            height: 50,
            padding: 10,
            width: "95%",
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Menú
          </Text>
        </Row>
        <Row>
          <FlatList
            style={{
              paddingTop: 1,
              borderWidth: 1,
            }}
            data={product}
            ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
            renderItem={({ item }) => (
              <CardMenu key={item.id} item={item}/>
              // <Pressable
              //   style={{
              //     flex: 1,
              //     backgroundColor: COLORS.default,
              //     padding:10,
              //     borderRadius: 10,
              //     marginHorizontal: 10,
              //     marginBottom: 5,
              //   }}
              // >
              //   <Grid style={{
              //       height: 100,
              //       flex: 1,
              //     }}>
              //     <Row style={{
              //       height: 50,
              //       flex: 1,
              //       padding: 5,
              //       justifyContent: "center",
              //       alignItems: "center",
              //     }}>
              //       <Text>{item.description}</Text>
              //     </Row>
              //     <Row style={{
              //       height: 50,
              //       flex: 1,
              //       padding: 5,
              //       justifyContent: "center",
              //       alignItems: "center",
              //     }}>
              //       <Text>Precio Bs.: {item.cost_bs}</Text>
              //     </Row>
              //     <Row style={{
              //       height: 50,
              //       flex: 1,
              //       padding: 5,
              //       justifyContent: "center",
              //       alignItems: "center",
              //     }}>
              //       <Text>Precio USD.: { item.cost_usd}</Text>
              //     </Row>
              //     <Row style={{
              //       height: 50,
              //       flex: 1,
              //       padding: 5,
              //       justifyContent: "center",
              //       alignItems: "center",
              //     }}>
              //       <Text>Disponible: {item.disposable}</Text>
              //     </Row>
              //   </Grid>
              // </Pressable>
            )}
            numColumns={2}
          />
        </Row>
        <Row
          style={{
            position: "relative",
            height: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isNewOrder.isActive ? (
            <Button
              title={`Culminar pedido ${isNewOrder.name}`}
              titleStyle={{
                textTransform: "uppercase",
              }}
              buttonStyle={{ backgroundColor: COLORS.default }}
              containerStyle={{
                flex: 1,
                backgroundColor: COLORS.default,
                marginHorizontal: 10,
                borderRadius: 20,
              }}
              onPress={() => newOrder(INITIAL)}
            />
          ) : (
            <>
              <BottomFooter action="OrderScreen" text="Nuevo pedido" />
              {ordering.length > 0 ? (
                <>
                  <Col style={{ width: 2, backgroundColor: COLORS.default }} />
                  <BottomFooter action="ListOrdersScreen" text="pedidos" />
                </>
              ) : null}
            </>
          )}
        </Row>
      </Grid>
    </View>
  );
};

export default HomeScreen;
