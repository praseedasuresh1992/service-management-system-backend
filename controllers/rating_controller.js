const Comment = require('../models/rating_model');

// ===============================
// CREATE COMMENT
// ===============================
exports.createComment = async (req, res) => {
  try {
    const comment = await Comment.create(req.body);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// GET ALL COMMENTS
// ===============================
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user_id")
      .populate("provider_id")
      .populate("category_id");

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ===============================
// GET COMMENT BY ID
// ===============================
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("user_id")
      .populate("provider_id")
      .populate("category_id");

    if (!comment)
      return res.status(404).json({ success: false, message: "Comment not found" });

    res.status(200).json({ success: true, data: comment });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

