const express =require("express")
const router = express.Router()
const {createTransaction, getTransactionById, getTransactionsByUserId} = require('../controllers/transactionController')
const { requireAuth,  requireAuthAndAdmin } = require("../middlewares/requireAuth");



router.post('/', requireAuth, createTransaction)
router.get('/:transactionId', requireAuth, getTransactionById)
router.get('/:userId/transactions', requireAuth, getTransactionsByUserId)


module.exports = router