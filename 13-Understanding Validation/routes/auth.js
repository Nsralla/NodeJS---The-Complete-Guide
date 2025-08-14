const express = require('express');
const router = express.Router();
const {check, body} = require('express-validator')
const authController = require('../controllers/auth');
router.get('/login',authController.getLoginPage); // Route to display the login page
router.post('/login',check('email').isEmail().withMessage("Invalid email address, please enter a valid email."),authController.postLogin)
router.post('/logout',authController.postLogout);
router.get('/signup', authController.getSignupPage);
router.post('/signup',
    check('email').isEmail().normalizeEmail().withMessage("Invalid email address, please enter a valid email."),
    check('password').trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long"),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    authController.postSignup); // Route to handle signup form submission
router.get('/forgot-password', authController.getForgotPasswordPage); // Route to display the forgot password page
router.post('/reset', authController.postResetPassword); // Route to handle password reset form submission
router.get('/reset/:token', authController.getResetPasswordPage); // Route to display the reset password page
router.post('/new-password', authController.postNewPassword); // Route to handle new password form submission
module.exports = router;