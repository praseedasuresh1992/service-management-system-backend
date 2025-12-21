const bookingmodel = require("../models/bookingmodel");
const ServiceCategory = require("../models/service_category_model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ================= CALCULATE TOTAL AMOUNT ================= */
exports.calculateBookingAmount = async (req, res) => {
  try {
    const { category_id, booking_dates } = req.body;

    if (!category_id || !Array.isArray(booking_dates) || !booking_dates.length) {
      return res.status(400).json({ message: "Category and booking dates required" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category || !category.basic_amount) {
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

/* ================= CREATE BOOKING AFTER CHECKOUT ================= */
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

    if (
      !provider_id ||
      !category_id ||
      !Array.isArray(booking_dates) ||
      !booking_dates.length ||
      !location ||
      !session_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    /* 🔐 Verify Checkout Session */
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category || !category.basic_amount) {
      return res.status(400).json({ message: "Category pricing missing" });
    }

    /* 🔢 Recalculate total amount (server-side trust only) */
    let total_amount = 0;

    const formattedDates = booking_dates.map(item => {
      const slot = item.slot || item.availability_type;

      if (!["full_day", "half_day"].includes(slot)) {
        throw new Error("Invalid slot");
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

    /* 🔒 Validate advance (8%) */
    const expectedAdvance = Math.round(total_amount * 0.08 * 100);

    if (session.amount_total !== expectedAdvance) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    /* 🧾 Create booking */
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

/* ================= OTHER CONTROLLERS (UNCHANGED) ================= */

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "accepted", "completed", "cancelled"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await bookingmodel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Status updated successfully", booking });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.updateBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_datetime, end_datetime, location } = req.body;

    const updateData = {};
    if (start_datetime) updateData.start_datetime = start_datetime;
    if (end_datetime) updateData.end_datetime = end_datetime;
    if (location) updateData.location = location;

    const booking = await bookingmodel.findByIdAndUpdate(id, updateData, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking details updated", booking });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getFilteredBookings = async (req, res) => {
  try {
    const { status, category_id } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category_id) filter.category_id = category_id;

    const bookings = await bookingmodel
      .find(filter)
      .populate("user_id provider_id category_id");

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    res.status(200).json({ count: bookings.length, bookings });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await bookingmodel.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Cannot delete booking with status '${booking.status}'`
      });
    }

    await bookingmodel.findByIdAndDelete(id);
    res.status(200).json({ message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getBookingsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const bookings = await bookingmodel.find({
      provider_id: providerId,
      status: { $ne: "cancelled" }
    });

    res.status(200).json({ success: true, data: bookings });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch provider bookings" });
  }
};
