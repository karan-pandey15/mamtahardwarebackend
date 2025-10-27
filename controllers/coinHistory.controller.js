// controllers/coinHistory.controller.js
const CoinHistory = require('../models/coinHistory.model');
const User = require('../models/user.model');
const PointRequest = require('../models/point.model');

// 🧾 Create Coin History (when any action happens)
exports.logCoinHistory = async (userId, actionType, productName, coinsChanged, status, description) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const entry = new CoinHistory({
      userId,
      actionType,
      productName,
      coinsChanged,
      status,
      description,
      balanceAfter: user.totalPoints,
    });
    await entry.save();
  } catch (err) {
    console.error('Error logging coin history:', err);
  }
};

// 👤 Get User Coin History
exports.getUserCoinHistory = async (req, res) => {
  try {
    const history = await CoinHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧮 Admin: Get all users' coin history (optional)
exports.getAllCoinHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }

    const allHistory = await CoinHistory.find()
      .populate('userId', 'username email totalPoints')
      .sort({ createdAt: -1 })
      .lean();

    res.json(allHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
