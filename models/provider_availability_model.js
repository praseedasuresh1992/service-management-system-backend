const mongoose = require("mongoose");

/**
 * Availability per day
 */
const DailyAvailabilitySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    availability_type: {
      type: String,
      enum: ["full_day", "half_day"],
      required: true
    },

    is_available: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

/**
 * Provider availability master
 */
const ProviderAvailabilitySchema = new mongoose.Schema(
  {
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "providers",
      required: true,
      unique: true
    },

    availability: {
      type: [DailyAvailabilitySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "provider_availabilities",
  ProviderAvailabilitySchema
);
