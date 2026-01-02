const Rating = require("../models/rating_model");

// ===============================
// CREATE RATING & FEEDBACK
// ===============================
exports.createRating = async (req, res) => {
  try {
    const user_id = req.user.id; // ✅ LOGGED-IN USER ID (JWT)

    const {
      booking_id,
      provider_id,
      category_id,
      rating,
      feedback
    } = req.body;

    // prevent duplicate rating per booking
    const existing = await Rating.findOne({ booking_id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this booking"
      });
    }

    const newRating = await Rating.create({
      booking_id,
      user_id,          // ✅ saved here
      provider_id,
      category_id,
      rating,
      feedback
    });

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      data: newRating
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

 
// ===============================
// GET RATINGS BY PROVIDER
// ===============================
exports.getRatingsByProvider = async (req, res) => {
  try {
    const { provider_id } = req.params;

    const ratings = await Rating.find({ provider_id })
      .populate("user_id", "name")
      .populate("category_id", "category_name")
      .sort({ createdAt: -1 });

    // average rating
    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / (ratings.length || 1);

    res.status(200).json({
      success: true,
      averageRating: avgRating.toFixed(1),
      totalReviews: ratings.length,
      data: ratings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===============================
// GET ALL RATINGS (ADMIN)
// ===============================
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("user_id", "name")
      .populate("provider_id", "name")
      .populate("category_id", "category_name");

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
