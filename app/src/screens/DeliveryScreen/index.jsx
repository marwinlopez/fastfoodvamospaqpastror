import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/themes";
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text } from "react-native";
import { Icon } from "@rneui/themed";

        
const DeliveryScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <Grid>
          <Row
            style={{
              height: 160,
              alignItems: "center",
              backgroundColor: COLORS.default,
            }}
          >
            <Col style={{ 
              flex:1,
              height: '100%'

            }}>
              <ImageBackground
                resizeMode="center"
                style ={{width: "100%", height: "100%", paddingBottom:15, justifyContent:"center"}}
                imageStyle={{ width: "100%", height: "100%", justifyContent:"center" }}
                
                source={require("../../../assets/transparente.png")}
              >
                
              </ImageBackground>
            </Col>
          </Row>
        </Grid>
      </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
      
    },
  });
  

export default DeliveryScreen;