const express = require("express");
const router = express.Router();
const {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserBalance,
  blockUser,
  unblockUser,
  searchUsers
} = require("../controllers/userController");
const {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");

router.put("/:id", requireAuthAndAuthorization, updateUser);
router.delete("/:id", requireAuth, deleteUser);
router.get("/find/:id", requireAuthAndAuthorization, getUserById);
router.get("/", requireAuthAndAdmin, getAllUsers);
router.get("/:userId/balance", requireAuthAndAdmin, updateUserBalance);
router.put("/:id/block", requireAuthAndAdmin, blockUser); 
router.put("/:id/unblock", requireAuthAndAdmin, unblockUser); 
router.get("/search", requireAuthAndAdmin, searchUsers); 

module.exports = router;
