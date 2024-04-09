const User = require("../models/authModel");
const Transaction = require("../models/transactionModel");
const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);
const axios = require("axios")

const addFunds = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const paystackResponse = await paystack.transaction.initialize({
      email: user.email,
      amount: amount * 100,
      callback_url: "http://localhost:5173/dashboard", 
    });

    user.walletBalance.paystackRef = paystackResponse.data.reference;
    await user.save();

    res.json({ authorization_url: paystackResponse.data.authorization_url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateWalletBalance = async (req, res) => {
  try {
    const { reference } = req.query;
    console.log("this is the query received", reference);

    // Verify the payment with Paystack
    const paystackResponse = await paystack.transaction.verify(reference);
    console.log("paystack response is this:", paystackResponse);

    // Get the user associated with the Paystack reference
    const user = await User.findOne({ "walletBalance.paystackRef": reference });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Update the user's wallet balance
    user.walletBalance.balance += paystackResponse.data.amount / 100; // Convert back to Naira
    user.walletBalance.paystackRef = undefined;
    await user.save();

    // Resolve the account number to get the bank code and name
    // Resolve the account number to get the bank code and name
    // const bankResponse = await axios.get(`https://api.paystack.co/bank/resolve?account_number=${paystackResponse.data.authorization.last4}&bank_code=${paystackResponse.data.authorization.bank_code}`, {
    //   headers: {
    //     Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    //   },
    // });
    

    //   console.log("this is the bank response", bankResponse)

    //   // Get the bank icon based on the bank code
    //   const bankCode = bankResponse.data.data.code;
    //   const bankName = bankResponse.data.data.name;
    //   const bankIcon = `https://cdn.paystack.com/payment-vector-icons/banks/${bankCode}.svg`;



    const transaction = new Transaction({
      userId: user._id,
      type: "add",
      // iconLink: bankIcon,
      // bankName: bankName,
      amount: paystackResponse.data.amount / 100, // Convert back to Naira
      date: new Date(),
    });
    await transaction.save();

    res.send({ 
      message: paystackResponse.message
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ walletBalance: user.walletBalance.balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// const addFunds = async (req, res) => {
//     try {
//       const { userId, amount } = req.body;
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       user.walletBalance += amount;
//       await user.save();
//       const transaction = new Transaction({
//         userId,
//         type: 'add',
//         amount,
//         date: new Date()
//       });
//       await transaction.save();
//       res.json({ walletBalance: user.walletBalance });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   };

const withdrawFunds = async (req, res) => {
  try {
    const { userId, amount, bankAccount } = req.body;

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check that the user has enough balance to withdraw
    if (user.walletBalance.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Initiate the transfer from the user's Paystack balance to the bank account
    const transferResponse = await paystack.transaction.initialize({
      amount: amount * 100, // Convert to kobo
      email: user.email,
      reference: `withdrawal_${Date.now()}`,
      channels: ["bank"],
      metadata: {
        userId: user._id,
        bankAccountId: bankAccount._id,
      },
      bank: {
        code: bankAccount.bankCode,
        account_number: bankAccount.accountNumber,
        type: "nuban",
      },
    });

    // Update the user's wallet balance with the new balance
    const previousBalance = user.walletBalance.balance;
    user.walletBalance.balance -= amount;
    await user.save();

    // Create a new transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: "withdraw",
      amount: amount,
      date: new Date(),
      reference: transferResponse.data.reference,
    });
    await transaction.save();

    // Send a response to the user with the new balance
    res.json({
      message: "Withdrawal initiated successfully",
      previousBalance,
      newBalance: user.walletBalance.balance,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getWalletBalance,
  addFunds,
  withdrawFunds,
  updateWalletBalance,
};
