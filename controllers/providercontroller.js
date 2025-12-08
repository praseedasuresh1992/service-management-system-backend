const providermodel = require("../models/providermodel")
const ProviderAvailability=require("../models/provider_availability_model")

const bcrypt = require('bcryptjs');


// ==========================
// CREATE NEW PROVIDER
// ==========================
exports.addProvider = async (req, res) => {
  try {
        const {profile_image,
             name,
             email,
              is_group,
              members,
             address,
             contactno,
             service_category,
             available_location,
             username, 
             password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
 const newProvider=new providermodel({
    profile_image,
             name,
             email,
              is_group,
              members,
             address,
             contactno,
             service_category,
             available_location,
              username, 
              password :hashedpassword
 })
    await newProvider.save();
    res.status(201).json(newProvider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================
// GET ALL PROVIDERS
// ==========================
exports.getProviders = async (req, res) => {
  try {
    const providers = await providermodel.find();
    res.status(200).json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//================================
// self view of Provider Profile
//================================

exports.getmyprofile=async (req,res)=>{
  try{
    const providerId = req.user.id;  
    const provider = await providermodel.findById(providerId);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    res.status(200).json(provider);
  }
    catch (err) {
    res.status(500).json({ error: err.message });
  }
  }


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

    // Step 1: Find providers matching availability
    const availabilityMatched = await ProviderAvailability.find({
      availability: {
        $all: needs.map(item => ({
          $elemMatch: { date: item.date, slot: item.slot }
        }))
      }
    }).populate("provider_id");

    if (!availabilityMatched.length) {
      return res.status(404).json({ message: "No providers found for availability" });
    }

    // Step 2: Extract provider_ids from availability
    const providerIds = availabilityMatched.map(x => x.provider_id._id);

    // Step 3: Apply category + verified + status + location
    let filters = {
      _id: { $in: providerIds },
      service_category: category_id,
      verified: true,
      status: "active"
    };

    if (location) {
      filters.available_location = { $regex: location, $options: "i" };
    }

    const finalProviders = await providermodel
      .find(filters)
      .select("name email contactno available_location verified status service_category");

    if (finalProviders.length === 0) {
      return res.status(404).json({ 
        message: "No providers match all filters (category + verification + availability + location)" 
      });
    }

    res.status(200).json({
      success: true,
      count: finalProviders.length,
      data: finalProviders
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
        const providerId = req.user.id;   // ID from JWT middleware
        
        const {
            profile_image,
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

        if (profile_image) updateData.profile_image = profile_image;
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (is_group) updateData.is_group = is_group;
        if (members) updateData.members = members;
        if (address) updateData.address = address;
        if (contactno) updateData.contactno = contactno;
        if (service_category) updateData.service_category = service_category;
        if (available_location) updateData.available_location = available_location;
        if (username) updateData.username = username;
        if (password) updateData.password = password;


        

        const updatedProvider = await providermodel.findByIdAndUpdate(
            providerId,
            updateData,
            { new: true }
        );

        if (!updatedProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            provider: updatedProvider,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
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

// ==========================
// DELETE PROVIDER
// ==========================
exports.deleteProvider = async (req, res) => {
  try {
    console.log("delete")
    const deletedProvider = await providermodel.findByIdAndDelete(req.params.id);

    if (!deletedProvider)
      return res.status(404).json({ message: "Provider not found" });

    res.status(200).json({ message: "Provider deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
