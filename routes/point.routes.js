const express = require('express');
const router = express.Router();
const pointCtrl = require('../controllers/point.controller');
const { verifyToken } = require('../controllers/user.controller');

// User routes (protected)
router.post('/request', verifyToken, pointCtrl.createRequest);
router.get('/requests', verifyToken, pointCtrl.getUserRequests);

// Admin routes (protected)
router.get('/pending', verifyToken, pointCtrl.getPendingRequests);
router.put('/approve/:requestId', verifyToken, pointCtrl.approveRequest);
router.put('/reject/:requestId', verifyToken, pointCtrl.rejectRequest);

module.exports = router;