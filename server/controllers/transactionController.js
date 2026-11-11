const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.deposit = async (_req, res) => {
  return res.status(200).json({ message: 'Deposit endpoint is handled by PayPal order flow.' });
};

exports.transactionHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    const transactions = await Transaction.find({ user: userId }).sort({ timestamp: -1 }).limit(10);
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
};
