// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDqpYU_5PCx2GqCi2EjjlW54RlV4g5daLQ',
  authDomain: 'react-csr-temp.firebaseapp.com',
  projectId: 'react-csr-temp',
  storageBucket: 'react-csr-temp.firebasestorage.app',
  messagingSenderId: '877824295420',
  appId: '1:877824295420:web:ba95d9d62819fdaeb03279',
  measurementId: 'G-5RMX3NXSC4',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export { app, analytics };
