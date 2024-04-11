const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  gender: {
    type: String
  },
  phoneNumber: {
    type: String,
    trim: true,
  },  
  img: {
    type: String
  },
  role: {
    type: String,
    default: "admin", 
  },
  resetToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
