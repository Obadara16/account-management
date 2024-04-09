const Transaction = require("../models/transactionModel");
const User = require("../models/authModel");

const createTransaction = async (req, res, next) => {
  try {
    const { userId, type, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let transactionAmount = 0;
    if (type === "add") {
      transactionAmount = amount;
      user.walletBalance += amount;
    } else if (type === "payment") {
      transactionAmount = -amount;
    } else if (type === "withdraw") {
      transactionAmount = -amount;
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.walletBalance -= amount;
    }
    const transaction = new Transaction({
      userId,
      type,
      amount: transactionAmount,
    });
    await transaction.save();
    await user.save();
    res.status(201).json({ transaction, user });
  } catch (err) {
    next(err);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(
      req.params.transactionId
    ).populate("userId", "name email");
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (err) {
    next(err);
  }
};

const getTransactionsByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const transactions = await Transaction.find({ userId });
    res.status(200).json({data: transactions});
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionsByUserId,
};
