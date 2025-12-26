const bookingmodel = require("../models/bookingmodel");
const ServiceCategory = require("../models/service_category_model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ================= CALCULATE TOTAL AMOUNT ================= */
exports.calculateBookingAmount = async (req, res) => {
  try {
    const { category_id, booking_dates } = req.body;
console.log("category id",category_id)
console.log("booking date",booking_dates)

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

exports.createBookingAfterCheckout = async (req, res) => {
  try {
    const user_id = req.user.id || req.user._id;

    const {
      provider_id,
      category_id,
      booking_dates,
      location,
      session_id,
    } = req.body;

    if (
      !user_id ||
      !provider_id ||
      !category_id ||
      !Array.isArray(booking_dates) ||
      !booking_dates.length ||
      !location ||
      !session_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔐 Verify Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // ❌ Prevent duplicate booking
    const existing = await bookingmodel.findOne({
      stripe_session_id: session_id,
    });

    if (existing) {
      return res.status(400).json({ message: "Booking already created" });
    }

    const category = await ServiceCategory.findById(category_id);
    if (!category?.basic_amount) {
      return res.status(400).json({ message: "Category pricing missing" });
    }

    let total_amount = 0;

    const formattedDates = booking_dates.map((item) => {
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
        slot,
      };
    });

    // 🔢 8% advance (Stripe stores amount in paise)
    const expectedAdvance = Math.round(total_amount * 0.08 * 100);

    if (session.amount_total !== expectedAdvance) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    // 🧾 Create booking
    const booking = await bookingmodel.create({
      user_id,
      provider_id,
      category_id,
      booking_dates: formattedDates,
      location: String(location),
      total_amount,
      stripe_session_id: session_id,
      advance_paid: expectedAdvance / 100,
      payment_status: "advance_paid",
      status: "pending",
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message });
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
// ========view booking details by provider============
exports.getBookingsByProvider = async (req, res) => {
  try {
    const providerId = req.user.id; // 🔐 from token

    const bookings = await bookingmodel
      .find({
        provider_id: providerId,
        status: { $ne: "cancelled" },
      })
      .populate("user_id", "username email")
      .populate("provider_id", "name")
      .populate("category_id", "category_name")
      .select("-stripe_session_id -payment_status -advance_paid")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider bookings",
    });
  }
};
// ===update booking status by user (accept or reject booking)===

const { differenceInDays } = require("date-fns");


exports.updateBookingStatus = async (req, res) => {
  try {
    const providerId = req.user.id; // from JWT
    const { bookingId } = req.params;
    const { status } = req.body;

    console.log("STATUS RECEIVED:", status);
    console.log("PROVIDER FROM TOKEN:", providerId);
    console.log("BOOKING ID:", bookingId);

    const booking = await bookingmodel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("BOOKING PROVIDER:", booking.provider_id);
    console.log("CURRENT STATUS:", booking.status);

    // 🔐 Ownership check
    if (String(booking.provider_id) !== providerId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this booking",
      });
    }

    /* ================= PENDING ================= */
    if (booking.status === "pending") {
      if (!["accepted", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status change",
        });
      }
    }

    /* ================= ACCEPTED ================= */
    if (booking.status === "accepted") {
      if (status !== "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Only cancellation allowed",
        });
      }

      const firstBookingDate = new Date(booking.booking_dates[0].date);
      const diffDays = differenceInDays(firstBookingDate, new Date());

      if (diffDays < 7) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot cancel booking less than 7 days before the booking date",
        });
      }
    }

    /* ================= BLOCK OTHERS ================= */
    if (!["pending", "accepted"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Status change not allowed",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};


// ======all bokkings of logged user========
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware (JWT)

    const bookings = await bookingmodel.find({ user_id: userId })
      .populate("provider_id", "name available_location")
      .populate("category_id", "category_name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};