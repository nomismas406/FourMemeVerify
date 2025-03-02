require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Web3 = require("web3");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", {
  address: String,
  signature: String,
});

const web3 = new Web3();

app.post("/verify", async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    const recoveredAddress = web3.eth.accounts.recover(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    await User.findOneAndUpdate({ address }, { signature }, { upsert: true });

    res.json({ success: true, message: "Wallet verified!" });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
