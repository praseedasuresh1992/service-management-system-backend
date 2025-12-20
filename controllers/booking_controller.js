const bookingmodel=require("../models/bookingmodel")
const ServiceCategory = require("../models/service_category_model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ============calculate the amount===============
exports.calculateBookingAmount = async (req, res) => {
  try {
    const { category_id, booking_dates } = req.body;

    if (!category_id || !Array.isArray(booking_dates) || booking_dates.length === 0) {
      return res.status(400).json({
        message: "Category and booking dates are required"
      });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category) {
      return res.status(404).json({ message: "Service category not found" });
    }

    if (!category.basic_amount) {
      return res.status(400).json({
        message: "Pricing not configured for this category"
      });
    }

    let total_amount = 0;

    booking_dates.forEach(item => {
      const slot = item.slot || item.availability_type;

      if (!item.date || !slot) {
        throw new Error("Invalid booking_dates format");
      }

      if (!["full_day", "half_day"].includes(slot)) {
        throw new Error("Invalid slot value");
      }

      total_amount +=
        slot === "full_day"
          ? category.basic_amount.full_day
          : category.basic_amount.half_day;
    });

    res.status(200).json({
      message: "Amount calculated successfully",
      total_amount
    });

  } catch (error) {
    console.error("Amount calculation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =========create booking=================
exports.createBookingAfterPayment = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { provider_id, category_id, booking_dates, location, payment_id } = req.body;

    if (!provider_id || !category_id || !booking_dates || !payment_id || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_id);

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category || !category.basic_amount) {
      return res.status(400).json({ message: "Category pricing missing" });
    }

    let total_amount = 0;

    const formattedDates = booking_dates.map(item => {
      const slot = item.slot || item.availability_type;

      if (!["full_day", "half_day"].includes(slot)) {
        throw new Error("Invalid slot value");
      }

      total_amount +=
        slot === "full_day"
          ? category.basic_amount.full_day
          : category.basic_amount.half_day;

      return {
        date: new Date(item.date),
        slot
      };
    });

    if (paymentIntent.amount !== total_amount * 100) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    const booking = await bookingmodel.create({
      user_id,
      provider_id,
      category_id,
      booking_dates: formattedDates,
      location,
      total_amount,
      payment_id,
      payment_status: "paid",
      status: "confirmed"
    });

    res.status(201).json({
      message: "Booking created successfully",
      data: booking
    });

  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ===============view booking=================
exports.getAllBookings = async (req, res) => {
  try {
    console.log("view booking")
    const bookings = await bookingmodel.find()
      .populate("user_id")
      .populate("provider_id")
      .populate("category_id")

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================================
// VIEW ALL BOOKINGS OF LOGGED-IN USER
// =======================================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await bookingmodel.find({ user_id: userId })
      .populate("provider_id", "-password")
      .populate("category_id")
      .sort({ createdAt: -1 });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json({
      message: "Bookings fetched successfully",
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
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

exports.deleteBooking = async (req, res) => {
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
