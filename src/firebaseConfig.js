import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
  authDomain: "test-f326f.firebaseapp.com",
  projectId: "test-f326f",
  storageBucket: "test-f326f.appspot.com",
  messagingSenderId: "626801402709",
  appId: "1:626801402709:web:d3653b964333a0de6845dc",
  measurementId: "G-517PH4LM9K"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Export Firebase app, database, and Firestore functions
export { app, db, collection, addDoc, serverTimestamp };