const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String, required: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    accountNumber: { type: String, unique: true } // You can generate this during registration
});

module.exports = mongoose.model('User', userSchema);
