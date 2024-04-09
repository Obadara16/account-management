const express = require("express");
const router = express.Router();
const {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  updateUserBalance,
} = require("../controllers/userController");
const {
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");

router.put("/:id", requireAuthAndAuthorization, updateUser);
router.delete("/:id", requireAuthAndAuthorization, deleteUser);
router.get("/find/:id", requireAuthAndAuthorization, getUserById);
router.get("/", requireAuthAndAdmin, getAllUsers);
router.get("/:userId/balance", requireAuthAndAdmin, updateUserBalance);

module.exports = router;
