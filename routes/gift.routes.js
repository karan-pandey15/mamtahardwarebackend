const express = require('express');
const router = express.Router();
const giftCtrl = require('../controllers/gift.controller');
const { verifyToken } = require('../controllers/user.controller');

 
router.post('/redeem', verifyToken, giftCtrl.createGiftRequest);
 
router.get('/my-requests', verifyToken, giftCtrl.getUserGiftRequests);


 
// 🕓 Get all pending gift requests
router.get('/pendinggift', verifyToken, giftCtrl.getPendingGifts);
 
router.put('/approvegift/:requestId', verifyToken, giftCtrl.approveGift);
 
router.put('/rejectgift/:requestId', verifyToken, giftCtrl.rejectGift);


// =======================
// 🔚 Export
// =======================
module.exports = router;
