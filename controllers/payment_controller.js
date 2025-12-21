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

exports.createCheckoutSession = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 8% advance
    const advanceAmount = Math.round(totalAmount * 0.08);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Advance Payment (8%)",
              description: `Advance for booking (Total ₹${totalAmount})`,
            },
            unit_amount: advanceAmount * 100, // paise
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.VITE_API_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_API_URL}/booking-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ message: "Checkout session failed" });
  }
};
