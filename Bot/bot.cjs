require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAURFbyDHkq626UusPHMijpxmcUOOl5-Tw",
    authDomain: "test-f326f.firebaseapp.com",
    projectId: "test-f326f",
    storageBucket: "test-f326f.appspot.com",
    messagingSenderId: "626801402709",
    appId: "1:626801402709:web:d3653b964333a0de6845dc",
    measurementId: "G-517PH4LM9K",
    databaseURL: "https://test-f326f-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Telegram Bot Token
const TOKEN = process.env.TOKEN || '7413324952:AAEbvrvrXHSNvWC8wG9pjAvaWAr5iVPyVf8';
const bot = new Telegraf(TOKEN);

// Web App Link
const web_link = 'https://lunartele.vercel.app/';

// Start Handler
bot.start(async (ctx) => {
    const startPayload = ctx.startPayload || '';
    const userId = ctx.chat.id;
    const urlSent = `${web_link}?ref=${startPayload}&userId=${userId}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username.replace(/[-.!]/g, '\\$&')}` : user.first_name;
    const isBot = user.is_bot;

    const messageText = `
*Hey, ${userName}\\! Welcome to Lunar\\!*
Tap [here](${urlSent}) and see your balance rise\\.

Bring them all into the game\\.
    `;

    ctx.replyWithMarkdown(messageText, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Start Now", web_app: { url: urlSent } }]
            ],
            in: true
        },
    });


    // Store User Data in Firestore
    const userDataRef = doc(db, 'users', String(userId));
    await setDoc(userDataRef, {
        userId: userId,
        userName: userName,
        isBot: isBot,
        urlSent: urlSent,
        
    });
});



bot.launch();

module.exports = bot;
