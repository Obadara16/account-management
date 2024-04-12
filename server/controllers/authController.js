const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const otpGenerator = require("otp-generator");
const Verification = require("../models/verificationModel");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../services/email");

const generateAccessToken = (userId, adminId, role) => {
  let id = userId;
  if (role === 'admin') {
    id = adminId;
  }
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const refreshToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ status_code: 401, status: "error", error: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !(decoded.userId || decoded.adminId) || !decoded.role) {
      return res.status(401).json({ status_code: 401, status: "error", error: "Invalid access token" });
    }

    const newAccessToken = generateAccessToken(decoded.userId, decoded.adminId, decoded.role);

    res.status(200).json({ status_code: 200, status: "success", accessToken: newAccessToken, message: "Access token refreshed successfully" });
  } catch (error) {
    console.error(error);
    res.status(401).json({ status_code: 401, status: "error", error: "Invalid access token" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    
    const verification = await Verification.findOne({ email });

    if (!verification) {
      return res.status(404).json({ status_code: 404, status: "error", error: "Verification entry not found" });
    }

    
    if (verification.otp !== otp) {
      return res.status(400).json({ status_code: 400, status: "error", error: "Invalid OTP" });
    }

    
    if (verification.otpExpiresAt < new Date()) {
      return res.status(400).json({ status_code: 400, status: "error", error: "OTP has expired" });
    }

    
    let user = await User.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }

    
    user.isVerified = true;
    await user.save();

    res.status(200).json({ status_code: 200, status: "success", message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: 500, status: "error", error: "Internal Server Error" });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 900000; 
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-new-password/${resetToken}`;

    await sendResetPasswordEmail(email, resetLink);

    res.status(200).json({ status_code: 200, status: "success", message: "Password reset link sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: 500, status: "error", error: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    let user = await User.findOne({ resetToken });

    if (!user) {
      user = await Admin.findOne({ resetToken });
    };

    if (!user || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ status_code: 400, status: "error", error: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ status_code: 200, status: "success", message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: 500, status: "error", error: "Internal Server Error" });
  }
};

const requestNewOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found or already verified" });
    }

    let verification = await Verification.findOne({ email });

    if (!verification) {
      const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
      });

      verification = await Verification.create({ email, otp });

      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); 
      setTimeout(async () => {
        await Verification.findOneAndDelete({ email });
      }, otpExpiresAt - Date.now());

      await sendVerificationEmail(email, otp);
    }

    res.status(200).json({ status_code: 200, status: "success", message: "New OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: 500, status: "error", error: "Internal Server Error" });
  }
};


const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(401).json({ status_code: 401, status: "error", error: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    await user.save();
    res.status(200).json({ status_code: 200, status: "success", message: "Password changed successfully"  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status_code: 500, status: "error", error: "Internal Server Error" });
  }
};


module.exports = {
  refreshToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
  requestNewOTP,
  changePassword,
};
    