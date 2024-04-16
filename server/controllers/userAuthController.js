const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Verification = require("../models/verificationModel");
const { sendVerificationEmail } = require("../services/email");

const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Incorrect Email",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Account has not been verified",
      });
    }

    if (user.blocked) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Your account has been blocked. Please contact support for assistance.",
      });
    }

    if (user.deletedAt) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Your account has been deleted. Please contact support for assistance.",
      });
    }


    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        status_code: 401,
        status: "error",
        message: "Incorrect Password",
      });
    }

    const role = user.role || "user"; 

    const accessToken = generateAccessToken(user._id, role);

    res.status(200).json({
      status_code: 200,
      status: "success",
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isVerified: user.isVerified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Internal Server Error",
    });
  }
};


const userRegister = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status_code: 400,
        status: "error",
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      phoneNumber,
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await Verification.create({ email, otp });

    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
    setTimeout(async () => {
      await Verification.findOneAndDelete({ email });
    }, otpExpiresAt - Date.now());

    await sendVerificationEmail(email, otp);
    
    const role = newUser.role || "user";

    const accessToken = generateAccessToken(newUser._id, role);

    res.status(201).json({
      status_code: 201,
      status: "success",
      message: "User registered successfully. Verification email sent.",
      data: {
        user: {
          _id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          isVerified: newUser.isVerified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status_code: 500,
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  userLogin,
  userRegister,
};
