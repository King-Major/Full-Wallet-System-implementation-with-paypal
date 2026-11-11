const paypal = require('@paypal/checkout-server-sdk');

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

function createEnvironment() {
  const clientId = requireEnv('PAYPAL_CLIENT_ID');
  const clientSecret = requireEnv('PAYPAL_CLIENT_SECRET');
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function createClient() {
  return new paypal.core.PayPalHttpClient(createEnvironment());
}

module.exports = { createClient };
