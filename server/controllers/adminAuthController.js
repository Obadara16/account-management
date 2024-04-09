const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const Verification = require("../models/verificationModel");
const { sendVerificationEmail } = require("../services/email");


const generateAccessToken = (adminId, role) => {
  return jwt.sign({ adminId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(401).json({ error: "Incorrect Email" });
      }
  
      
      if (!admin.isActive) {
        return res.status(401).json({ error: "Account has not been verified" });
      }
  
      
      const match = await bcrypt.compare(password, admin.password);
  
      if (!match) {
        return res.status(401).json({ error: "Incorrect Password" });
      }
  
      const role = admin.role || "admin"; 
  
      const accessToken = generateAccessToken(admin._id, role);
  
      res.status(200).json({ admin, accessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

const adminRegister = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      email,
      password: hash,
      isActive: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
  
      await Verification.create({ email, otp });
  
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
      setTimeout(async () => {
        await Verification.findOneAndDelete({ email });
      }, otpExpiresAt - Date.now());
  
      await sendVerificationEmail(email, otp);
  

    const role = newAdmin.role || "admin"; 
    const accessToken = generateAccessToken(newAdmin._id, role);

    res.status(201).json({ admin: newAdmin, accessToken, message: "Admin registered successfully. Verification email sent." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  adminLogin,
  adminRegister,
};