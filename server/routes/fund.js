const express =require("express")
const router = express.Router()
const { requireAuth,  requireAuthAndAdmin } = require("../middlewares/requireAuth");
const { approveFundingRequest, rejectFundingRequest, addFunds, getPendingFundingRequest } = require("../controllers/fundingController");



router.post("/add", requireAuth, addFunds);
router.get("/requests", requireAuthAndAdmin, getPendingFundingRequest);
router.patch("/approve/:requestId", requireAuthAndAdmin, approveFundingRequest);
router.patch("/reject/:requestId", requireAuthAndAdmin, rejectFundingRequest);



module.exports = router