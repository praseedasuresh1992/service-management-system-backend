const Complaint = require("../models/complaints_model");

// ===============================
// CREATE COMPLAINT
// ===============================
exports.createComplaint = async (req, res) => {
    try {
        const { user_id, provider_id, complaints_text } = req.body;

        if (!user_id || !provider_id || !complaints_text) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const complaint = await Complaint.create({
            user_id,
            provider_id,
            complaints_text,
            createdAt: new Date()
        });

        return res.status(201).json({
            message: "Complaint created successfully",
            data: complaint
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};


// ===============================
// VIEW ALL COMPLAINTS
// ===============================
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("user_id")
            .populate("provider_id");

        return res.status(200).json({
            message: "All complaints fetched successfully",
            data: complaints
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};


// ===============================
// VIEW COMPLAINTS BY  ID
// ===============================
exports.getComplaintsById = async (req, res) => {
    try {
        const { provider_id } = req.params;

        const complaints = await Complaint.find({ provider_id })
            .populate("user_id")
            .populate("provider_id");

        return res.status(200).json({
            message: "Complaints for provider fetched successfully",
            data: complaints
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};



// ===============================
// UPDATE COMPLAINT STATUS
// ===============================
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };

    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    } else {
      updateData.resolvedAt = null; // ✅ important
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({
      message: "Complaint status updated successfully",
      data: complaint
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
