
import tapps from '../../assets/tapps.png';
import React, { useState, useEffect, useRef } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase'; 
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const Main = () => {
  const [userId, setUserId] = useState(null);
  const [tapLeft, setTapLeft] = useState(1000);
  const [tapTime, setTapTime] = useState(4 * 60 * 60);
  const [taps, setTaps] = useState(0);
  const [farmTime, setFarmTime] = useState(60);
  const [farm, setFarm] = useState(0);
  const [farmClaimed, setFarmClaimed] = useState(0);
  const [totalBal, setTotalBal] = useState(0);
  const [firstname, setFirstName] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const farmIntervalRef = useRef(null);
  const [isFarmActive, setIsFarmActive] = useState(false);

  window.Telegram.WebApp.expand();

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

  const mergeData = (dbData, localData) => {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - localData.lastLoginTime) / 1000);
    const farmElapsedTime = localData.farmStartTime ? Math.floor((currentTime - localData.farmStartTime) / 1000) : 0;

     // If dbData exists, it takes precedence over localData.
  const tapLeft = dbData.tapLeft ?? localData.tapLeft;
  const tapTime = dbData.tapTime ?? localData.tapTime;
  const taps = dbData.taps ?? localData.taps;
  const farmTime = dbData.farmTime ?? localData.farmTime;
  const farm = dbData.farm ?? localData.farm;
  const farmClaimed = dbData.farmClaimed ?? localData.farmClaimed;
  const totalBal = dbData.totalBal ?? localData.totalBal;


    return {
      ...localData, // Default to localData
      ...dbData, // Override with dbData where available
      tapLeft,
      tapTime: Math.max(tapTime - elapsedTime, 0),
      taps,
      farmTime: Math.max(farmTime - farmElapsedTime, 0),
      farm: farm + (localData.farmStartTime ? farmElapsedTime * 0.01 : 0),
      totalBal: totalBal + (localData.farmStartTime ? farmElapsedTime * 0.01 : 0),
      lastLoginTime: currentTime,
      farmStartTime: localData.farmStartTime,
    };
  };


  const loadUserData = async (userId) => {
    try {
      const localStorageData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      const docRef = doc(db, 'data', String(userId));
      const docSnap = await getDoc(docRef);

      if (localStorageData && docSnap.exists()) {
        const dbData = docSnap.data();
        const mergedData = mergeData(dbData, localStorageData);
        await setDoc(docRef, mergedData);  // Update Firestore with merged data

        setStateFromData(mergedData);
        setUserExists(true);
      } else if (localStorageData) {
        await setDoc(docRef, localStorageData);
        setStateFromData(localStorageData);
        setUserExists(true);
      } else if (docSnap.exists()) {
        const dbData = docSnap.data();
        setStateFromData(dbData);
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

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

  useEffect(() => {
    if (userId && firstname) {
      handleSendData();
    }
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed, isFarmActive]);

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

  useEffect(() => {
    setTotalBal(taps + farmClaimed);
  }, [taps, farmClaimed]);

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

  const handleClickC3 = () => {
    if (tapLeft > 0) {
      setTapLeft(tapLeft - 1);
      setTaps(taps + 1);
    }
  };

  const handleStartClick = () => {
    if (!isFarmActive) {
      if (farmTime > 0) {
        setIsFarmActive
        setIsFarmActive(true);
        startFarmInterval();
      }
    } else if (farmTime === 0) {
      setFarmClaimed((prevFarmClaimed) => prevFarmClaimed + farm);
    setTotalBal((prevTotalBal) => prevTotalBal + farm);
    setFarm(0);
      setFarmTime(60);
      setIsFarmActive(false);
      clearInterval(farmIntervalRef.current);
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSendData();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSendData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

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
          {(totalBal).toFixed(2)} <span className="text-purple-400">lunar</span>
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

