import { BlurView } from "expo-blur";
import React from "react";

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { COLORS, SIZES } from "../../constants/themes";
import firebase from '../../../database/firebase'

const AuthenticationScreen = ({navigation}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { auth, signInWithEmailAndPassword } = firebase

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Signed in!')
      const user = userCredential.user;
      console.log(user)
      navigation.navigate('Home');
    })
    .catch(error => {
      console.log(error.message)
    })
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center",
          },
        ]}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 30,
            marginBottom: 5,
            color: "#FFFFF0",
            textAlign: "center",
          }}
        >
          Iniciar Sesion
        </Text>
        <View
          style={
            {
              // flex: 1,
              // width: "100%",
              // height: "100%",
              // backgroundColor: COLORS.lightGrey,
              // borderRadius: 10,
            }
          }
        >
          <BlurView
            intensity={100}
            style={{
              borderRadius: 10,
              margin: 20,
              borderColor: COLORS.default,
              borderWidth: 0.5,
            }}
          >
            <View style={styles.login}>
              {/* <Image source={require('../../../assets/logoJl.png')} style={styles.profilePicture} /> */}
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "400",
                    color: COLORS.title,
                  }}
                >
                  Correo Electronico
                </Text>
                <TextInput
                  onChangeText={(text) => setEmail(text)}
                  style={styles.input}
                  placeholder="betomoedano@outlook.com"
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "400",
                    color: COLORS.title,
                  }}
                >
                  Contreseña
                </Text>
                <TextInput
                  onChangeText={(text) => setPassword(text)}
                  style={styles.input}
                  placeholder="password"
                  secureTextEntry={true}
                />
              </View>
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.button, { backgroundColor: COLORS.default }]}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "400",
                    color: COLORS.title,
                  }}
                >
                  Iniciar
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={()=>console.log()} style={[styles.button, {backgroundColor: '#6792F090'}]}>
                <Text style={{fontSize: 17, fontWeight: '400', color: 'blue'}}>Create Account</Text>
            </TouchableOpacity> */}
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
};

export default AuthenticationScreen;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
    height: "100%",
    width: SIZES.width,
    position: "relative",
  },
  image: {
    width: "80%",
    height: "50%",
    resizeMode: "cover",
  },
  login: {
    // width: 350,
    height: 270,
    borderColor: COLORS.default,
    borderWidth: 0.5,
    borderRadius: 10,
    margin: "1%",
    paddingTop: 20,
    alignItems: "center",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: "#fff",
    // borderWidth: 1,
    marginVertical: 30,
  },
  input: {
    width: 250,
    height: 40,
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#ffffff90",
    marginBottom: 20,
  },
  button: {
    width: 250,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderColor: "#fff",
    borderWidth: 1,
  },
});
