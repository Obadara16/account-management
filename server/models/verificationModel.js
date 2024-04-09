const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Expire OTP documents after 10 minutes
  }
});

module.exports = mongoose.model('Verification', VerificationSchema);
