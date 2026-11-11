const express = require('express');
const { deposit, transactionHistory } = require('../controllers/transactionController');
const { createPaypalOrder, capturePaypalPayment, sendMoney, getPayoutStatus, getTransactionHistory } = require('../controllers/paypalController');
const { verifyToken } = require('../middleware/authMiddleware');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/paypal/deposit', verifyToken, createPaypalOrder);
router.post('/paypal/capture', verifyToken, capturePaypalPayment);
router.get('/history', verifyToken, transactionHistory);
router.post('/payout', auth, sendMoney);
router.get('/payout/:payoutId/status', auth, getPayoutStatus);
router.get('/history-list', auth, getTransactionHistory);

module.exports = router;
