const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); // Add this line to import Op operators
require('dotenv').config(); // Add this line to load environment variables
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const snedGridTransport = require('nodemailer-sendgrid-transport'); // Import SendGrid transport for nodemailer
const transporter = nodemailer.createTransport(snedGridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY // Use the SendGrid API key from environment variables
  }
}));
const {validationResult} = require('express-validator');

exports.getLoginPage = (req, res, next) => {
  // Render the login page with Handlebars
  res.render('auth/login', {
    pageTitle: 'Login',
    loginCss: true,
    currentPage: 'login'
  });
}

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput:{
        email,
        password
      }
    })
  }
  if (!email || !password) {
    return res.status(400).render('auth/login', {
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: 'Please enter both email and password.',
      oldInput: {
        email,
        password
      }
    });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).render('auth/login', {
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      errorMessage: 'No user found with this email.',
      oldInput: {
        email,
        password
      }
    });
  }
  //@ts-ignore
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    return res.status(401).render('auth/login', {
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      errorMessage: 'Incorrect password. Please try again.',
      oldInput: {
        email,
        password
      }
    });
  }


  req.session.isLoggedIn = true;
  req.user = user;
  req.session.userId = user.id; // Store user ID in session for later use
  req.session.save(err => {
    if (err) {
     const error = new Error("Error while saving the session");
     error.originalMessage = err.message;
     error.statusCode = 500;
     return next(error);
    }
    // Send a welcome email using SendGrid
    transporter.sendMail({
      to: user.email,
      from: process.env.SENDER_EMAIL,
      subject: 'Welcome to Our App!',
      text: 'Thank you for signing up for our app!'
    })
      .then(() => {
        console.log('Welcome email sent successfully');
        res.redirect('/');
      })
      .catch(err => {
        console.error('Error sending welcome email:', err);
        res.redirect('/');
      });
  });
};


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      const error = new Error("Error while destroying session");
      error.originalMessage = err.message;
      error.statusCode = 500;
      return next(error);
    }
    res.redirect('/'); // Redirect to home page after logout
  });
};

exports.getSignupPage = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    signupCss: true,
    currentPage: 'signup',
  })
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmedPassword } = req.body;
  const user = await User.findOne({ where: { email } });

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      signupCss: true,
      currentPage: 'signup',
      errorMessage: errors.array()[0].msg,
      oldInput:{
        email,
        password,
        confirmedPassword
      }
    })
  }
  if (user) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      signupCss: true,
      currentPage: 'signup',
      errorMessage: 'User already exists with this email. Please try another one.',
      oldInput:{
        email,
        password,
        confirmedPassword
      }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({ email, password: hashedPassword });
  res.status(201).render('auth/login', {
    pageTitle: 'Login',
    loginCss: true,
    currentPage: 'login'
  });
};

exports.getForgotPasswordPage = (req, res, next) => {
  res.render('auth/forgot-password', {
    pageTitle: 'Forgot Password',
    forgotPasswordCss: true,
    currentPage: 'forgot-password'
  });
};

exports.postResetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).render('auth/forgot-password', {
      pageTitle: 'Forgot Password',
      forgotPasswordCss: true,
      currentPage: 'forgot-password',
      errorMessage: 'No user found with this email.'
    });
  }
  const token = crypto.randomBytes(32).toString('hex'); // Generate a random token
  user.userToken = token;
  user.userTokenExpiration = Date.now() + 3600000;
  await user.save(); // Save the token and expiration to the user model

  // Send reset password email
  transporter.sendMail({
    to: user.email,
    from: process.env.SENDER_EMAIL,
    subject: 'Password Reset',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset.</p>
      <p>Click <a href="http://localhost:3000/reset/${token}">this link</a> to set a new password.</p>
      <p>This link will expire in 1 hour.</p>
    `
  })
    .then(() => {
      console.log('Password reset email sent successfully');
      res.redirect('/login');
    })
    .catch(err => {
      console.error('Error sending password reset email:', err);
      res.redirect('/login');
    });
};


exports.getResetPasswordPage = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ where: { userToken: token, userTokenExpiration: { [Op.gt]: Date.now() } } });

  if (!user) {
    const error = new Error("User not found or token expired.");
    error.statusCode = 404;
    return next(error);
  }

  res.render('auth/new-password', {
    pageTitle: 'Reset Password',
    newPasswordCss: true,
    currentPage: 'reset-password',
    userId: user.id,
    token: req.params.token
  });
};

exports.postNewPassword = async (req, res, next) => {
  const { userId, token, password } = req.body;
  const user = await User.findOne({ where: { id: userId, userToken: token, userTokenExpiration: { [Op.gt]: Date.now() } } });
  if (!user) {
    const error = new Error("User not found or token expired.");
    error.statusCode = 404;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.userToken = null;
  user.userTokenExpiration = null;
  await user.save();

  res.redirect('/login');
};