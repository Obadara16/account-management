const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const upload = require('../middlewares/multer'); 
const cloudinary = require('../middlewares/cloudinary');

const changePassword = async (req, res) => {
  const { adminId } = req.user;
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ status_code: 404, status: "error", error: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

    if (!isPasswordValid) {
      return res.status(400).json({ status_code: 400, status: "error", error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;

    await admin.save();

    res.status(200).json({ status_code: 200, status: "success", message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
};

const getAdmin = async (req, res) => {
    const { adminId } = req.user;
  
    try {
      const admin = await Admin.findById(adminId);
  
      if (!admin) {
        return res.status(404).json({ status_code: 404, status: "error", error: "Admin not found" });
      }
  
      res.status(200).json({ status_code: 200, status: "success", data: { admin } });
    } catch (error) {
      res.status(400).json({ status_code: 400, status: "error", error: error.message });
    }
  };
  
const updateAdmin = async (req, res) => {
const { adminId } = req.user;
const { lastName, firstName, phoneNumber, gender } = req.body;
let img;

if (req.file) {
    img = req.file.path; 
}

try {
    let updateFields = {};
    
    if (lastName) updateFields.lastName = lastName;
    if (firstName) updateFields.firstName = firstName;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (gender) updateFields.gender = gender;
    if (img) {
    const result = await cloudinary.uploader.upload(img);
    updateFields.img = result.secure_url;
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
    { _id: adminId }, 
    { $set: updateFields }, 
    { new: true } 
    );

    if (!updatedAdmin) {
    return res.status(404).json({ status_code: 404, status: "error", error: "Admin not found" });
    }

    res.status(200).json({ status_code: 200, status: "success", message: "Admin updated successfully", data: { admin: updatedAdmin } });
} catch (error) {
    res.status(400).json({ status_code: 400, status: "error", error: error.message });
}
};



module.exports = {
  changePassword,
  getAdmin,
  updateAdmin
};
