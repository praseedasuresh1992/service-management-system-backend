const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment_controller');
const auth = require("../middleware/auth");


router.post(
  "/create-payment-intent",
  auth.authuser,
  paymentController.createPaymentIntent
);

module.exports = router;