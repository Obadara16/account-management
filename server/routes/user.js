const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer")
const {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserBalance,
  blockUser,
  unblockUser,
  searchUsers,
  getAdmin,
  updateAdminProfile, 
} = require("../controllers/userController");
const {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");

router.put("/:id", requireAuthAndAuthorization, upload.single('img'), updateUser);
router.delete("/:id", requireAuth, deleteUser);
router.get("/find/:id", requireAuthAndAuthorization, getUserById);
router.get("/", requireAuthAndAdmin, getAllUsers);
router.put("/:userId/balance", requireAuthAndAdmin, updateUserBalance);
router.put("/:id/block", requireAuthAndAdmin, blockUser); 
router.put("/:id/unblock", requireAuthAndAdmin, unblockUser); 
router.get("/search", requireAuthAndAdmin, searchUsers); 
router.get("/admin-profile", requireAuthAndAdmin, getAdmin); 
router.put("/admin/update", requireAuthAndAdmin, upload.single('img'), updateAdminProfile); 

module.exports = router;
