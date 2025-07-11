// server/razorpay.js

const Razorpay = require("razorpay");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order with UPI as payment method
async function createRazorpayOrder(amount) {
  const options = {
    amount: amount * 100, // in paisa
    currency: "INR",
    payment_capture: 1,
    method: "upi",
  };

  const order = await razorpay.orders.create(options);
  return order;
}

module.exports = createRazorpayOrder;
