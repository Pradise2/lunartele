import tapps from '../../assets/tapps.png';
import React, { useState, useEffect, useRef } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const Main = () => {
  const [userId, setUserId] = useState(null);
  const [tapLeft, setTapLeft] = useState(10);
  const [tapTime, setTapTime] = useState(4 * 60 * 60); // Initial 4 hours
  const [taps, setTaps] = useState(0);
  const [farmTime, setFarmTime] = useState(6 * 60 * 60); // Initial 6 hours
  const [farm, setFarm] = useState(0);
  const [farmClaimed, setFarmClaimed] = useState(0);
  const [isClaimClicked, setIsClaimClicked] = useState(false);
  const [totalBal, setTotalBal] = useState(0);
  const [firstname, setFirstName] = useState(null);
  const [userExists, setUserExists] = useState(false); // Track if the user exists

  const [lastTapTime, setLastTapTime] = useState(null); // Store last tap time
  const [farmStartTime, setFarmStartTime] = useState(null); // Store farm start time

  // Use a useRef to store the interval IDs
  const tapTimeIntervalRef = useRef(null);
  const farmTimeIntervalRef = useRef(null);

  window.Telegram.WebApp.expand();

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id);
        setFirstName(user.first_name);
        // Load data from Firestore
        loadUserData(user.id);
      } else {
        console.error('User data is not available.');
      }
    } else {
      console.error('Telegram WebApp script is not loaded.');
    }
  }, []);

  const loadUserData = async (userId) => {
    try {
      const docRef = doc(db, 'details', String(userId));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTapLeft(data.tapLeft);
        setTaps(data.taps);
        setFarm(data.farm);
        setFarmClaimed(data.farmClaimed);
        setTotalBal(data.totalBal);
        setUserExists(true); 
        setLastTapTime(data.lastTapTime); 
        setFarmStartTime(data.farmStartTime); 

        // Calculate remaining time
        if (data.lastTapTime) {
          const now = Date.now();
          setTapTime(Math.max(0, 4 * 60 * 60 - (now - data.lastTapTime) / 1000));
        }
        if (data.farmStartTime) {
          const now = Date.now();
          setFarmTime(Math.max(0, 6 * 60 * 60 - (now - data.farmStartTime) / 1000));
        }

        console.log("Document data:", data);
      } else {
        console.log("No such document!");
        setUserExists(false); 
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const handleSendData = async () => {
    if (!userId || !firstname) {
      console.error('User data is incomplete.');
      return;
    }
    try {
      const docRef = doc(db, 'details', String(userId));
      if (userExists) {
        // Update the document if the user already exists
        await updateDoc(docRef, {
          totalBal: totalBal,
          tapLeft: tapLeft,
          taps: taps,
          farm: farm,
          farmClaimed: farmClaimed,
          lastTapTime: lastTapTime, 
          farmStartTime: farmStartTime 
        });
        console.log("Document successfully written!");
      } else {
        // Create a new document if the user is new
        await setDoc(docRef, {
          userId: userId,
          firstName: firstname,
          totalBal: totalBal,
          tapLeft: tapLeft,
          taps: taps,
          farm: farm,
          farmClaimed: farmClaimed,
          lastTapTime: lastTapTime, 
          farmStartTime: farmStartTime 
        });
        console.log("New document successfully created!");
      }
    } catch (error) {
      console.error("Error updating/creating document: ", error);
    }
  };

  useEffect(() => {
    if (userId && firstname) {
      handleSendData();
    }
  }, [userId, firstname, totalBal, tapLeft, taps, farm, farmClaimed, lastTapTime, farmStartTime]);

  useEffect(() => {
    const intervalIdC2 = setInterval(() => {
      setTapTime((prevtapTime) => {
        if (prevtapTime <= 0) {
          setTapLeft(10);
          return 4 * 60 * 60;
        }
        return prevtapTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalIdC2);
  }, []);

  useEffect(() => {
    setTotalBal(taps + farmClaimed);
  }, [taps, farmClaimed]);

  // Save tapTime and farmTime to local storage
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`timerData-${userId}`, JSON.stringify({
        tapTime: tapTime,
        farmTime: farmTime,
      }));
    }
  }, [userId, tapTime, farmTime]);

  // Load tapTime and farmTime from local storage on component mount
  useEffect(() => {
    if (userId) {
      const storedTimerData = localStorage.getItem(`timerData-${userId}`);
      if (storedTimerData) {
        const data = JSON.parse(storedTimerData);
        setTapTime(data.tapTime);
        setFarmTime(data.farmTime);
      }
    }
  }, [userId]);

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
      setLastTapTime(Date.now()); 
    }
  };

  const handleStartClick = async () => {
    if (!isClaimClicked) {
      setIsClaimClicked(true); // Start the tapTime

      // Save the start time to Firestore
      try {
        const docRef = doc(db, 'details', String(userId));
        await updateDoc(docRef, {
          farmStartTime: Date.now()
        });
      } catch (error) {
        console.error("Error updating start time:", error);
      }
    } else {
      setFarmClaimed(farmClaimed + farm);
      setFarm(0);
      setFarmTime(6 * 60 * 60); // Reset farmTime to 6 hours
      setIsClaimClicked(false); // Reset the tapTime
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600); // 3600 seconds in an hour
    const minutes = Math.floor((time % 3600) / 60); // 60 seconds in a minute
    const seconds = Math.floor(time % 60);
    // Format the time string
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
  };

  // ... Your existing useEffect hooks for saving data ...

  // Handle Logout
  const handleLogout = async () => {
    // ... (Your logout logic) ...
    localStorage.removeItem(`timerData-${userId}`);

    // Update Firestore with the current game state
    try {
      const docRef = doc(db, 'details', String(userId));
      await updateDoc(docRef, {
        totalBal: totalBal,
        tapLeft: tapLeft,
        taps: taps,
        farm: farm,
        farmClaimed: farmClaimed,
        lastTapTime: lastTapTime, 
        farmStartTime: farmStartTime 
      });
      console.log("Firestore document updated on logout");
    } catch (error) {
      console.error("Error updating Firestore document:", error);
    }
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
        </div>
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
