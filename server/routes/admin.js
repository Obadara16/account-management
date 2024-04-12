const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer")
const {
  requireAuth,
  requireAuthAndAuthorization,
  requireAuthAndAdmin,
} = require("../middlewares/requireAuth");
const { getAdmin, updateAdmin, changePassword, getAdminDashboardData } = require("../controllers/adminController");


router.get("/profile", requireAuthAndAdmin, getAdmin); 
router.put("/update", requireAuthAndAdmin, upload.single('img'), updateAdmin); 
router.put("/password", requireAuthAndAdmin, changePassword);


router.get("/dashboard", requireAuthAndAdmin, async (req, res) => {
  try {
    const dashboardData = await getAdminDashboardData();
    res.status(200).json({ status_code: 200, status: "success", data: dashboardData });
  } catch (error) {
    res.status(500).json({ status_code: 500, status: "error", error: error.message });
  }
});
module.exports = router;
