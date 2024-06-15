
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
  authDomain: "test-f326f.firebaseapp.com",
  projectId: "test-f326f",
  storageBucket: "test-f326f.appspot.com",
  messagingSenderId: "626801402709",
  appId: "1:626801402709:web:d3653b964333a0de6845dc",
  measurementId: "G-517PH4LM9K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);