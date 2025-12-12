require('dotenv').config();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const usermodel = require('../models/usermodel');
const providermodel=require("../models/providermodel")
const adminmodel=require("../models/adminmodel")
exports.loginUser = async (req, res) => {
  try {
    console.log('🟡 Login Body:', req.body);

    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ message: 'Username and password required' });

    // Step 1 — Check in usermodel
    let currentuser = await usermodel.findOne({ username }).select("+password");
    console.log("found",currentuser)
    if(!currentuser)
    {
        console.log("not in user model");
        currentuser = await providermodel.findOne({ username }).select("+password");
    }
     if(!currentuser)
    {
        console.log("not in user and provider model");
        currentuser = await adminmodel.findOne({ username }).select("+password");
    }

    if (!currentuser) {
      console.log(' User not found:', username);
      return res.status(400).json({ message: 'User not found' });
    }

    // Validate password
   console.log("curpwd",currentuser.password)
   console.log("pwd",password)
    const ismatch = await bcrypt.compare(password, currentuser.password);
    if (!ismatch)
      
      return res.status(400).json({ message: 'Invalid Password' });
    
    //  Generate token
    const token = jwt.sign(
      {
        id: currentuser._id,
        username: currentuser.username,
        role: currentuser.role ,
      },
      process.env.secretekey,
      { expiresIn: '1d' }
    );

      // 🔥 Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,   // cannot be accessed by JS
      secure: true,     // required in https (Render & Netlify)
      sameSite: "None", // required when frontend & backend are different origins
      path: "/",
    });

    // Send response
    const userdata = {
      _id: currentuser._id,
      username: currentuser.username,
      Name: currentuser.name ,
      role:currentuser.role
    
    };

    return res
      .status(200)
      .json({ message: 'Login successful', token, user: userdata });
  } catch (err) {
    console.error(' Login error:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.logoutuser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",     // IMPORTANT: must match original cookie

    });

    return res.status(200).json({ message: "Logout successful" });
};
