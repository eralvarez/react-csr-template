// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAueGOUv-sRcfFjZppro_D4dBgm9DzqiT0",
  authDomain: "react-csr-temp.firebaseapp.com",
  projectId: "react-csr-temp",
  storageBucket: "react-csr-temp.firebasestorage.app",
  messagingSenderId: "877824295420",
  appId: "1:877824295420:web:672184308a32cda6b03279",
  measurementId: "G-C67PWKJFTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };