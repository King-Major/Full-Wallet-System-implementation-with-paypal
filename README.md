# Full Wallet System

A full-stack wallet application with user authentication and PayPal integration for deposits and payouts.

## Features
- User registration and login
- JWT-based authentication
- PayPal order creation and capture flow
- Wallet balance tracking
- Transaction history
- React dashboard UI

## Tech stack
- Frontend: React, React Router, Axios, Tailwind CSS, MUI
- Backend: Node.js, Express, MongoDB, Mongoose
- Payments: PayPal Checkout SDK

## Prerequisites
- Node.js 18+
- MongoDB instance running locally or in the cloud
- PayPal Sandbox credentials

## Environment setup
Create a `.env` file in `server/` with the following values:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=change-this-secret
MONGODB_URI=mongodb://127.0.0.1:27017/fullwallet
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## Run locally

```bash
cd server
npm install
npm start
```

In a second terminal:

```bash
cd client
npm install
npm start
```

## Project structure

```text
client/    React frontend
server/    Express API and MongoDB models
```

## Notes
This is a working prototype intended for local development and sandbox testing. For production, use secure secrets, a production MongoDB instance, proper deployment configuration, and environment-specific PayPal credentials.
