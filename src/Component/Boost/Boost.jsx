import Footer from '../Others/Footer';
import React, { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Assuming you have your Firebase config setup

const Boost = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [firstname, setFirstName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
          setUserId(user.id);
          setUsername(user.username);
          setFirstName(user.first_name);

          // Automatically send data to Firebase
          await handleSendData(user.id, user.username, user.first_name);
        } else {
          console.error('User data is not available.');
        }
      } else {
        console.error('Telegram WebApp script is not loaded.');
      }
    };

    fetchUserData();
  }, []);

  const handleSendData = async (userId, username, firstname) => {
    if (!userId || !firstname) {
      console.error('User data is incomplete.');
      return;
    }

    setIsLoading(true);

    try {
      // Set the document in Firestore
      const docRef = doc(db, 'telegram', String(userId)); // Assuming 'telegram' is your collection name
      await setDoc(docRef, {
        userId: userId,
        username: username,
        firstName: firstname,
        // ... add other relevant data
      });
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Telegram User Data</h1>
      {userId !== null ? (
        <div>
          <p>ID: {userId}</p>
          <p>First Name: {firstname ? firstname : 'Loading...'}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <Footer />
    </>
  );
};

export default Boost;
