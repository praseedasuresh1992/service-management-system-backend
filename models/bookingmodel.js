const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "providers",
      required: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service_category",
      required: true,
    },

    booking_dates: [
      {
        date: {
          type: Date,
          required: true,
        },
        slot: {
          type: String,
          enum: ["full_day", "half_day"],
          required: true,
        },
      },
    ],

    location: {
      type: String,
      required: true,
    },

    total_amount: {
      type: Number,
      required: true,
    },

    // payment info
    payment_id: {
      type: String, // store Stripe payment ID
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled", "confirmed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookings", bookingSchema);
