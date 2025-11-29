const ProviderAvailability = require("../models/provider_availability_model");

// ==========================
// CREATE AVAILABILITY
// ==========================

exports.createAvailability = async (req, res) => {
    try {
        const { provider_id, availability } = req.body;

        if (!provider_id ) {
            return res.status(400).json({ 
                message: "provider_id is required" 
            });
        }
        if ( !availability || availability.length === 0) {
            return res.status(400).json({ 
                message: "provider is not available " 
            });
        }

        const newAvailability = await ProviderAvailability.create({
            provider_id,
            availability
        });

        res.status(201).json({
            message: "Availability slots created successfully",
            data: newAvailability
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================
// UPDATE AVAILABILITY BY ID
// ==========================
exports.updateAvailabilitySlot = async (req, res) => {
    try {
        const { provider_id, slot_id } = req.params;
        const { available_date, available_time } = req.body;

        const updatedData = await ProviderAvailability.findOneAndUpdate(
            { provider_id, "availability._id": slot_id },
            {
                $set: {
                    "availability.$.available_date": available_date,
                    "availability.$.available_time": available_time
                }
            },
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({ message: "Slot not found" });
        }

        res.status(200).json({
            message: "Availability slot updated",
            data: updatedData
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================
// VIEW AVAILABILITY BY ID
// ==========================
exports.getProviderAvailabity = async (req, res) => {
    try {
        const { provider_id } = req.params;

        const data = await ProviderAvailability.findOne({ provider_id })
            .populate("provider_id");

        if (!data) {
            return res.status(404).json({ message: "No availability found" });
        }

        res.status(200).json({
            message: "Availability fetched",
            data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
