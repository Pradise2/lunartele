import Footer from '../Others/Footer';
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Assuming you have your Firebase config setup

const Boost = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [firstname, setFirstName] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setUserId(user?.id);
        setUsername(user.username);
        setFirstName(user.first_name);

        // Set the document in Firestore
        const docRef = doc(db, 'users', user.id.toString()); // Assuming 'users' is your collection name
        setDoc(docRef, {
          userId: user.id,
          username: user.username,
          firstName: user.first_name,
          // ... add other relevant data
        })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
      } else {
        console.error('User data is not available.');
      }
    } else {
      console.error('Telegram WebApp script is not loaded.');
    }
  }, []);

  return (
    <>
      <h1>Telegram User Data</h1>
      {userId !== null ? (
        <div>
          <p>ID: {userId ? `${userId} ` : ''}</p>
          <p>First Name: {firstname ? firstname : 'game..'}</p>
          <p>Username: {username ? username : 'Loading...'}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <Footer />
    </>
  );
};

export default Boost;