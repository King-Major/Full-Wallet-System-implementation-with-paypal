const express = require('express');
const { deposit, transactionHistory } = require('../controllers/transactionController');
const { createPaypalOrder, capturePaypalPayment } = require('../controllers/paypalController');
const { verifyToken } = require('../middleware/authMiddleware');
const paypalController = require('../controllers/paypalController');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/paypal/deposit', verifyToken, createPaypalOrder); // For creating a PayPal order
router.post('/paypal/capture', verifyToken, capturePaypalPayment); // For capturing the payment
router.get('/history', verifyToken, transactionHistory); // For fetching transaction history
router.post('/payout', auth, paypalController.sendMoney);
router.get('/payout/:payoutId/status', auth, paypalController.getPayoutStatus);
router.get('/history', auth, paypalController.getTransactionHistory);


module.exports = router;
