const paypal = require('@paypal/checkout-server-sdk');

function createEnvironment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    console.log('Sandbox Client ID:', clientId); // Check if correct
    console.log('Sandbox Client Secret:', clientSecret); // Check if correct

    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function createClient() {
    return new paypal.core.PayPalHttpClient(createEnvironment());
}

module.exports = { createClient };
