const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');

// Public routes
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// fetch data routes
router.get("/userdata", userCtrl.getUserData);


// Protected routes
router.get('/dashboard', userCtrl.verifyToken, userCtrl.getDashboard);

module.exports = router;
