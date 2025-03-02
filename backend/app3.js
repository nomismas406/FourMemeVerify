require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const bot = new TelegramBot("7924323431:AAETnehjkiD2zQmzy6QI_e5t4IqvmmjhFmA", { polling: true });


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Error:", err));

// Schema for storing verification results
const VerificationSchema = new mongoose.Schema({
    userId: String,
    address: String,
    verified: Boolean
});
const Verification = mongoose.model('Verification', VerificationSchema);

// Store user verification state
const userStates = {};

// Command: /verify - Sends the verification page link
bot.onText(/\/verify/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Generate a unique session ID for the user
    const sessionId = `${chatId}-${Date.now()}`;
    userStates[chatId] = { sessionId, awaitingVerification: true };

    const verifyUrl = `${process.env.VERIFY_PAGE_URL}?session=${sessionId}`;

    bot.sendMessage(chatId, `Click the link below to verify your wallet:\n[Verify Wallet](${verifyUrl})`, { parse_mode: 'Markdown' });
});

// Handle user responses after verification
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    
    if (userStates[chatId]?.awaitingVerification) {
        const userResponse = msg.text.trim();

        if (userResponse.startsWith("0x") && userResponse.length === 42) {
            await Verification.findOneAndUpdate(
                { userId: chatId },
                { userId: chatId, address: userResponse, verified: true },
                { upsert: true, new: true }
            );

            bot.sendMessage(chatId, `✅ Wallet verified: ${userResponse}`);
            delete userStates[chatId];
        } else {
            bot.sendMessage(chatId, "❌ Invalid response. Please enter a valid wallet address.");
        }
    }
});

// Express endpoint to accept verification results from the webpage
app.post('/verify', async (req, res) => {
    const { sessionId, address } = req.body;

    if (!sessionId || !address) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const chatId = sessionId.split('-')[0];

    await Verification.findOneAndUpdate(
        { userId: chatId },
        { userId: chatId, address, verified: true },
        { upsert: true, new: true }
    );

    bot.sendMessage(chatId, `✅ Your wallet (${address}) has been successfully verified!`);
    delete userStates[chatId];

    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
