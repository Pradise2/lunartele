import Footer from '../Others/Footer'
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Boost = () => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
      if (window.Telegram && window.Telegram.WebApp) {
          let tg = window.Telegram.WebApp;
          setUser(tg.initDataUnsafe.user);
      } else {
          console.error("Telegram WebApp is not available.");
      }
  }, []);

  if (!user) {
      return <div>Loading...</div>;
  }

  useEffect(() => {
    // Wait for the Telegram WebApp to be ready
    window.Telegram.WebApp.ready(() => {
      if (window.Telegram && window.Telegram.WebApp) {
        const user = window.Telegram.WebApp.initDataUnsafe?.user?.id;
        setUserData(user);
        console.log('User data:', user);

        // Store user data in Firestore
        const userDataRef = doc(db, 'users', user.id.toString());
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
        <>
        <p>Loading user data...</p>
        <p>{`${user.first_name} ${user.last_name}`}</p>
        <p>{`${user.username} (${user.language_code})`}</p>
        <p>{user.id}</p>
        </>
      )}
<Footer/>
</>
  );
};

export default Boost;