const User = require('../models/user');
const Transaction = require('../models/Transaction');

exports.deposit = async (req, res) => {
    // You might not need this for the PayPal integration.
};

exports.transactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.userId }); // Change to user
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};
