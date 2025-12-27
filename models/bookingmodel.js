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
        date: { type: Date, required: true },
        slot: {
          type: String,
          enum: ["full_day", "half_day"],
          required: true,
        },
      },
    ],

    location: { type: String, required: true },

    total_amount: { type: Number, required: true },

    stripe_session_id: {
      type: String,
      required: true,
      unique: true,
    },

    advance_paid: { type: Number, required: true },

    payment_status: {
      type: String,
      enum: ["pending", "advance_paid", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected"],
      default: "pending",
    },

    rejection_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookings", bookingSchema);
