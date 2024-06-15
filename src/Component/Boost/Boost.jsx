import Footer from '../Others/Footer'
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
    authDomain: "test-f326f.firebaseapp.com",
    projectId: "test-f326f",
    storageBucket: "test-f326f.appspot.com",
    messagingSenderId: "626801402709",
    appId: "1:626801402709:web:d3653b964333a0de6845dc",
    measurementId: "G-517PH4LM9K",
    databaseURL: "https://test-f326f-default-rtdb.firebaseio.com/" // You might need this if you still need to use the Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Boost = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Wait for the Telegram WebApp to be ready
    window.Telegram.WebApp.ready(() => {
      if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        setUserData(user);
        console.log('User data:', user);

        // Store user data in Firestore
        const userDataRef = doc(db, 'user', user.id.toString());
        setDoc(userDataRef, {
            userId: user.id,
            userName: user.username || user.first_name,
            isBot: user.is_bot,
            // ... Add other data points as needed
        });
      }
    });
  }, []);

  return (
    <>
   <h1>Telegram User Data</h1>
      {userData ? (
        <div>
          <p>ID: {userData.id}</p>
          <p>First Name: {userData.first_name}</p>
          <p>Last Name: {userData.last_name}</p>
          <p>Username: {userData.username}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
<Footer/>
</>
  );
};

export default Boost;