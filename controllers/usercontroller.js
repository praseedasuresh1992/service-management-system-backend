require('dotenv').config();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const usermodel = require('../models/usermodel');

// ✅ Register user (admin/staff)
exports.createuser = async (req, res) => {
  try {
    const { Name,email,address,contactno, username, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = new usermodel({
      Name,
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

//  View all users
exports.viewuser = async (req, res) => {
  try {
    const finduser = await usermodel.find();
    return res.status(200).json({ message: 'Success', data: finduser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Server error: ${err.message}` });
  }
};

// ✅ Login (checks both user and customer)
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
    console.log(" not in user");
    if (!currentuser) {
      console.log(' User not found:', username);
      return res.status(400).json({ message: 'User not found' });
    }

    // Step 4 — Validate password
    const ismatch = await bcrypt.compare(password, currentuser.password);
    if (!ismatch)
      return res.status(400).json({ message: 'Invalid Password' });

    // Step 5 — Generate token
    const token = jwt.sign(
      {
        id: currentuser._id,
        username: currentuser.username,
        role: currentuser.role || 'user',
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

    // Step 7 — Send response
    const userdata = {
      _id: currentuser._id,
      username: currentuser.username,
      role: currentuser.role || 'customer',
      Name: currentuser.name || currentuser.name,
    
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
