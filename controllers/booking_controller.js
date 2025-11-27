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

// view booking
exports.getAllBookings = async (req, res) => {
  try {
    console.log("view booking")
    const bookings = await bookingmodel.find()
      .populate("user_id")
      .populate("provider_id")
      .populate("category_id");

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatus = ["pending", "accepted", "completed", "cancelled"];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        const booking = await bookingmodel.findByIdAndUpdate(
           id,
            { status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: "Status updated successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};
// update booking Details

exports.updateBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_datetime, end_datetime, location } = req.body;

        const updateData = {};

        if (start_datetime) updateData.start_datetime = start_datetime;
        if (end_datetime) updateData.end_datetime = end_datetime;
        if (location) updateData.location = location;

        const booking = await bookingmodel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            message: "Booking details updated successfully",
            booking
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

// filter based on category and status
exports.getFilteredBookings = async (req, res) => {
    try {
        const { status, category_id } = req.query;

        let filter = {};

        if (status) {
            filter.status = status;
        }

        if (category_id) {
            filter.category_id = category_id;
        }

        const bookings = await bookingmodel.find(filter)
            .populate("user_id")
            .populate("provider_id")
            .populate("category_id");

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "No bookings found"
            });
        }

        res.status(200).json({
            message: "Bookings fetched successfully",
            count: bookings.length,
            bookings
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error
        });
    }
};
// Delete a booking if the provider not accepted the booking(if Status is pending)

exports.deletePendingBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Find booking
        const booking = await bookingmodel.findById(id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Check if status is pending
        if (booking.status !== "pending") {
            return res.status(400).json({
                message: `Cannot delete booking. Current status is '${booking.status}', only 'pending' bookings can be deleted`
            });
        }

        // Delete booking
        await bookingmodel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error
        });
    }
};
