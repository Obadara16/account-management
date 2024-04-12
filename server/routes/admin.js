const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer")
const {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");
const { getAdmin, updateAdmin, changePassword } = require("../controllers/adminController");


router.get("/profile", requireAuthAndAdmin, getAdmin); 
router.put("/update", requireAuthAndAdmin, upload.single('img'), updateAdmin); 
router.put("/password", requireAuthAndAdmin, changePassword);
module.exports = router;
