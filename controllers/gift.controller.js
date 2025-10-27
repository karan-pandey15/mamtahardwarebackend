const GiftRequest = require('../models/giftmodel');
const User = require('../models/user.model');

// 🧾 Create a new gift redemption request
exports.createGiftRequest = async (req, res) => {
  try {
    const { productName, description, points, quantity } = req.body;

    if (!productName || !points) {
      return res.status(400).json({ error: 'Product name and points are required.' });
    }

    const request = new GiftRequest({
      userId: req.user.userId,
      productName,
      description,
      points,
      quantity
    });

    await request.save();

    res.status(201).json({
      message: 'Gift redemption request created successfully.',
      requestId: request._id
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// 👤 Get all user’s gift redemption requests
exports.getUserGiftRequests = async (req, res) => {
  try {
    const requests = await GiftRequest.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🕓 Admin: Get all pending gift requests
exports.getPendingGifts = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  try {
    const requests = await GiftRequest.find({ status: 'pending' })
      .populate('userId', 'username email totalPoints')
      .lean();

    const withTotal = requests.map(r => ({
      ...r,
      totalPoints: r.totalPoints || (r.points * r.quantity)
    }));

    res.json(withTotal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Admin: Approve a gift (deduct coins)
exports.approveGift = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  try {
    const { requestId } = req.params;
    const request = await GiftRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid or already processed request.' });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user has enough coins
    if (user.totalPoints < request.totalPoints) {
      request.status = 'rejected';
      await request.save();
      return res.status(400).json({
        error: `Insufficient coins. You need ${request.totalPoints}, but you only have ${user.totalPoints}.`
      });
    }

    // Deduct coins
    user.totalPoints -= request.totalPoints;
    await user.save();

    // Approve request
    request.status = 'approved';
    await request.save();

    res.json({
      message: 'Gift approved successfully, coins deducted.',
      remainingCoins: user.totalPoints
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ Admin: Reject a gift
exports.rejectGift = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin only' });
  }

  try {
    const { requestId } = req.params;
    const request = await GiftRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid or already processed request.' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Gift request rejected successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
