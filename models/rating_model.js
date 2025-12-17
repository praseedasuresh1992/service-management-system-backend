const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
      unique: true // ⭐ one rating per booking
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "providers",
      required: true
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service_category",
      required: true
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    feedback: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ratings", ratingSchema);
