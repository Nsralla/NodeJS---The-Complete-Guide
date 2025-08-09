const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
router.get('/login',authController.getLoginPage); // Route to display the login page
router.post('/login',authController.postLogin)
router.post('/logout',authController.postLogout);
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.postSignup); // Route to handle signup form submission
router.get('/forgot-password', authController.getForgotPasswordPage); // Route to display the forgot password page
router.post('/reset', authController.postResetPassword); // Route to handle password reset form submission
router.get('/reset/:token', authController.getResetPasswordPage); // Route to display the reset password page
router.post('/new-password', authController.postNewPassword); // Route to handle new password form submission
module.exports = router;