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
        setUserId(user?.id);
        // Set username to state
        setUsername(user.username);
         // Set firstname to state
         setFirstName(user.first_name);

 // Now, we can use the user data to set docs
        const docData = {
          userId: userId,
          username: username,
          firstName: firstname,
          // ... add other relevant data
        };

        // Assuming you have a function to set your document
        setDoc(docData); 

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