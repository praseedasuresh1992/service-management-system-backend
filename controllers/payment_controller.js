const Payment = require('../models/payment_model');

// ===============================
// CREATE PAYMENT
// ===============================
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// GET ALL PAYMENTS
// ===============================
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking_id")
      .populate("user_id")
      .populate("provider_id");

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// GET PAYMENT BY ID
// ===============================
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking_id")
      .populate("user_id")
      .populate("provider_id");

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({ success: true, data: payment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// UPDATE PAYMENT
// ===============================
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    res.status(200).json({
      success: true,
      message: "Payment updated",
      data: payment
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

