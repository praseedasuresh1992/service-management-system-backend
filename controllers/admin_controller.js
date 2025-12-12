const Admin = require("../models/adminmodel");
const bcrypt = require("bcrypt");

// ADD NEW ADMIN
exports.addAdmin = async (req, res) => {
  try {
    const { name, email, contactno, username, password } = req.body;

    // Validate required fields
    if (!name || !email || !contactno || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Check if username already exists
    const existingUsername = await Admin.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      name,
      email,
      contactno,
      username,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
};
