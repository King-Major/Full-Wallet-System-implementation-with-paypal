const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    recipient: { type: String },
    description: { type: String, required: true },
    status: { type: String, required: true },
    paypalPayoutId: { type: String },
    timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transaction', transactionSchema);
