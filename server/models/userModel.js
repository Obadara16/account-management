const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: "user",
  },
  resetToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
