// const PointRequest = require('../models/point.model');
// const User = require('../models/user.model');

// // User creates a product request (add to cart-like)
// exports.createRequest = async (req, res) => {
//   try {
//     const { productName, description, points, quantity } = req.body;
//     const request = new PointRequest({
//       userId: req.user.userId,
//       productName,
//       description,
//       points,
//       quantity
//     });
//     await request.save();
//     res.status(201).json({ message: 'Request created', requestId: request._id });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Get user's pending/approved requests
// exports.getUserRequests = async (req, res) => {
//   try {
//     const requests = await PointRequest.find({ userId: req.user.userId }).populate('userId', 'username');
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Admin: Get all pending requests
// exports.getPendingRequests = async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
//   try {
//     const requests = await PointRequest.find({ status: 'pending' }).populate('userId', 'username email');
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Admin: Approve request (add points to user)
// exports.approveRequest = async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
//   try {
//     const { requestId } = req.params;
//     const request = await PointRequest.findById(requestId);
//     if (!request || request.status !== 'pending') {
//       return res.status(400).json({ error: 'Invalid request' });
//     }
//     request.status = 'approved';
//     await request.save();

//     // Add points to user (totalPoints += points * quantity)
//     const user = await User.findById(request.userId);
//     user.totalPoints += request.points * request.quantity;
//     await user.save();

//     res.json({ message: 'Request approved', updatedPoints: user.totalPoints });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Admin: Reject request
// exports.rejectRequest = async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
//   try {
//     const { requestId } = req.params;
//     const request = await PointRequest.findById(requestId);
//     if (!request || request.status !== 'pending') {
//       return res.status(400).json({ error: 'Invalid request' });
//     }
//     request.status = 'rejected';
//     await request.save();
//     res.json({ message: 'Request rejected' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };






const PointRequest = require('../models/point.model');
const User = require('../models/user.model');

// User creates a product request (add to cart-like)
// exports.createRequest = async (req, res) => {
//   try {
//     const { productName, description, points, quantity } = req.body;
//     const request = new PointRequest({
//       userId: req.user.userId,
//       productName,
//       description,
//       points,
//       quantity
//     });
//     await request.save();
//     res.status(201).json({ message: 'Request created', requestId: request._id });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

exports.createRequest = async (req, res) => {
  try {
    let { items } = req.body;

    // If the payload is a single object (not an array), normalize it into an array
    if (!items) {
      // Handle the case where the client sends a single request directly
      const { productName, description, points, quantity } = req.body;
      items = [{
        userId: req.user?.userId || req.body.userId, // support both authenticated and direct payload
        productName,
        description,
        points,
        quantity
      }];
    }

    // Validate that items is now an array
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid payload format. Expected 'items' array or single object." });
    }

    // Map the payloads into an array of PointRequest documents
    const requests = items.map(item => ({
      userId: req.user?.userId || item.userId,
      productName: item.productName,
      description: item.description,
      points: item.points,
      quantity: item.quantity
    }));

    // Save all requests to MongoDB
    const savedRequests = await PointRequest.insertMany(requests);

    res.status(201).json({
      message: `${savedRequests.length} request(s) created successfully`,
      requests: savedRequests.map(r => ({
        id: r._id,
        productName: r.productName,
        points: r.points,
        quantity: r.quantity
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get user's pending/approved requests
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await PointRequest.find({ userId: req.user.userId }).populate('userId', 'username');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get all pending requests
exports.getPendingRequests = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const requests = await PointRequest.find({ status: 'pending' })
      .populate('userId', 'username email')
      .lean(); // lean() gives plain JS objects, easier for modification

    // Ensure totalPoints is always shown, even if not saved
    const updatedRequests = requests.map(r => ({
      ...r,
      totalPoints: r.totalPoints || (r.points * r.quantity)
    }));

    res.json(updatedRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Approve request (add points to user)
exports.approveRequest = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { requestId } = req.params;
    const request = await PointRequest.findById(requestId);

    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    request.status = 'approved';
    await request.save();

    // ✅ Fix: Only add the base points, not multiplied by quantity
    const user = await User.findById(request.userId);
    user.totalPoints += request.totalPoints;
    await user.save();

    res.json({ message: 'Request approved', updatedPoints: user.totalPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin: Reject request
exports.rejectRequest = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const { requestId } = req.params;
    const request = await PointRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }
    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};