const { createClient } = require('../config/paypalClient'); // Adjust the path if necessary
const User = require('../models/user');
const Transaction = require('../models/Transaction');
const paypal = require('@paypal/checkout-server-sdk');

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
let environment;
if (process.env.NODE_ENV === 'production') {
    environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
} else {
    environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
}
const client = new paypal.core.PayPalHttpClient(environment);




exports.createPaypalOrder = async (req, res) => {
    const { amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: amount.toString() } }],
    });

    const paypalClient = createClient(); // Create a new client instance

    try {
        const order = await paypalClient.execute(request);
        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href; // Get approval URL
        res.json({ id: order.result.id, approvalUrl }); // Send both order ID and approval URL to frontend
    } catch (error) {
        console.error('Failed to create PayPal order:', error.response ? error.response : error);
        res.status(500).json({ message: 'Failed to create PayPal order' });
    }
};

exports.capturePaypalPayment = async (req, res) => {
    const { orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const paypalClient = createClient(); // Create a new client instance

    try {
        const capture = await paypalClient.execute(request);
        const user = await User.findById(req.userId);
        
        user.balance += parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value);
        await user.save();

        const transaction = new Transaction({
            user: user._id,
            amount: parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value),
            description: 'Deposit via PayPal',
        });
        await transaction.save();

        res.json({ newBalance: user.balance });
    } catch (error) {
        console.error('Failed to capture PayPal payment:', error.response ? error.response : error);
        res.status(500).json({ message: 'Failed to capture PayPal payment' });
    }
};

// exports.sendMoney = async (req, res) => {
//     const { recipientEmail, amount } = req.body;
//     const user = await User.findById(req.userId);

//     // Check if user has sufficient balance
//     if (user.balance < amount) {
//         return res.status(400).json({ message: 'Insufficient balance' });
//     }

//     const request = new paypal.payouts.PayoutsPostRequest();
//     request.requestBody({
//         sender_batch_header: {
//             sender_batch_id: `Payout_${Date.now()}`,
//             email_subject: 'You received a payment',
//             email_message: 'You received a payment from our platform'
//         },
//         items: [{
//             recipient_type: 'EMAIL',
//             amount: {
//                 value: amount,
//                 currency: 'USD'
//             },
//             receiver: recipientEmail,
//             note: 'Payment from dashboard',
//             sender_item_id: `Item_${Date.now()}`
//         }]
//     });

//     const paypalClient = createClient();

//     try {
//         // Execute payout
//         const payout = await paypalClient.execute(request);

//         // Update user balance
//         user.balance -= amount;
//         await user.save();

//         // Create transaction record
//         const transaction = new Transaction({
//             userId: user._id,
//             amount: -amount, // Negative amount for outgoing payment
//             description: `Payout to ${recipientEmail}`,
//             paypalPayoutId: payout.result.batch_header.payout_batch_id
//         });
//         await transaction.save();

//         res.json({
//             success: true,
//             newBalance: user.balance,
//             payoutId: payout.result.batch_header.payout_batch_id
//         });
//     } catch (error) {
//         console.error('Failed to process payout:', error.response ? error.response : error);
//         res.status(500).json({ message: 'Failed to process payout' });
//     }
// };

// Add a route to check payout status
exports.sendMoney = async (req, res) => {
    try {
        const { recipientEmail, amount } = req.body;
        
        if (!recipientEmail || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Recipient email and amount are required'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const parsedAmount = parseFloat(amount);
        if (user.balance < parsedAmount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        const request = new paypal.payouts.PayoutsPostRequest();
        request.requestBody({
            sender_batch_header: {
                sender_batch_id: `Payout_${Date.now()}`,
                email_subject: "You have received a payment!",
                email_message: "You received a payment through our platform!"
            },
            items: [{
                recipient_type: "EMAIL",
                amount: {
                    value: parsedAmount.toFixed(2),
                    currency: "USD"
                },
                receiver: recipientEmail,
                note: "Payment from platform user",
                sender_item_id: `Item_${Date.now()}`
            }]
        });

        const response = await client.execute(request);
        
        if (response.statusCode === 201) {
            // Update user balance
            user.balance -= parsedAmount;
            await user.save();

            // Create transaction record
            const transaction = new Transaction({
                user: user._id,
                type: 'payout',
                amount: -parsedAmount, // Negative for outgoing payment
                recipient: recipientEmail,
                description: `Payment sent to ${recipientEmail}`,
                status: 'completed',
                paypalPayoutId: response.result.batch_header.payout_batch_id,
                timestamp: new Date()
            });
            await transaction.save();

            return res.status(200).json({
                success: true,
                message: 'Payment sent successfully',
                payoutId: response.result.batch_header.payout_batch_id,
                newBalance: user.balance,
                transaction: transaction
            });
        } else {
            throw new Error('PayPal payout failed');
        }

    } catch (error) {
        console.error('Payout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process payment',
            error: error.message
        });
    }
};

exports.getPayoutStatus = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const request = new paypal.payouts.PayoutsGetRequest(payoutId);
        const response = await client.execute(request);
        
        res.json({
            success: true,
            status: response.result.batch_header.batch_status,
            details: response.result
        });
    } catch (error) {
        console.error('Failed to get payout status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payout status'
        });
    }
};

exports.getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ timestamp: -1 })
            .limit(10);
            
        res.json(transactions);
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history'
        });
    }
};

