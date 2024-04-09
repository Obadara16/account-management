const User = require("../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const validator = require("validator")



// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { password, ...updateFields } = req.body;
//   if (password) {
//     const salt = await bcrypt.genSalt(10);
//     updateFields.password = await bcrypt.hash(password, salt);
//   }
//   try {
//     const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
//       new: true,
//     });
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };

 // Helper function to get the user ID and verify token from the authorization header
 const getUserIdFromToken = (authHeader) => {
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    return decodedToken._id;
};



 

  const updateUser = async (req, res) => {
    const { lastName, firstName, gender, age,  img} = req.body;
  
    try {
      // Get the user ID from the authorization header
      const userId = getUserIdFromToken(req.headers.authorization);
      console.log(userId)
  
      // Find user by ID
      const user = await User.findById(userId);
  
      // Check if user exists
      if (!user) {
        throw Error("User does not exist");
      }
  
      // Update user information
      if (lastName) user.lastName = lastName;
      if (firstName) user.firstName = firstName;
      if (gender) user.gender = gender;
      if (age) user.age = age;
      if (img) user.img = img;
  
      await user.save();
  
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateUserBalance = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { $inc: { walletBalance: req.body.amount } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};






module.exports = {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserBalance,
};
