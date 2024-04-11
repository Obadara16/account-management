const express = require("express");
const router = express.Router();
const FundingRequest = require("../models/fundingRequestModel");
const User = require("../models/authModel");
const Transaction = require("../models/transactionModel");

const addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ status_code: 401, error: "User not found" });
    }

    const fundingRequest = new FundingRequest({
      userId,
      amount,
      status: "pending",
      createdAt: new Date(),
    });
    await fundingRequest.save();

    const transaction = new Transaction({
      userId,
      type: "funding_request",
      amount,
      status: "pending",
      createdAt: new Date(),
    });
    await transaction.save();

    res.status(200).json({ status_code: 200, message: "Funding request submitted successfully" });
  } catch (error) {
    res.status(400).json({ status_code: 400, error: error.message });
  }
};

const approveFundingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const fundingRequest = await FundingRequest.findById(requestId);
    if (!fundingRequest) {
      return res.status(404).json({ status_code: 404, error: "Funding request not found" });
    }

    fundingRequest.status = "approved";
    await fundingRequest.save();

    const transaction = await Transaction.findOneAndUpdate(
      { type: "funding_request", userId: fundingRequest.userId },
      { status: "completed" },
      { new: true }
    );

    res.status(200).json({ status_code: 200, message: "Funding request approved successfully" });
  } catch (error) {
    res.status(400).json({ status_code: 400, error: error.message });
  }
};

const rejectFundingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const fundingRequest = await FundingRequest.findById(requestId);
    if (!fundingRequest) {
      return res.status(404).json({ status_code: 404, error: "Funding request not found" });
    }

    fundingRequest.status = "rejected";
    await fundingRequest.save();

    res.status(200).json({ status_code: 200, message: "Funding request rejected successfully" });
  } catch (error) {
    res.status(400).json({ status_code: 400, error: error.message });
  }
};

module.exports = {
  addFunds,
  approveFundingRequest,
  rejectFundingRequest

};
