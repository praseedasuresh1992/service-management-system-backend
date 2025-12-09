const ProviderAvailability=require("../models/provider_availability_model")

// =======================================
// CREATE OR UPDATE PROVIDER AVAILABILITY
// =======================================

exports.createAvailability = async (req, res) => {
    try {
        // provider_id comes from cookie-auth middleware
        const provider_id = req.user?.id;
        const { availability } = req.body;

        // ==========================
        // Basic validations
        // ==========================
        if (!provider_id) {
            return res.status(401).json({
                message: "Unauthorized: Provider ID not found in cookie"
            });
        }

        if (!availability || !Array.isArray(availability) || availability.length === 0) {
            return res.status(400).json({
                message: "Availability array is required"
            });
        }

        // ==========================
        // Reject duplicates INSIDE request itself
        // ==========================
        const requestCheck = new Set();

        for (let item of availability) {
            if (!item.date || !item.slot) {
                return res.status(400).json({
                    message: "Each availability entry must contain date and slot"
                });
            }

            const key = `${item.date}-${item.slot}`;

            if (requestCheck.has(key)) {
                return res.status(400).json({
                    message: `Duplicate slot in request: ${item.date} - ${item.slot}`
                });
            }

            requestCheck.add(key);
        }

        // ==========================
        // Find existing availability
        // ==========================
        let existing = await ProviderAvailability.findOne({ provider_id });

        if (!existing) {
            // ==========================
            // Create availability for first time
            // ==========================
            const newData = new ProviderAvailability({
                provider_id,
                availability
            });

            await newData.save();

            return res.status(201).json({
                message: "Availability created successfully",
                data: newData
            });
        }

        // ==========================
        // Merge existing + new availability
        // ==========================
        const merged = [...existing.availability];

        // Add new items but avoid duplicates in DB
        availability.forEach(item => {
            const exists = merged.some(
                m => m.date === item.date && m.slot === item.slot
            );

            if (!exists) {
                merged.push(item);
            }
        });

        existing.availability = merged;
        await existing.save();

        return res.status(200).json({
            message: "Availability updated successfully",
            data: existing
        });

    } catch (error) {
        console.error("Availability Error:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
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
// ==========================
// DELETE AVAILABILITY SLOT
// ==========================
exports.deleteAvailabilitySlot = async (req, res) => {
    try {
        const { provider_id, date, slot } = req.body;

        if (!provider_id || !date || !slot) {
            return res.status(400).json({
                message: "provider_id, date and slot are required"
            });
        }

        const provider = await ProviderAvailability.findOne({ provider_id });

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        const beforeCount = provider.availability.length;

        provider.availability = provider.availability.filter(
            (item) => !(item.date === date && item.slot === slot)
        );

        if (provider.availability.length === beforeCount) {
            return res.status(400).json({ 
                message: "No matching slot found to delete" 
            });
        }

        await provider.save();

        res.json({
            message: "Availability slot removed successfully",
            data: provider
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ==========================
// FILTER PROVIDER BY AVAILABILITY
// ==========================
exports.filterProvidersByAvailability = async (req, res) => {
    try {
        const { needs } = req.body;

        if (!needs || needs.length === 0) {
            return res.status(400).json({ message: "needs array is required" });
        }

        // Find providers whose availability contains ALL date-slot pairs
        const providers = await ProviderAvailability.find({
            availability: {
                $all: needs.map(item => ({
                    $elemMatch: { date: item.date, slot: item.slot }
                }))
            }
        }).populate("provider_id");

        res.json({
            message: "Providers fetched successfully",
            count: providers.length,
            data: providers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
 
