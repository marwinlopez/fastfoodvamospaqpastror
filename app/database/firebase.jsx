// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfcBmicxdDfUgPzxFRQY8N-gtxPz8bq0o",
  authDomain: "jlfastfood.firebaseapp.com",
  projectId: "jlfastfood",
  storageBucket: "jlfastfood.appspot.com",
  messagingSenderId: "163516199224",
  appId: "1:163516199224:web:eed895e0ca326c3fa511cd",
};

// Initialize Firebase
let app;
let auth;
if (getApps().length < 1) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth();
}
const db = getFirestore(app);

export default {
  auth,
  app,
  db,
  collection,
  getDocs,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
};
