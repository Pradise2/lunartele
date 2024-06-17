import tapps from '../../assets/tapps.png';
import React, { useState, useEffect, useRef } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase'; 
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const Main = () => {
  const [userId, setUserId] = useState(null);
  const [tapLeft, setTapLeft] = useState(10);
  const [tapTime, setTapTime] = useState(4*60*60);
  const [taps, setTaps] = useState(0);
  const [farmTime, setFarmTime] = useState(40);
  const [farm, setFarm] = useState(0);
  const [farmClaimed, setFarmClaimed] = useState(0);
  const [isClaimClicked, setIsClaimClicked] = useState(false);
  const [totalBal, setTotalBal] = useState(0);
  const [firstname, setFirstName] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const farmIntervalRef = useRef(null);

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

  const loadUserData = async (userId) => {
    try {
      const localStorageData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      if (localStorageData) {
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - localStorageData.lastLoginTime) / 1000);
        const farmElapsedTime = isClaimClicked ? Math.floor((currentTime - localStorageData.farmStartTime) / 1000) : 0;

        setTapLeft(localStorageData.tapLeft);
        setTapTime(Math.max(localStorageData.tapTime - elapsedTime, 0));
        setTaps(localStorageData.taps);
        setFarmTime(Math.max(localStorageData.farmTime - farmElapsedTime, 0));
        setFarm(localStorageData.farm + (isClaimClicked ? farmElapsedTime * 0.01 : 0));
        setFarmClaimed(localStorageData.farmClaimed);
        setTotalBal(localStorageData.totalBal);
        setUserExists(true);
        console.log("Document data loaded from local storage:", localStorageData);

        if (isClaimClicked && farmTime > 0) {
          startFarmInterval();
        }

        return;
      }

      const docRef = doc(db, 'test', String(userId));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - data.lastLoginTime) / 1000);
        const farmElapsedTime = isClaimClicked ? Math.floor((currentTime - data.farmStartTime) / 1000) : 0;

        setTapLeft(data.tapLeft);
        setTapTime(Math.max(data.tapTime - elapsedTime, 0));
        setTaps(data.taps);
        setFarmTime(Math.max(data.farmTime - farmElapsedTime, 0));
        setFarm(data.farm + (isClaimClicked ? farmElapsedTime * 0.01 : 0));
        setFarmClaimed(data.farmClaimed);
        setTotalBal(data.totalBal);
        setUserExists(true);

        localStorage.setItem(`userData-${userId}`, JSON.stringify(data));

        if (isClaimClicked && farmTime > 0) {
          startFarmInterval();
        }
      } else {
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
      const docRef = doc(db, 'test', String(userId));
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
        farmStartTime: isClaimClicked ? currentTime : null,
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
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed, isClaimClicked]);

  useEffect(() => {
    const intervalIdC2 = setInterval(() => {
      setTapTime((prevtapTime) => {
        if (prevtapTime <= 0) {
          setTapLeft(10);
          return 4*60*60;
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
      setFarmTime((prevfarmTime) => {
        if (prevfarmTime <= 0) {
          clearInterval(farmIntervalRef.current);
          return 0;
        } else {
          setFarm((prevfarm) => prevfarm + 0.01);
          return prevfarmTime - 1;
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
    if (!isClaimClicked) {
      setIsClaimClicked(true);
      startFarmInterval();
    } else {
      setFarmClaimed(farmClaimed + farm);
      setFarm(0);
      setFarmTime(40);
      setIsClaimClicked(false);
      clearInterval(farmIntervalRef.current);
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
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
        farmStartTime: isClaimClicked ? new Date().getTime() : null,
      };
      localStorage.setItem(`userData-${userId}`, JSON.stringify(userData));
    }
  }, [tapLeft, tapTime, taps, farmTime, farm, farmClaimed, totalBal, isClaimClicked]);

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
            <p>{tapLeft} tapLeft</p>
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