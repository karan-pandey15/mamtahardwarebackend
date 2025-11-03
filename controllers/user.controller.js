const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load env vars

// Signup
 exports.signup = async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // ✅ Check for duplicates before saving
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    // ✅ Automatically prefix +91 if missing
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // ✅ Create new user
    const user = new User({ username, email, phone: formattedPhone, password, role });
    await user.save();

    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;    
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`; // ✅ normalize

    const user = await User.findOne({ phone: formattedPhone });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        totalPoints: user.totalPoints,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Logged-in User Data
exports.getUserData = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from token
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Return user data
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        totalPoints: user.totalPoints,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user dashboard (total points)
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('totalPoints');
    res.json({ totalPoints: user.totalPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware to verify JWT (export for use in routes)
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ fixed
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};
