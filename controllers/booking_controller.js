const bookingmodel=require("../models/bookingmodel")
const ServiceCategory = require("../models/service_category_model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


// ================= CALCULATE TOTAL AMOUNT =================
exports.calculateBookingAmount = async (req, res) => {
  try {
    const { category_id, booking_dates } = req.body;

    if (!category_id || !booking_dates?.length) {
      return res.status(400).json({ message: "Category and booking dates required" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category?.basic_amount) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    let total_amount = 0;

    booking_dates.forEach(item => {
      const slot = item.slot || item.availability_type;
      if (slot === "full_day") total_amount += category.basic_amount.full_day;
      if (slot === "half_day") total_amount += category.basic_amount.half_day;
    });

    res.status(200).json({
      total_amount,
      advance_amount: Math.round(total_amount * 0.08)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CREATE BOOKING AFTER CHECKOUT =================
exports.createBookingAfterCheckout = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      provider_id,
      category_id,
      booking_dates,
      location,
      session_id
    } = req.body;

    if (!session_id) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // 🔐 Verify Checkout Session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category?.basic_amount) {
      return res.status(400).json({ message: "Category pricing missing" });
    }

    // 🔢 Calculate total amount again (server trust only)
    let total_amount = 0;
    const formattedDates = booking_dates.map(item => {
      const slot = item.slot || item.availability_type;
      if (slot === "full_day") total_amount += category.basic_amount.full_day;
      if (slot === "half_day") total_amount += category.basic_amount.half_day;
      return { date: new Date(item.date), slot };
    });

    const expectedAdvance = Math.round(total_amount * 0.08 * 100);

    // 🔒 Amount verification
    if (session.amount_total !== expectedAdvance) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    // 🧾 Create Booking
    const booking = await bookingmodel.create({
      user_id,
      provider_id,
      category_id,
      booking_dates: formattedDates,
      location,
      total_amount,
      advance_paid: expectedAdvance / 100,
      stripe_session_id: session_id,
      payment_status: "advance_paid",
      status: "confirmed"
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message });
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
// ===========disable already bookeddates=======
exports.getBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const bookings = await bookingmodel.find({
      provider_id: providerId,
      status: { $ne: "cancelled" }
    });

    if (!bookings.length) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error("Provider bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider bookings"
    });
  }
};
