const express =require("express")
const router = express.Router()
const {forgotPassword, verifyOTP, resetPassword, refreshToken, changePassword, requestNewOTP} = require('../controllers/authController')
const {userRegister, userLogin} = require('../controllers/userAuthController');
const {adminLogin, adminRegister} = require('../controllers/adminAuthController');
const {requireAuthAndAuthorization} = require("../middlewares/requireAuth")

router.post('/register/user', userRegister);
router.post('/login/user', userLogin);
router.post('/register/admin', adminRegister);
router.post('/login/admin', adminLogin);
router.post('/refresh-token', refreshToken)
router.post('/verify-otp', verifyOTP)
router.post('/request-otp', requestNewOTP)
router.put('/reset-new-password/:resetToken', resetPassword);
router.post('/forgot-password', forgotPassword);
router.put('/:id/change-password', requireAuthAndAuthorization ,changePassword)



module.exports = router