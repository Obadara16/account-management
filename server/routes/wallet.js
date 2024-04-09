const express =require("express")
const router = express.Router()
const {getWalletBalance, addFunds, withdrawFunds, updateWalletBalance} = require('../controllers/walletController')
const { requireAuth,  requireAuthAndAdmin } = require("../middlewares/requireAuth");



router.get('/:userId', requireAuth, getWalletBalance);
router.post('/add', requireAuth, addFunds);
router.post('/withdraw', requireAuth, withdrawFunds);
router.post('/update', requireAuth, updateWalletBalance);



module.exports = router