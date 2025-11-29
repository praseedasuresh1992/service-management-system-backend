const mongoose = require('mongoose');

const provider_availability_schema = new mongoose.Schema({

    provider_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "providers", 
        required: true 
    },

    availability: [
        {
            available_date: { type: Date, required: true },
            available_time: { type: Date, required: true }
        }
    ]

}, { timestamps: true });

const provider_availability = mongoose.model('provider_availability', provider_availability_schema);

module.exports = provider_availability;
