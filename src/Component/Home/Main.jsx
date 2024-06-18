import tapps from '../../assets/tapps.png';
import React, { useState, useEffect, useRef } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase'; 
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const Main = () => {
  const [userId, setUserId] = useState(null);
  const [tapLeft, setTapLeft] = useState(1000);
  const [tapTime, setTapTime] = useState(4 * 60 * 60); // 4 hours in seconds
  const [taps, setTaps] = useState(0);
  const [farmTime, setFarmTime] = useState(60); // 1 minute in seconds
  const [farm, setFarm] = useState(0);
  const [farmClaimed, setFarmClaimed] = useState(0);
  const [totalBal, setTotalBal] = useState(0);
  const [firstname, setFirstName] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const farmIntervalRef = useRef(null);
  const [isFarmActive, setIsFarmActive] = useState(false);

  window.Telegram.WebApp.expand();

  // Load user data on mount
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setUserId(user.id);
        setFirstName(user.first_name);
        loadUserData(user.id);
      } else {
        console.error('User data is not available.');
      }
    } else {
      console.error('Telegram WebApp script is not loaded.');
    }
  }, []);

  // Function to load user data from Firestore or local storage
  const loadUserData = async (userId) => {
    try {
      const localStorageData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      const docRef = doc(db, 'data', String(userId));
      const docSnap = await getDoc(docRef);
  
      if (localStorageData && docSnap.exists()) {
        const dbData = docSnap.data();
        const mergedData = mergeData(dbData, localStorageData);
        await setDoc(docRef, mergedData);
  
        updateStateWithElapsedTime(mergedData);
        setUserExists(true);
      } else if (localStorageData) {
        await setDoc(docRef, localStorageData);
        updateStateWithElapsedTime(localStorageData);
        setUserExists(true);
      } else if (docSnap.exists()) {
        const dbData = docSnap.data();
        updateStateWithElapsedTime(dbData);
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  // Update state with elapsed time for farming
  const updateStateWithElapsedTime = (data) => {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - data.farmStartTime) / 1000);
  
    if (data.isFarmActive && elapsedTime >= data.farmTime) {
      const newFarm = data.farm + (data.farmTime * 0.01);
      setFarmClaimed((prevFarmClaimed) => prevFarmClaimed + newFarm);
      setTotalBal((prevTotalBal) => prevTotalBal + newFarm);
      setFarm(0);
      setFarmTime(60);
      setIsFarmActive(false);
    } else if (data.isFarmActive) {
      setFarm(data.farm + (elapsedTime * 0.01));
      setFarmTime(data.farmTime - elapsedTime);
      startFarmInterval();
    } else {
      setFarm(data.farm);
      setFarmTime(data.farmTime);
    }
  };  

  // Set state variables from user data
  const setStateFromData = (data) => {
    setTapLeft(data.tapLeft);
    setTapTime(data.tapTime);
    setTaps(data.taps);
    setFarmTime(data.farmTime);
    setFarm(data.farm);
    setFarmClaimed(data.farmClaimed);
    setTotalBal(data.totalBal);
    if (data.farmStartTime && data.farmTime > 0) {
      startFarmInterval();
    }
  };

  // Function to send user data to Firestore
  const handleSendData = async () => {
    if (!userId || !firstname) {
      console.error('User data is incomplete.');
      return;
    }
    try {
      const docRef = doc(db, 'data', String(userId));
      const currentTime = new Date().getTime();
      const data = {
        userId: userId,
        firstName: firstname,
        totalBal: totalBal,
        tapLeft: tapLeft,
        tapTime: tapTime,
        taps: taps,
        farmTime: farmTime,
        farm: farm,
        farmClaimed: farmClaimed,
        lastLoginTime: currentTime,
        farmStartTime: isFarmActive ? currentTime : null,
      };

      if (userExists) {
        await updateDoc(docRef, data);
        console.log("Document successfully written!");
      } else {
        await setDoc(docRef, data);
        console.log("New document successfully created!");
      }

      localStorage.setItem(`userData-${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error updating/creating document: ", error);
    }
  };

  // Periodically send user data to Firestore
  useEffect(() => {
    if (userId && firstname) {
      handleSendData();
    }
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed, isFarmActive]);

  // Countdown timer for tapping
  useEffect(() => {
    const intervalIdC2 = setInterval(() => {
      setTapTime((prevtapTime) => {
        if (prevtapTime <= 0) {
          setTapLeft(1000);
          return 4 * 60 * 60;
        }
        return prevtapTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalIdC2);
  }, []);

  // Update total balance when taps or farmClaimed changes
  useEffect(() => {
    setTotalBal(taps + farmClaimed);
  }, [taps, farmClaimed]);

  // Function to start farming
  const startFarm = () => {
    const currentTime = new Date().getTime();
    setIsFarmActive(true);
    setFarmStartTime(currentTime);
    startFarmInterval();
  };

  // Function to claim farming rewards
  const claimFarmRewards = () => {
    setFarmClaimed((prevFarmClaimed) => prevFarmClaimed + farm);
    setTotalBal((prevTotalBal) => prevTotalBal + farm);
    setFarm(0);
    setFarmTime(60);
    setIsFarmActive(false);
    clearInterval(farmIntervalRef.current);
  };

  // Interval function for farming
  const startFarmInterval = () => {
    farmIntervalRef.current = setInterval(() => {
      setFarmTime((prevFarmTime) => {
        if (prevFarmTime <= 0) {
          clearInterval(farmIntervalRef.current);
          setIsFarmActive(false);
          return 0;
        } else {
          setFarm((prevFarm) => prevFarm + 0.01);
          return prevFarmTime - 1;
        }
      });
    }, 1000);
  };

  // Handle tapping action
  const handleClickC3 = () => {
    if (tapLeft > 0) {
      setTapLeft(tapLeft - 1);
      setTaps(taps + 1);
    }
  };

  // Handle start or claim button click
  const handleStartClick = () => {
    if (!isFarmActive && farmTime > 0) {
      startFarm();
    } else if (isFarmActive && farmTime === 0) {
      claimFarmRewards();
    }
  };

  // Format time for display
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Periodically send user data to Firestore
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSendData();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

  // Save data before the page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSendData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

  // Save data to local storage on state change
  useEffect(() => {
    if (userId) {
      const userData = {
        tapLeft: tapLeft,
        tapTime: tapTime,
        taps: taps,
        farmTime: farmTime,
        farm: farm,
        farmClaimed: farmClaimed,
        totalBal: totalBal,
        lastLoginTime: new Date().getTime(),
        farmStartTime: isFarmActive ? new Date().getTime() : null,
      };
      localStorage.setItem(`userData-${userId}`, JSON.stringify(userData));
    }
  }, [tapLeft, tapTime, taps, farmTime, farm, farmClaimed, totalBal, isFarmActive]);

  return (
    <div className="max-h-screen bg-zinc-900 text-white flex flex-col items-center p-0 space-y-4 overflow-hidden">
      <div className="p-2 rounded-lg text-center w-full max-w-md">
        <p className="p-2 text-zinc-400 font-bold">Lunar Token</p>
        <p className="text-4xl font-bold">
          {totalBal.toFixed(2)} <span className="text-purple-400">lunar</span>
        </p>
      </div>
      <div className="text-center space-y-2">
        <p className="text-zinc-400">
          Won't stop! Tap time shows refill, {userId ? `${userId} ` : ''} but the fun won’t flop! <span className="text-yellow-400">👍</span>
        </p>
        <div className="p-2 flex justify-center space-x-4">
          <div className="bg-purple-800 p-2 rounded-lg flex">
            <p>{tapLeft} taps left</p>
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
          alt="Lunar Token"
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
        disabled={isFarmActive && farmTime > 0} 
      >
        {isFarmActive && farmTime === 0 ? "Claim" : "Start"} 
      </button>
      <Footer />
    </div>
  );
};

export default Main;
