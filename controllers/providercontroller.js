const providermodel = require("../models/providermodel")
const ProviderAvailability = require("../models/provider_availability_model")
const cloudinary = require("../config/cloudinary")
const uploadFromBuffer = require("../utils/cloudinaryUpload");


const bcrypt = require('bcryptjs');


// ==========================
// CREATE NEW PROVIDER
// ==========================
exports.addProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      is_group,
      members,
      address,
      contactno,
      service_category,
      available_location,
      username,
      password
    } = req.body;

    const hashedpassword = await bcrypt.hash(password, 10);

    // 🔹 Profile image
    let profileData = {};
    if (req.files?.profile_image?.length > 0) {
      const file = req.files.profile_image[0];

      const upload = await uploadFromBuffer(file.buffer, {
        folder: "mern_profiles",
        resource_type: "image"
      });

      profileData = {
        url: upload.secure_url,
        public_id: upload.public_id
      };
    }

    // 🔹 Documents
    const documents = [];
    if (req.files?.verification_document) {
      for (const doc of req.files.verification_document) {
        const isPdf = doc.mimetype === "application/pdf";

        const upload = await uploadFromBuffer(doc.buffer, {
          folder: "mern_documents",
          resource_type: isPdf ? "raw" : "image"
        });

        documents.push({
          url: upload.secure_url,
          public_id: upload.public_id
        });
      }
    }

    const locations = Array.isArray(available_location)
      ? available_location
      : [available_location];

    const newProvider = new providermodel({
      profile_image: profileData,
      name,
      email,
      is_group,
      members,
      address,
      contactno,
      service_category,
      available_location: locations,
      verification_document: documents,
      username,
      password: hashedpassword
    });

    await newProvider.save();

    res.status(201).json({
      message: "Provider registered successfully",
      data: newProvider
    });

  } catch (err) {
    console.error("ADD PROVIDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// GET ALL PROVIDERS
// ==========================
exports.getProviders = async (req, res) => {
  try {
    const providers = await providermodel.find().select("-password").populate("service_category");
    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// GET LOGGED-IN PROVIDER PROFILE
exports.viewMyProviderProfile = async (req, res) => {
  try {
    const providerId = req.user.id; // from auth middleware

    const provider = await providermodel.findById(providerId)
      .populate("service_category");

    if (!provider)
      return res.status(404).json({ message: "Provider not found" });

    res.status(200).json({ data: provider }); // frontend expects data:
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// VIEW PROVIDER BASED ON CATEGORY 
// ================================
exports.filterProviderforbooking = async (req, res) => {
  try {
    const { category_id, needs, location } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: "category_id is required" });
    }

    if (!needs || !Array.isArray(needs) || needs.length === 0) {
      return res.status(400).json({ message: "needs array is required" });
    }

    // STEP 1: Match availability strictly
    const availabilityMatched = await ProviderAvailability.find({
      availability: {
        $all: needs.map(item => ({
          $elemMatch: {
            date: item.date,
            availability_type: item.availability_type,
            is_available: true
          }
        }))
      }
    }).populate("provider_id");

    if (!availabilityMatched.length) {
      return res
        .status(404)
        .json({ message: "No providers available for requested dates" });
    }

    // STEP 2: Extract provider IDs
    const providerIds = availabilityMatched.map(
      item => item.provider_id._id
    );

    // STEP 3: Apply provider-level filters
    const filters = {
      _id: { $in: providerIds },
      service_category: category_id,
      verified: true,
      status: "active"
    };

    if (location) {
      filters.available_location = { $regex: location, $options: "i" };
    }

    const providers = await providermodel
      .find(filters)
      .select("name email contactno available_location service_category");

    if (!providers.length) {
      return res.status(404).json({
        message: "No providers match all booking criteria"
      });
    }

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==========================
// UPDATE Logged In PROVIDER
// ==========================
exports.updateMyProfile = async (req, res) => {
  try {
    const providerId = req.user.id;

    const provider = await providermodel.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const {
      name,
      email,
      is_group,
      members,
      address,
      contactno,
      service_category,
      available_location,
      username,
      password
    } = req.body;

    const updateData = {};

    // ---------------------------
    // BASIC FIELDS UPDATE
    // ---------------------------
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (is_group !== undefined) updateData.is_group = is_group;
    if (members) updateData.members = members;
    if (address) updateData.address = address;
    if (contactno) updateData.contactno = contactno;
    if (service_category) updateData.service_category = service_category;
    if (available_location) updateData.available_location = available_location;
    if (username) updateData.username = username;
    if (password) updateData.password = password;

    // ---------------------------
    // PROFILE IMAGE UPDATE
    // ---------------------------
    if (req.file) {  // profile image field (uploadProfile)
      // delete old image from cloudinary
      if (provider.profile_image) {
        const publicId = provider.profile_image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      updateData.profile_image = req.file.path;  // Cloudinary URL
    }

    // ---------------------------
    // DOCUMENTS UPDATE
    // ---------------------------
    if (req.files && req.files.length > 0) {
      const docs = req.files.map((f) => f.path);  // Only URLs needed

      // push new documents into array
      updateData.verification_document = [
        ...provider.verification_document,
        ...docs,
      ];
    }

    // ---------------------------
    // SAVE UPDATED PROVIDER
    // ---------------------------
    const updatedProvider = await providermodel.findByIdAndUpdate(
      providerId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      provider: updatedProvider,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ================================================
// To delete Profile Image
// ================================================

exports.deleteProfileImage = async (req, res) => {
  try {
    const providerId = req.user.id;
    const provider = await providermodel.findById(providerId);

    if (!provider.profile_image.public_id)
      return res.status(404).json({ message: "No image found" });

    await cloudinary.uploader.destroy(provider.profile_image.public_id);

    provider.profile_image = { url: "", public_id: "" };
    await provider.save();

    res.json({ message: "Profile image deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================================================
// Delete a Uploaded Document
// ================================================
exports.deleteDocument = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { docId } = req.params;  // document _id from frontend

    const provider = await providermodel.findById(providerId);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const document = provider.documents.id(docId);

    if (!document)
      return res.status(404).json({ message: "Document not found" });

    // Delete from Cloudinary
    if (document.public_id) {
      await cloudinary.uploader.destroy(document.public_id);
    }

    // Remove from MongoDB
    provider.documents.pull(docId);
    await provider.save();

    res.json({ message: "Document deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Update provider status and verification
exports.updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verified } = req.body;

    // Validate status
    const allowedStatus = ["active", "blocked", "pending"];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof verified === "boolean") updateData.verified = verified;

    const verifiedProvider = await providermodel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!verifiedProvider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    return res.status(200).json({
      message: "Provider updated successfully",
      provider: verifiedProvider,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

