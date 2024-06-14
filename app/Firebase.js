// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC89DJJd1p-r262UkoPcMSqasLZkhX6pTY",
  authDomain: "tourist-helper-c1687.firebaseapp.com",
  projectId: "tourist-helper-c1687",
  storageBucket: "tourist-helper-c1687.appspot.com",
  messagingSenderId: "184616554949",
  appId: "1:184616554949:web:b0144a83e998e05a23bbac",
  measurementId: "G-6D2S17KBXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { auth, db };