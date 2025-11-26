const bookingmodel=require("../models/bookingmodel")

exports.createBooking = async (req, res) => {
    try {
        const {
            user_id,
            provider_id,
            category_id,
            start_datetime,
            end_datetime,
            location,
            amount
        } = req.body;

        // Validate required fields
        if (
            !user_id ||
            !provider_id ||
            !category_id ||
            !start_datetime ||
            !end_datetime ||
            !location ||
            !amount
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if end time is after start time
        if (new Date(end_datetime) <= new Date(start_datetime)) {
            return res.status(400).json({
                message: "please recheck and confirm the date"
            });
        }

        // Create booking
        const newBooking = await bookingmodel.create({
            user_id,
            provider_id,
            category_id,
            start_datetime,
            end_datetime,
            location,
            amount
        });

        return res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (error) {
        console.error("Booking creation error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


