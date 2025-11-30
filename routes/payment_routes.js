const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment_controller');

// Create
router.post('/createpayment', paymentController.createPayment);

// Read
router.get('/viewallpayment', paymentController.getAllPayments);
router.get('/viewpayment/:id', paymentController.getPaymentById);

// Update
router.put('/updatepayment/:id', paymentController.updatePayment);


module.exports = router;
