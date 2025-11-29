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
    let currentuser = await usermodel.findOne({ username });
    console.log("found",currentuser)
    if(!currentuser)
    {
        console.log("not in user model");
        currentuser = await providermodel.findOne({ username });
    }
     if(!currentuser)
    {
        console.log("not in user and provider model");
        currentuser = await adminmodel.findOne({ username });
    }

    if (!currentuser) {
      console.log(' User not found:', username);
      return res.status(400).json({ message: 'User not found' });
    }

    // Validate password
   
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

    // Step 6 — Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
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


exports.logoutuser=(req,res)=>{
    res.clearCookie("token")
    console.log(res.cookie.token)
    res.status(200).json({message:`Logout successfull`})
}