const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const TOKEN = '7413324952:AAEbvrvrXHSNvWC8wG9pjAvaWAr5iVPyVf8'
const bot = new Telegraf(TOKEN)

const web_link = 'https://lunartele.vercel.app/'

bot.start((ctx) => ctx.reply('Welcome', {
    reply_markup: {
        keyboard: [[{ text: "web app",web_app: {url:web_link}}]] },
})
);


// Log when a user sends a message
bot.on('message', (ctx) => {
    console.log(`User ${ctx.from.id} sent a message: ${ctx.message.text}`);
    // Handle the message as needed
});

// Log when the bot is launched
bot.launch();
console.log('Bot started');

// Log errors
bot.catch((err) => {
    console.error('Error occurred', err);
});