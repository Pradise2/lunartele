import Footer from '../Others/Footer'
import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Boost = () => {
  
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null); 
  const [firstname, setFirstName] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        const userIdFromTelegram = user?.id;
        console.log('User ID:', userIdFromTelegram);
        setUserId(userIdFromTelegram);

        // Set username to state
        const usernameFromTelegram = user.username;
        console.log('Username:', usernameFromTelegram);
        setUsername(usernameFromTelegram);

         // Set firstname to state
         const firstnameFromTelegram = user.first_name;
         console.log('Username:', firstnameFromTelegram);
         setUsername(usernameFromTelegram);

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
<Footer/>
</>
  );
};

export default Boost;