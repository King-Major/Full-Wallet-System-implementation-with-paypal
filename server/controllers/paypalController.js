const { createClient } = require('../config/paypalClient');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const paypal = require('@paypal/checkout-server-sdk');

const getUserId = (req) => req.userId || req.user?.id || req.user?._id;

const createPaypalOrderRequest = (amount) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{ amount: { currency_code: 'USD', value: String(amount) } }],
  });
  return request;
};

exports.createPaypalOrder = async (req, res) => {
  try {
    const { amount } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const paypalClient = createClient();
    const request = createPaypalOrderRequest(amount);
    const order = await paypalClient.execute(request);
    const approvalUrl = order.result.links.find((link) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return res.status(502).json({ message: 'PayPal approval URL unavailable' });
    }

    return res.json({ id: order.result.id, approvalUrl });
  } catch (error) {
    console.error('Failed to create PayPal order:', error.response || error);
    return res.status(500).json({ message: 'Failed to create PayPal order', error: error.message });
  }
};

exports.capturePaypalPayment = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const userId = getUserId(req);

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const paypalClient = createClient();
    const capture = await paypalClient.execute(request);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const capturedAmount = Number(capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0);
    if (capturedAmount <= 0) {
      return res.status(400).json({ message: 'Captured amount is invalid' });
    }

    user.balance = Number(user.balance || 0) + capturedAmount;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: 'deposit',
      amount: capturedAmount,
      description: 'Deposit via PayPal',
      status: 'completed',
      timestamp: new Date(),
    });
    await transaction.save();

    return res.json({ success: true, newBalance: user.balance, transaction });
  } catch (error) {
    console.error('Failed to capture PayPal payment:', error.response || error);
    return res.status(500).json({ message: 'Failed to capture PayPal payment', error: error.message });
  }
};

exports.sendMoney = async (req, res) => {
  try {
    const { recipientEmail, amount } = req.body || {};
    const userId = getUserId(req);

    if (!recipientEmail || !amount) {
      return res.status(400).json({ success: false, message: 'Recipient email and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    if ((Number(user.balance) || 0) < parsedAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: `Payout_${Date.now()}`,
        email_subject: 'You have received a payment!',
        email_message: 'You received a payment through our platform!',
      },
      items: [{
        recipient_type: 'EMAIL',
        amount: {
          value: parsedAmount.toFixed(2),
          currency: 'USD',
        },
        receiver: recipientEmail,
        note: 'Payment from platform user',
        sender_item_id: `Item_${Date.now()}`,
      }],
    });

    const client = createClient();
    const response = await client.execute(request);

    if (response.statusCode !== 201) {
      throw new Error('PayPal payout failed');
    }

    user.balance = Number(user.balance) - parsedAmount;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: 'payout',
      amount: -parsedAmount,
      recipient: recipientEmail,
      description: `Payment sent to ${recipientEmail}`,
      status: 'completed',
      paypalPayoutId: response.result.batch_header.payout_batch_id,
      timestamp: new Date(),
    });
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: 'Payment sent successfully',
      payoutId: response.result.batch_header.payout_batch_id,
      newBalance: user.balance,
      transaction,
    });
  } catch (error) {
    console.error('Payout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message,
    });
  }
};

exports.getPayoutStatus = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const request = new paypal.payouts.PayoutsGetRequest(payoutId);
    const response = await createClient().execute(request);

    return res.json({
      success: true,
      status: response.result.batch_header.batch_status,
      details: response.result,
    });
  } catch (error) {
    console.error('Failed to get payout status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payout status',
      error: error.message,
    });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const transactions = await Transaction.find({ user: userId }).sort({ timestamp: -1 }).limit(10);
    return res.json(transactions);
  } catch (error) {
    console.error('Transaction history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message,
    });
  }
};
