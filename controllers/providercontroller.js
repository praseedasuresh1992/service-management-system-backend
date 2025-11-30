const providermodel = require("../models/providermodel")
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


// ==========================
// GET SINGLE PROVIDER BY ID
// ==========================
exports.providerProfile = async (req, res) => {
  try {
    const provider = await providermodel.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    res.status(200).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
