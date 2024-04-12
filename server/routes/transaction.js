const express = require("express");
const router = express.Router();
const {
  getTransactionById,
  getTransactionsByUserId,
  getAllTransactions
} = require("../controllers/transactionController");
const { requireAuthAndAuthorization, requireAuthAndAdmin } = require("../middlewares/requireAuth");

router.get("/:id/:transactionId", requireAuthAndAuthorization, getTransactionById);
router.get("/find/user/:id", requireAuthAndAuthorization, getTransactionsByUserId);
router.get("/", requireAuthAndAdmin, getAllTransactions);

module.exports = router;
