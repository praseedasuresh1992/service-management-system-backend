const ProviderAvailability=require("../models/provider_availability_model")

// =======================================
// CREATE OR UPDATE PROVIDER AVAILABILITY
// =======================================
exports.createAvailability = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { availability } = req.body;

    if (!Array.isArray(availability) || !availability.length) {
      return res.status(400).json({ message: "availability array required" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const seen = new Set();

    for (const item of availability) {
      if (
        !item.date ||
        !dateRegex.test(item.date) ||
        !["full_day", "half_day"].includes(item.availability_type)
      ) {
        return res.status(400).json({ message: "Invalid availability format" });
      }

      const key = `${item.date}-${item.availability_type}`;
      if (seen.has(key)) {
        return res.status(400).json({ message: "Duplicate availability entry" });
      }
      seen.add(key);
    }

    let doc = await ProviderAvailability.findOne({ provider_id });

    if (!doc) {
      doc = await ProviderAvailability.create({ provider_id, availability });
    } else {
      availability.forEach(item => {
        const exists = doc.availability.some(
          a =>
            a.date === item.date &&
            a.availability_type === item.availability_type
        );

        if (!exists) {
          doc.availability.push({ ...item, is_available: true });
        }
      });
      await doc.save();
    }

    res.json({ message: "Availability saved", data: doc });

  } catch (err) {
    res.status(500).json({ message: err.message });
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
 
