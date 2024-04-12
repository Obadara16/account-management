const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const upload = require('../middlewares/multer'); // Import Multer middleware for file upload
const cloudinary = require('../middlewares/cloudinary');



const getUserIdFromToken = (authHeader) => {
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return decodedToken.userId;
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  let { lastName, firstName, phoneNumber, gender } = req.body;
  let img;

  if (req.file) {
      img = req.file.path; 
  }

  try {
      let user = await User.findById(id);
      
      if (!user) {
          return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
      }
      
      if (lastName) user.lastName = lastName;
      if (firstName) user.firstName = firstName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (gender) user.gender = gender;
      if (img) {
          const result = await cloudinary.uploader.upload(img);
          user.img = result.secure_url;
      }

      await user.save();

      res.status(200).json({ status_code: 200, status: "success", message: "User updated successfully", data: { user } });
  } catch (error) {
      res.status(400).json({ status_code: 400, status: "error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = getUserIdFromToken(req.headers.authorization);

  try {
    
    if (req.user.role === 'admin') {
      
      await User.findByIdAndDelete(id);
      res.status(200).json({ status_code: 200, status: "success", message: "User has been hard deleted" });
    } else if (userId === id) {
      
      const softDeletedUser = await User.findByIdAndUpdate(id, { deletedAt: new Date() });
      if (!softDeletedUser) {
        return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
      }
      res.status(200).json({ status_code: 200, status: "success", message: "User has been soft deleted" });
    } else {
      
      res.status(403).json({ status_code: 403, status: "error", error: "Unauthorized to delete other users" });
    }
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};


const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }
    const { password, ...others } = user._doc;
    res.status(200).json({ status_code: 200, status: "success", data: others });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const updateUserBalance = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $inc: { walletBalance: req.body.amount } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", message: "User not found" });
    }
    res.status(200).json({ status_code: 200, status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json({ status_code: 200, status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { blocked: true }, { new: true });
    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }
    res.status(200).json({ status_code: 200, status: "success", message: "User has been blocked", data: { user } });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const unblockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { blocked: false }, { new: true });
    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }
    res.status(200).json({ status_code: 200, status: "success", message: "User has been unblocked", data: { user } });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    });
    res.status(200).json({ status_code: 200, status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};


const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ status_code: 404, status: "error", error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ status_code: 400, status: "error", error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ status_code: 200, status: "success", message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};


const getUserBalance = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.walletBalance;
  } catch (error) {
    throw error;
  }
};






module.exports = {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserBalance,
  blockUser,
  unblockUser,
  searchUsers,
  changePassword,
  getUserBalance
};
