import tapps from '../../assets/tapps.png';
import React, { useState, useEffect } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase'; 
import { doc, setDoc, getDoc } from "firebase/firestore";

const Main = () => {
  const [userId, setUserId] = useState(null);
  const [tapLeft, setTapLeft] = useState(10);
  const [tapTime, setTapTime] = useState(30);
  const [taps, setTaps] = useState(0);
  const [farmTime, setFarmTime] = useState(60);
  const [farm, setFarm] = useState(0);
  const [farmClaimed, setFarmClaimed] = useState(0);
  const [isClaimClicked, setIsClaimClicked] = useState(false);
  const [totalBal, setTotalBal] = useState(0);
  const [firstname, setFirstName] = useState(null);
  

  window.Telegram.WebApp.expand();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id);
        setFirstName(user.first_name);
      } else {
        console.error('User data is not available.');
      }
    } else {
      console.error('Telegram WebApp script is not loaded.');
    }
  }, []);

  useEffect(() => {
    const handleSendData = async () => {
      if (!userId || !firstname) {
        console.error('User data is incomplete.');
        return;
      }
      try {
        // Set the document in Firestore
        const docRef = doc(db, 'details', String(userId)); // Assuming 'telegram' is your collection name
        await setDoc(docRef, {
          userId: userId,
          firstName: firstname,
          // ... add other relevant data
        });
        console.log("Document successfully written!");
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    };
    if (userId && firstname) {
      handleSendData();
    }
  }, [userId, firstname]);

  useEffect(() => {
    const intervalIdC2 = setInterval(() => {
      setTapTime((prevtapTime) => {
        if (prevtapTime <= 0) {
          setTapLeft(10);
          return 30;
        }
        return prevtapTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalIdC2);
  }, []);

  useEffect(() => {
    setTotalBal(taps + farmClaimed);
  }, [taps, farmClaimed]);

  useEffect(() => {
    let intervalIdfarmTime;
    if (isClaimClicked) {
      intervalIdfarmTime = setInterval(() => {
        setFarmTime((prevfarmTime) => {
          if (prevfarmTime <= 0) {
            clearInterval(intervalIdfarmTime);
            return 0; // Stop at 0
          } else {
            setFarm((prevfarm) => prevfarm + 0.01);
            return prevfarmTime - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(intervalIdfarmTime);
  }, [isClaimClicked]);

  const handleClickC3 = () => {
    if (tapLeft > 0) {
      setTapLeft(tapLeft - 1);
      setTaps(taps + 1);
    }
  };

  const handleStartClick = () => {
    if (!isClaimClicked) {
      setIsClaimClicked(true); // Start the tapTime
    } else {
      setFarmClaimed(farmClaimed + farm);
      setFarm(0);
      setFarmTime(60);
      setIsClaimClicked(false); // Reset the tapTime
    }
  };

  const formatTime = (time) => {
    if (time <= 0) return "00:00";
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };
  
  return (
    <div className="max-h-screen bg-zinc-900 text-white flex flex-col items-center p-0 space-y-4 overflow-hidden">
      <div className="p-2 rounded-lg text-center w-full max-w-md">
        <p className="p-2 text-zinc-400 font-bold">Lunar Token</p>
        <p className="text-4xl font-bold">
          {(totalBal).toFixed(2)} <span className="text-purple-400">lunar</span>
        </p>
      </div>
      <div className="text-center space-y-2">
        <p className="text-zinc-400">
          Wont stop! tapTime shows refill, {userId ? `${userId} ` : ''} but the fun won’t flop! <span className="text-yellow-400">👍</span>
        </p>
        <div className="p-2 flex justify-center space-x-4">
          <div className="bg-purple-800 p-2 rounded-lg flex">
            <p>{tapLeft} tapLeft left</p>
          </div>
          <div className="bg-yellow-800 p-2 rounded-lg flex items-center space-x-2">
            <span className="material-icons">access_time</span>
            <p>{formatTime(tapTime)}</p>
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
            <p className="text-center font-bold">{formatTime(farmTime)}</p>
          </div>
          <p className="text-center text-4xl font-bold mt-2">
            {farm.toFixed(2)} <span className="text-purple-400">lunar</span>
          </p>
        </div>/
      </div>
      <button
        className="mt-6 bg-zinc-700 text-white py-2 px-6 rounded-lg"
        onClick={handleStartClick}
        disabled={isClaimClicked && farmTime > 0}
      >
        {isClaimClicked ? "Claim" : "Start"}
      </button>
      <Footer/>
    </div>
  );
};

export default Main;
