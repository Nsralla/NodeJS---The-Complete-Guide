const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
router.get('/login',authController.getLoginPage); // Route to display the login page
router.post('/login',authController.postLogin)
router.post('/logout',authController.postLogout);
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.postSignup); // Route to handle signup form submission
module.exports = router;