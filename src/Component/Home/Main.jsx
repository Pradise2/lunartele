import tapps from '../../assets/tapps.png';
import React, { useState, useEffect } from "react";
import Footer from '../Others/Footer';
import { db } from '../../firebase'; 
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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
  const [userExists, setUserExists] = useState(false); // Track if the user exists


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

   // Use a useRef to store the interval IDs
   const tapTimeIntervalRef = useRef(null);
   const farmTimeIntervalRef = useRef(null);

  const loadUserData = async (userId) => {
    try {
        // Try to load from local storage
      const localStorageData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      if (localStorageData) {
        setTapLeft(localStorageData.tapLeft);
        setTapTime(localStorageData.tapTime);
        setTaps(localStorageData.taps);
        setFarmTime(localStorageData.farmTime);
        setFarm(localStorageData.farm);
        setFarmClaimed(localStorageData.farmClaimed);
        setTotalBal(localStorageData.totalBal);
        setUserExists(true);
        console.log("Document data loaded from local storage:", localStorageData);
        return; // Data loaded from local storage, stop here
      }


      const docRef = doc(db, 'details', String(userId));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTapLeft(data.tapLeft);
        setTapTime(data.tapTime);
        setTaps(data.taps);
        setFarmTime(data.farmTime);
        setFarm(data.farm);
        setFarmClaimed(data.farmClaimed);
        setTotalBal(data.totalBal);
        setUserExists(true); // User exists
        console.log("Document data:", data);

        // Save to local storage
        localStorage.setItem(`userData-${userId}`, 
          JSON.stringify(data));
      } else {
        console.log("No such document!");
        setUserExists(false); // User doesn't exist
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
          tapTime: tapTime,
          taps: taps,
          farmTime: farmTime,
          farm: farm,
          farmClaimed: farmClaimed
        });
      console.log("Document successfully written!");
    } else {
      // Create a new document if the user is new
      await setDoc(docRef, {
        userId: userId,
        firstName: firstname,
        totalBal: totalBal,
        tapLeft: tapLeft,
        tapTime: tapTime,
        taps: taps,
        farmTime: farmTime,
        farm: farm,
        farmClaimed: farmClaimed
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
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

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

  // Save data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleSendData();
    }, 1000); // Save data every 1 seconds

    return () => clearInterval(intervalId);
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

  // Save data before the user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleSendData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, firstname, totalBal, tapLeft, tapTime, taps, farmTime, farm, farmClaimed]);

   // Save data to local storage whenever state changes
   useEffect(() => {
    const userData = {
      tapLeft: tapLeft,
      tapTime: tapTime,
      taps: taps,
      farmTime: farmTime,
      farm: farm,
      farmClaimed: farmClaimed,
      totalBal: totalBal
    };
    localStorage.setItem(`userData-${userId}`, JSON.stringify(userData));
  }, [tapLeft, tapTime, taps, farmTime, farm, farmClaimed, totalBal]); 
  
  // Function to load farmTime from local storage on component mount
  const loadFarmTimeFromLocalStorage = () => {
    if (userId) {
      const storedData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      if (storedData && storedData.farmTime) {
        setFarmTime(storedData.farmTime);
      }
    }
  };

   // Function to load tapTime from local storage on component mount
   const loadTapTimeFromLocalStorage = () => {
    if (userId) {
      const storedData = JSON.parse(localStorage.getItem(`userData-${userId}`));
      if (storedData && storedData.tapTime) {
        setTapTime(storedData.tapTime);
      }
    }
  };

  useEffect(() => {
    loadFarmTimeFromLocalStorage(); // Load farmTime from local storage on component mount
  }, [userId]); // This effect runs only when userId changes

  useEffect(() => {
    loadTapTimeFromLocalStorage(); // Load tapTime from local storage on component mount
  }, [userId]);

   // Start the tapTime countdown when the component mounts
   useEffect(() => {
    if (tapTimeIntervalRef.current === null) {
      // Start the tapTime interval only if it's not already running
      tapTimeIntervalRef.current = setInterval(() => {
        setTapTime((prevTapTime) => {
          if (prevTapTime <= 0) {
            setTapLeft(10);
            return 30;
          }
          return prevTapTime - 1;
        });
      }, 1000);
    }

    // Clear the interval when the component unmounts
    return () => {
      clearInterval(tapTimeIntervalRef.current);
      tapTimeIntervalRef.current = null; // Reset the interval ID
    };
  }, []); // This effect runs only once when the component mounts

  // Start the farmTime countdown when the claim button is clicked
  useEffect(() => {
    if (farmTimeIntervalRef.current === null && isClaimClicked) {
      // Start the farmTime interval only if it's not already running
      farmTimeIntervalRef.current = setInterval(() => {
        setFarmTime((prevFarmTime) => {
          if (prevFarmTime <= 0) {
            clearInterval(farmTimeIntervalRef.current);
            farmTimeIntervalRef.current = null; // Reset the interval ID
            return 0; // Stop at 0
          } else {
            setFarm((prevFarm) => prevFarm + 0.01);
            return prevFarmTime - 1;
          }
        });
      }, 1000);
    }

    // Clear the interval when the component unmounts or when the claim button is clicked again
    return () => {
      clearInterval(farmTimeIntervalRef.current);
      farmTimeIntervalRef.current = null; // Reset the interval ID
    };
  }, [isClaimClicked]);
  
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
