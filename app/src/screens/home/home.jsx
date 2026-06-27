import { ButtonGroup, Header as HeaderRNE , Icon } from "@rneui/themed";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BottomFooter from "../../components/BottomFooter";
import CardMenu from "../../components/CardMenu";
import { COLORS } from "../../constants/themes";
import useGlobal from "../../hooks/useGlobal";
import useTabButtonFooter from "../../hooks/useTabButtonFooter";

const list = [
  {
    id: 1,
    description: "Perros",
    disponible: true,
  },
  {
    id: 2,
    description: "Hamburguesas",
    disponible: true,
  },
  {
    id: 3,
    description: "Pepitos",
    disponible: true,
  },
  {
    id: 4,
    description: "Club House",
    disponible: true,
  },
  {
    id: 5,
    description: "Shawarman",
    disponible: true,
  },
  {
    id: 6,
    description: "SalchiPapas",
    disponible: true,
  },
  {
    id: 7,
    description: "Bebidas",
    disponible: true,
  },
];

const HomeScreen = ({ navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {recipe} = useGlobal()
  const {selectTab, tabActive} = useTabButtonFooter()
  useEffect(()=>{
    console.log(recipe)
    switch (selectedIndex) {
      case 1:
        break;
    
      default:
        
        break;
    }
  },[selectedIndex])

  const docsNavigate = () => {
    alert('hola')
  } 
  const playgroundNavigate = () => {
    alert('hola 2')
  }
  return (
    <SafeAreaProvider
      style={{ marginBottom: 25, top: 35, justifyContent: "center" }}
    >
      <Grid>
        <Row size={40} style = {{

        }}>
          <FlatList
            style={{
              borderWidth: 1,
              backgroundColor: COLORS.orange,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 0,
              paddingHorizontal: 1,
            }}
            data={recipe}
            ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            renderItem={({ item }) => (
              <View>
                <Text>{item.description}</Text>
              </View>
            )}
          />
        </Row>
        <Row size={40}>
          <FlatList
            style={{
              backgroundColor: COLORS.orange,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 0,
              paddingHorizontal: 1,
            }}
            data={product}
            ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
            renderItem={({ item }) => (
              <CardMenu key={item.id} item={item} />
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
        {/* <ButtonGroup
          buttons={["Pedidos", "Ordenes", "Mesa"]}
          buttonContainerStyle={{
            opacity: 20,
          }}
          selectedButtonStyle={{
            borderRadius: 5,
            backgroundColor: COLORS.default,
          }}
          selectedIndex={selectedIndex}
          onPress={(value) => {
            setSelectedIndex(value);
          }}
          containerStyle={{
            marginBottom: 30,
            backgroundColor: COLORS.default,
            padding: 1,
            borderBottomColor: "transparent",
            borderWidth: 0,
          }}
        /> */}
      </Grid>
    </SafeAreaProvider>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.default,
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  });