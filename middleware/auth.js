const jwt=require('jsonwebtoken')
require('dotenv').config();

exports.authuser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  // Token from cookies
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Token from Authorization header
  else if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // No token found
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const verified = jwt.verify(token, process.env.secretekey);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired Token" });
  }
};


exports.authorizeRoles=(...roles)=>{
    console.log(roles)
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({message:"please log in"})
        }
        if(!roles.includes(req.user.role)){
            return res.status(400).json({message:"access denied"})
        }      
        next()  
    }
}