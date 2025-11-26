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

