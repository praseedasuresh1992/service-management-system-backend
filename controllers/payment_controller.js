const stripe = require("../config/stripe");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "Amount required" });
    }

    // 8% advance payment
    const advanceAmount = Math.round(totalAmount * 0.08 * 100); // paise/cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: advanceAmount,
      currency: "inr",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      advanceAmount: advanceAmount / 100
    });

  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};
