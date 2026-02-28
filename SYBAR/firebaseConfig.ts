// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa5Nz0z1GxwdULH2evUWg6yPSoWCCjVxY",
  authDomain: "sybar-4cc79.firebaseapp.com",
  projectId: "sybar-4cc79",
  storageBucket: "sybar-4cc79.firebasestorage.app",
  messagingSenderId: "771152439044",
  appId: "1:771152439044:web:59fc34e0b656d3287dd251",
  measurementId: "G-48H28Y1R2P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);