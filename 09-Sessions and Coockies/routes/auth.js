const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
router.get('/login',authController.getLoginPage); // Route to display the login page
router.post('/login',authController.postLogin)

module.exports = router;