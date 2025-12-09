
const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema({
    date: {
        type: String,   // Format: YYYY-MM-DD
        required: true
    },
    slot: {
        type: [String],
        enum: ["day", "evening"],
        required: true
    }
}, { _id: false });

const ProviderAvailabilitySchema = new mongoose.Schema({
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "providers",
        required: true,
        unique: true
    },
    availability: {
        type: [AvailabilitySchema],
        default: []
    }
});

module.exports = mongoose.model("provider_availabilities", ProviderAvailabilitySchema);
