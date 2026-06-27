import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import { FlatList, Image, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";
import ToastNebula from "../../components/ToastNebula";

const tables = [
  {
    id: 1,
    name: "Mesa 1",
    source: require("../../../assets/tables2.png"),
    disposable: true
  },
  {
    id: 2,
    name: "Mesa 2",
    source: require("../../../assets/tables2.png"),
    disposable: false
  },
  {
    id: 3,
    name: "Mesa 3",
    source: require("../../../assets/tables2.png"),
    disposable: true
  }
]

const TableScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Grid>
        <Row
          size={0.1}
          style={{
            alignItems: "center",
            backgroundColor: COLORS.default,
          }}
        >
          <Col
            style={{
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              JL FAST FOOD
            </Text>
          </Col>
        </Row>
        <Row size={0.05} style={{ backgroundColor: COLORS.grey }}>
          <Col>
            <ToastNebula title={"Mostrar Mensaje"} message={"Hola Mundo!!!"} />
          </Col>
        </Row>
        <Row
          size={0.85}
          style={{
            margin: 10,
          }}
        >
          <FlatList
            data={tables}
            renderItem={({ index, item }) => (
              <TouchableOpacity
                style={{
                  aspectRatio: 1,
                  width: "49.5%",
                  marginRight: index % 2 !== 0 ? 0 : 5,
                  padding: 10,
                  marginBottom: 5,
                  position: "relative",
                  backgroundColor: COLORS.lightGrey,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                }}
                key={item.id}
                onPress={() => console.log("id")}
              >
                <Image
                  resizeMode="center"
                  style={{ width: "100%", height: "100%" }}
                  source={item.source}
                />
                <Text
                  style={{
                    color: item.disposable ? COLORS.white : COLORS.orange,
                    bottom: 10,
                    fontSize: 18,
                    fontWeight: "bold",
                    textTransform: 'uppercase',
                    
                  }}
                >
                  {item.name}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default TableScreen;
