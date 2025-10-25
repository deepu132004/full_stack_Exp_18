const express = require("express");
const router = express.Router();
const Account = require("../models/Account");

// POST /transfer
router.post("/transfer", async (req, res) => {
  try {
    const { fromUser, toUser, amount } = req.body;

    // Validate request body
    if (!fromUser || !toUser || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer details" });
    }

    // Fetch both accounts
    const sender = await Account.findOne({ username: fromUser });
    const receiver = await Account.findOne({ username: toUser });

    if (!sender) return res.status(404).json({ error: "Sender account not found" });
    if (!receiver) return res.status(404).json({ error: "Receiver account not found" });

    // Check sufficient balance
    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Sequential updates — no transactions
    sender.balance -= amount;
    await sender.save();  // Save sender first

    receiver.balance += amount;
    await receiver.save();  // Then save receiver

    res.status(200).json({
      message: "Transfer successful",
      fromUser,
      toUser,
      amount,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });

  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
