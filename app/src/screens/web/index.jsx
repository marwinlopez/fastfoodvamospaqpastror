import { Image } from "@rneui/base"
import { Text, View } from "react-native"
import { Grid, Row } from "react-native-easy-grid"

const Web = ()=>{

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
          </Grid>
        </View>
    )
}

export default Web