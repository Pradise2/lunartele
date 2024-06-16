import React, { useEffect, useState } from 'react';
import Footer from '../Others/Footer';
import { collection, getDocs } from '@firebase/firestore';
import { db } from '../../firebase';

const Squad = () => {
  const [count, setCount] = useState(0);
  const [idme, setIdme] = useState("");
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  const formattedCount = new Intl.NumberFormat().format(count).replace(/,/g, "");

  useEffect(() => {
    const telegramUserid = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    if (telegramUserid) {
      setIdme(telegramUserid);
    }
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const telegramUserid = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    if (telegramUserid) {
      setIdme(telegramUserid);
    }
    const filtered = users.filter((user) => user.refereeId === `${telegramUserid}`);
    setCount(filtered.length);
  }, [idme, users]);

  const fetchAllUsers = async () => {
    try {
      const userRef = collection(db, "telegramUsers");
      const querySnapshot = await getDocs(userRef);
      const allUsers = [];
      const uniqueUsername = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const { username, fullname, refereeId, count } = data;

        if (!uniqueUsername.has(username)) {
          allUsers.push({ username, fullname, refereeId, count });
          uniqueUsername.add(username);
        }
      });

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const copyToClipboard = () => {
    const telegramUserid = window.Telegram.WebApp.initDataUnsafe?.user?.id;

    if (telegramUserid) {
      setIdme(telegramUserid);
    }

    const reflink = `https://t.me/..._bot?start=ref${telegramUserid}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(reflink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
        });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = reflink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="max-h-screen bg-zinc-900 text-white flex flex-col items-center p-0">
      <h1 className="text-center text-2xl font-bold mb-6">
        The bigger the tribe, the better the vibe!
      </h1>
      <div className="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4">
        <p className="text-center text-zinc-400">Total squad balance</p>
        <p className="text-center text-3xl font-bold">
          22’569.31 <span className="text-purple-400"></span>
        </p>
      </div>
      <div className="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4">
        <p className="text-center text-zinc-400">Your rewards</p>
        <p className="text-center text-3xl font-bold">
          0.00 <span className="text-purple-400"></span>
        </p>
        <p className="text-center text-zinc-400 mb-4">10% of your friends earnings</p>
        <button className="w-full bg-zinc-700 text-zinc-500 py-2 rounded-lg">Claim</button>
      </div>
      <div className="w-full max-w-md bg-zinc-800 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            alt="team"
            src="https://placehold.co/24x24"
            className="w-6 h-6"
          />
          <p>Your team</p>
        </div>
        <p>{formattedCount ? formattedCount : "0"} Users</p>
      </div>
      <div className="w-full max-w-md flex space-x-2">
        <button onClick={copyToClipboard} className="flex-1 bg-purple-500 py-2 rounded-lg">Invite friends</button>
        <button onClick={copyToClipboard} className="bg-zinc-700 p-2 rounded-lg">
          {copied ? <span>Copied!</span> : <span>Copy</span>}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Squad;
