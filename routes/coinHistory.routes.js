// routes/coinHistory.routes.js
const express = require('express');
const router = express.Router();
const coinHistoryCtrl = require('../controllers/coinHistory.controller');
const { verifyToken } = require('../controllers/user.controller');

// Get logged-in user's history
router.get('/my-history', verifyToken, coinHistoryCtrl.getUserCoinHistory);

// Admin can view all users' history
router.get('/all', verifyToken, coinHistoryCtrl.getAllCoinHistory);

module.exports = router;
