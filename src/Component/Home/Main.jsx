import tapps from '../../assets/tapps.png';
import React, { useState, useEffect } from "react";
import Footer from '../Others/Footer';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
  authDomain: "test-f326f.firebaseapp.com",
  projectId: "test-f326f",
  storageBucket: "test-f326f.appspot.com",
  messagingSenderId: "626801402709",
  appId: "1:626801402709:web:d3653b964333a0de6845dc",
  measurementId: "G-517PH4LM9K",
};
Telegram.WebApp.ready();

const userId = Telegram.WebApp.initDataUnsafe.user.id;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Main = () => {
  const [count, setCount] = useState(10);
  const [timer, setTimer] = useState(30);
  const [c4Count, setC4Count] = useState(0);
  const [d1, setD1] = useState(60);
  const [d2, setD2] = useState(0);
  const [d2Claimed, setD2Claimed] = useState(0);
  const [isClaimClicked, setIsClaimClicked] = useState(false);

  useEffect(() => {
    const intervalIdC2 = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          setCount(10);
          return 30;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(intervalIdC2);
  }, []);

  useEffect(() => {
    let intervalIdD1;
    if (isClaimClicked) {
      intervalIdD1 = setInterval(() => {
        setD1((prevD1) => {
          if (prevD1 <= 0) {
            clearInterval(intervalIdD1);
            return 0; // Stop at 0
          } else {
            setD2((prevD2) => prevD2 + 0.01);
            return prevD1 - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(intervalIdD1);
  }, [isClaimClicked]);

  const handleClickC3 = () => {
    if (count > 0) {
      setCount(count - 1);
      setC4Count(c4Count + 1);
    }
  };

  const handleStartClick = () => {
    if (!isClaimClicked) {
      setIsClaimClicked(true); // Start the timer
    } else {
      setD2Claimed(d2Claimed + d2);
      setD2(0);
      setD1(60);
      setIsClaimClicked(false); // Reset the timer
    }
  };

  // Function to store data in Cloud Firestore
  const storeData = async () => {
    try {
      // Create a reference to the 'users' collection
      const usersCollection = collection(db, 'usr');
      // Create a document reference for the current user (you'll need a user ID)
      const userDocRef = doc(usersCollection, `${userId}`); // Replace 'your-user-id' with the actual user ID

      await setDoc(userDocRef, {
        // Store your data
        c4Count: c4Count,
        d2Claimed: d2Claimed,
        // ... other relevant data
      });

      console.log('Data stored successfully!');
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  // Call storeData whenever relevant data changes
  useEffect(() => {
    storeData();
  }, [c4Count, d2Claimed]); // Add more state variables to this array if needed

  const formatTime = (time) => {
    if (time <= 0) return "00:00";
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="bg-zinc-900 text-white flex flex-col items-center p-0 space-y-4 overflow-hidden">
      <div className="p-0 rounded-lg text-center w-full max-w-md">
        <p className="text-zinc-400 font-bold">Lunar Token</p>
        <p className="text-4xl font-bold">
          {(c4Count + d2Claimed).toFixed(2)} <span className="text-purple-400">lunar</span>
        </p>
      </div>
      <div className="text-center space-y-2">
        <p className="text-zinc-400">
          Won’t stop! Timer shows refill, but the fun won’t flop! <span className="text-yellow-400">👍</span>
        </p>
        <div className="flex justify-center space-x-4">
          <div className="bg-purple-800 p-2 rounded-lg flex">
            <p>{count} taps left</p>
          </div>
          <div className="bg-yellow-800 p-2 rounded-lg flex items-center space-x-2">
            <span className="material-icons">access_time</span>
            <p>{formatTime(timer)}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <img
          id="C3"
          src={tapps}
          alt="lunar Token"
          className="rounded-full w-24 h-24"
          onClick={handleClickC3}
        />
      </div>
      <div className="mt-6 rounded-lg p-4 relative">
        <p className="text-center text-zinc-400 font-bold">Farming Reward</p>
        <div className="flex justify-center mt-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-center py-2 px-4 rounded-lg mr-4 flex justify-center mt-3">
            <span className="material-icons">access_time</span>
            <p className="text-center font-bold">{formatTime(d1)}</p>
          </div>
          <p className="text-center text-4xl font-bold mt-2">
            {d2.toFixed(2)} <span className="text-purple-400">lunar</span>
          </p>
        </div>
      </div>
      <button
        className="mt-6 bg-zinc-700 text-white py-2 px-6 rounded-lg"
        onClick={handleStartClick}
        disabled={isClaimClicked && d1 > 0}
      >
        {isClaimClicked ? "Claim" : "Start"}
      </button>
      <Footer/>
    </div>
  );
};

export default Main;