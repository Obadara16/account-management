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
  changePassword
} = require("../controllers/userController");
const {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");
const { getUserBalance } = require("../controllers/fundingController");

router.put("/:id", requireAuthAndAuthorization, upload.single('img'), updateUser);
router.delete("/:id", requireAuth, deleteUser);
router.get("/find/:id", requireAuthAndAuthorization, getUserById);
router.get("/", requireAuthAndAdmin, getAllUsers);
router.put("/:userId/balance", requireAuthAndAdmin, updateUserBalance);
router.put("/:id/block", requireAuthAndAdmin, blockUser); 
router.put("/:id/unblock", requireAuthAndAdmin, unblockUser); 
router.get("/search", requireAuthAndAdmin, searchUsers); 
router.put("/:id/password", requireAuthAndAuthorization, changePassword);



router.get("/balance", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const balance = await getUserBalance(userId);
    res.status(200).json({ status_code: 200, status: "success", balance });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
});


module.exports = router;
