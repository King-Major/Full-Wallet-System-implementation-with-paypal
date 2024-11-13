import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Alert, AlertDescription } from "./components/ui/alert";

// Set default base URL for axios
axios.defaults.baseURL = "http://localhost:5000/api";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data on initial load
      axios
        .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => setUser(response.data))
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/paypal" element={<PayPalPayment />} />
      </Routes>
    </BrowserRouter>
  );
};

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", formData);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full text-blue-600 rounded-lg px-4 py-3 font-medium hover:text-blue-700"
            >
              Create new account
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/register", formData);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
                value={formData.phonenumber}
                onChange={(e) =>
                  setFormData({ ...formData, phonenumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                placeholder="********"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700"
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full text-blue-600 rounded-lg px-4 py-3 font-medium hover:text-blue-700"
            >
              Already have an account? Sign in
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [sendData, setSendData] = useState({
    recipientAccountNumber: "",
    amount: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSendMoney = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
        // Make sure the endpoint is correct
        console.log("Token:", localStorage.getItem("token"));
        const paypalResponse = await axios.post("/transactions/payout", { // Update the endpoint if needed
            recipientEmail: sendData.recipientEmail, // Ensure this is correct
            amount: parseFloat(sendData.amount) // Make sure amount is a number
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Check token retrieval
        }
      
      ); 
        

        if (paypalResponse.data.success) {
            if (paypalResponse.data.payoutId) {
                pollPayoutStatus(paypalResponse.data.payoutId);
            }

            // Update user balance and provide feedback
            setUser((prev) => ({ ...prev, balance: paypalResponse.data.newBalance }));
            setSuccess(paypalResponse.data.message);
            setSendData({ recipientEmail: "", amount: "" }); // Reset send data
            fetchTransactions(); // Fetch updated transactions
        } else {
            setError(paypalResponse.data.message); // Handle failure message from API
        }
    } catch (error) {
        console.error("Error sending money:", error); // Log error for debugging
        setError(error.response?.data?.message || "Failed to send money"); // Set error state
    } finally {
        setIsLoading(false); // Reset loading state
    }
};

  
  const pollPayoutStatus = async (payoutId) => {
    try {
      const response = await axios.get(`/transactions/payout/${payoutId}/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      if (response.data.success) {
        if (response.data.status === 'SUCCESS') {
          setSuccess('Payment completed successfully!');
          fetchTransactions();
        } else if (response.data.status === 'FAILED') {
          setError('Payment failed. Please contact support.');
        } else {
          // Continue polling if pending
          setTimeout(() => pollPayoutStatus(payoutId), 5000);
        }
      }
    } catch (err) {
      console.error('Failed to check payout status:', err);
    }
  };
  // Restored original handleDeposit function
  const handleDeposit = () => {
    window.location.href = `/paypal`;
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/transactions/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Welcome, {user.firstname}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Account Details
                </h3>
                <p className="text-blue-700">
                  Account Number: {user.accountNumber}
                </p>
                <p className="text-blue-700 text-2xl font-bold mt-2">
                  Balance: ${user.balance.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleDeposit}
                className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600"
              >
                Deposit
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSendMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient PayPal Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={sendData.recipientEmail}
                  onChange={(e) =>
                    setSendData((prev) => ({
                      ...prev,
                      recipientEmail: e.target.value,
                    }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={sendData.amount}
                  onChange={(e) =>
                    setSendData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Processing..." : "Send Money"}
              </button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className={`p-4 rounded-lg ${
                    transaction.amount > 0 ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p className="font-medium">{transaction.description}</p>
                  <p
                    className={`text-lg ${
                      transaction.amount > 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {Math.abs(transaction.amount).toFixed(2)} USD
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No transactions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const PayPalPayment = () => {
  const [inputValue, setInputValue] = useState('');

  const handlePayment = async () => {
    const response = await fetch(
      "http://localhost:5000/api/create-paypal-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: inputValue }), // Example amount
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Redirect user to PayPal approval URL
      window.location.href = data.approvalUrl;
    } else {
      console.error("Error creating PayPal order:", data);
    }
  };

  const capturePayment = async (orderId) => {
    const response = await fetch(
      "http://localhost:5000/api/capture-paypal-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Payment captured:", data);
      // Handle successful payment capture here (e.g., update UI, show message)
    } else {
      console.error("Error capturing payment:", data);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId"); // Get orderId from URL

    if (orderId) {
      capturePayment(orderId); // Call capturePayment if orderId exists
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            Pay with PayPal
          </h1>
          <p className="text-gray-500">
            Safe and secure payments powered by PayPal
          </p>
        </div>

        {/* Payment Input */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label 
              htmlFor="payment-amount" 
              className="block text-sm font-medium text-gray-700"
            >
              Payment Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="payment-amount"
                className="block w-full pl-7 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="0.00"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>

          {/* PayPal Button */}
          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg 
              className="w-6 h-6" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M20.067 8.478c.492.315.844.825.844 1.522 0 1.845-1.535 3.373-3.373 3.373h-2.774L13.522 18H9.522l1.068-5.127h-2.31l.294-1.304h2.31l.747-3.686h3.736c1.845 0 3.373 1.535 3.373 3.373 0 .697-.352 1.207-.844 1.522zm-1.62-1.522c0-.492-.402-.894-.894-.894h-2.816l-.747 3.686h2.816c.492 0 .894-.402.894-.894 0-.492-.402-.894-.894-.894h-1.62l-.294 1.304h1.62c.492 0 .894.402.894.894z"/>
            </svg>
            <span>Pay with PayPal</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-500">
          <p className="flex items-center justify-center space-x-2">
            <svg 
              className="w-4 h-4 text-gray-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure payment processing</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// export default PayPalPayment;

export default App;
