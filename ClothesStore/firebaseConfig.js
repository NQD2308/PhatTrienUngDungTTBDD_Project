import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBPYXba_m9O3EPdIqUcAWqPDvHcx8I3JS4",
  authDomain: "clothesstore-430ab.firebaseapp.com",
  databaseURL: "https://clothesstore-430ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clothesstore-430ab",
  storageBucket: "clothesstore-430ab.firebasestorage.app",
  messagingSenderId: "609034811882",
  appId: "1:609034811882:web:c5894731db8d47a0359a93"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore (FIREBASE_APP);