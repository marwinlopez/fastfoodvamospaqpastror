import { SafeAreaView, Text } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { COLORS } from "../../constants/themes";

const MaterialsScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        top: 0,
      }}
    >
      <Grid>
        <Row style={{ height: 50 }}>
          <Col
            style={{
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 70,
              backgroundColor: COLORS.default,
            }}
          >
            {/* <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Seleccionar Ingredientes
            </Text> */}
          </Col>
        </Row>
      </Grid>
    </SafeAreaView>
  );
};

export default MaterialsScreen  