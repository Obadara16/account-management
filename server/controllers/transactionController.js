const Transaction = require("../models/transactionModel");


const getTransactionById = async (req, res, next) => {
  try {
    const {id} = req.params; 
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      userId: id 
    }).populate("userId", "name email");

    if (!transaction) {
      return res.status(404).json({ status_code: 404, status: "error", message: "Transaction not found" });
    }

    res.status(200).json({ status_code: 200, status: "success", data: transaction });
  } catch (err) {
    next(err);
  }
};


const getTransactionsByUserId = async (req, res, next) => {
  try {
    const {id} = req.params; 
    const transactions = await Transaction.find({ userId: id }); 
    res.status(200).json({ status_code: 200, status: "success", data: transactions });
  } catch (err) {
    next(err);
  }
};




const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({ status_code: 200, status: "success", data: transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactionById,
  getTransactionsByUserId,
  getAllTransactions,
};
