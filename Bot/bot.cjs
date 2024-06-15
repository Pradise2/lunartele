require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const TOKEN = process.env.TOKEN || '7413324952:AAEbvrvrXHSNvWC8wG9pjAvaWAr5iVPyVf8'; // Replace with your token or use .env for better security
const bot = new Telegraf(TOKEN);

const web_link = 'https://lunartele.vercel.app/';
bot.start((ctx) => {
    const startPayload = ctx.startPayload || '';
    const userId = ctx.chat.id;
    const urlSent = `${web_link}?ref=${startPayload}&userId=${userId}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username.replace(/[-.!]/g, '\\$&')}` : user.first_name;

    const messageText = `
*Hey, ${userName}\\! Welcome to Lunar\\!*
Tap [here](${urlSent}) and see your balance rise\\.

Bring them all into the game\\.
    `;

    ctx.replyWithMarkdownV2(messageText, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Start Now", web_app: { url: urlSent } }]
            ],
        }
    });

    // Log client ID, username, and user information
    console.log(`Client ID: ${ctx.chat.id}`);
    console.log(`Username: ${user.username || 'N/A'}`);
    console.log('User Info:', user);
});

// Log when a user sends a message
bot.on('message', (ctx) => {
    const userId = ctx.from.id;
    const messageText = ctx.message.text;

    console.log(`User ${userId} sent a message: ${messageText}`);

    // Handle the message as needed
});

// Adding a custom command to show a button with a URL
bot.command('link', (ctx) => {
    ctx.reply('Check out Lunar here:', Markup.inlineKeyboard([
        Markup.button.url('Visit Lunar', web_link)
    ]));
});

// Log when the bot is launched
bot.launch()
    .then(() => console.log('Bot started'))
    .catch((err) => console.error('Error launching bot:', err));
