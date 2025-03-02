require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Web3 = require("web3");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const User = mongoose.model("User", {
//   address: String,
//   signature: String,
// });

const web3 = new Web3();

const TELEGRAM_BOT_TOKEN = "7924323431:AAETnehjkiD2zQmzy6QI_e5t4IqvmmjhFmA";
const TELEGRAM_API_URL = `https://api.telegram.org/bot7924323431:AAETnehjkiD2zQmzy6QI_e5t4IqvmmjhFmA/sendMessage`;

async function sendTelegramMessage(chatId, message) {
    try {
        await axios.post(TELEGRAM_API_URL, {
            chat_id: chatId,
            text: message
        });
    } catch (error) {
        console.error("Error sending Telegram message:", error.response?.data || error.message);
    }
}

app.post("/verify", async (req, res) => {
  try {
    const { address, signature, message, chatId } = req.body;
    const recoveredAddress = web3.eth.accounts.recover(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

   // await User.findOneAndUpdate({ address }, { signature }, { upsert: true });
    await sendTelegramMessage(chatId, "Wallet verified!");
    res.json({ success: true, message: "Wallet verified!" });
  } catch (error) {
    await sendTelegramMessage(chatId, "Verification failed!");
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
