require('dotenv').config();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const usermodel = require('../models/usermodel');

//  Register user (admin/staff)
exports.createuser = async (req, res) => {
  try {
    const { name,email,address,contactno, username, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = new usermodel({
      name,
      email,
      address,
      contactno,
      username,
      password: hashedpassword,
    });
    await newuser.save();
    res
      .status(200)
      .json({ message: 'User registered successfully', user: newuser });
  } catch (err) {
    console.error('Error in createuser:', err);
    res.status(500).json({ message: err.message });
  }
};
// view a logged user
exports.getMyUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const user = await usermodel
      .findById(userId)
      .select("-password");
console.log("......",user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
};


//  View all users
exports.viewuser = async (req, res) => {
  try {
    const finduser = await usermodel.find();
    if(!finduser)
      return res.status(200).json({message:"there are no users registered"})
    return res.status(200).json({ message: 'Success', data: finduser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Server error: ${err.message}` });
  }
};

// =======================================
// UPDATE LOGGED-IN USER PROFILE (NO PASSWORD)
// =======================================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // Fields allowed to update
    const allowedUpdates = ["name", "email", "address", "contactno", "username"];
    const updateData = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    // Prevent password & role update
    if (req.body.password || req.body.role) {
      return res.status(403).json({
        message: "Password or role update is not allowed here"
      });
    }

    const updatedUser = await usermodel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message
    });
  }
};



exports.deleteuser=async(req,res)=>{
  console.log("entered")
    try{
    const {id}=req.params
    console.log(id)
        const deleteduser=await usermodel.findByIdAndDelete(id)
  
    if(!deleteduser)
            return res.status(404).json({message:"not found"})
    return res.status(200).json({message:"Deletion successfull",data:deleteduser})

}
    catch(err){
        return res.status(500).json({message:`server error ${err.message}`})
    }
}

