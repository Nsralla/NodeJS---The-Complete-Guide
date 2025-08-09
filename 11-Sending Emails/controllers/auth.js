const User = require('../models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Add this line to load environment variables
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const snedGridTransport = require('nodemailer-sendgrid-transport'); // Import SendGrid transport for nodemailer
const transporter = nodemailer.createTransport(snedGridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY // Use the SendGrid API key from environment variables
  }
}));

exports.getLoginPage = (req, res, next) => {
    // Render the login page with Handlebars
    console.log(req.session.isLoggedIn); // Log the session status
    res.render('auth/login', {
        pageTitle: 'Login',
        loginCss: true,
        currentPage: 'login'
    });
}

exports.postLogin = async (req, res, next) => {
  const {email, password} = req.body;
  if(!email || !password){
    return res.status(400).render('auth/login',{
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: 'Please enter both email and password.'
    });
  }
  const user = await User.findOne({where: {email}});
  if(!user){
    return res.status(401).render('auth/login',{
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      errorMessage: 'No user found with this email.'
    });
  }
  //@ts-ignore
  const isMatched = await bcrypt.compare(password, user.password);
  if(!isMatched){
    return res.status(401).render('auth/login',{
      pageTitle: 'Login',
      loginCss: true,
      currentPage: 'login',
      errorMessage: 'Incorrect password. Please try again.'
    });
  }


  req.session.isLoggedIn = true;
  req.user = user;
  req.session.userId = user.id; // Store user ID in session for later use
  req.session.save(err => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).render('500');
    }
    // Send a welcome email using SendGrid
    transporter.sendMail({
      to: user.email,
      from: 'your-email@example.com',
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
            console.error('Error destroying session:', err);
            return res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error',
                errorMessage: 'Could not log out. Please try again later.'
            });
        }
        res.redirect('/'); // Redirect to home page after logout
    });
};

exports.getSignupPage = (req, res, next) => {
    res.render('auth/signup',{
      pageTitle: 'Signup',
      signupCss: true,
      currentPage: 'signup',
    })
};

exports.postSignup = async (req,res,next)=>{
  const {email, password, confirmedPassword} = req.body;
  const user = await User.findOne({where:{email}});
  if(user){
    return res.status(422).render('auth/signup',{
      pageTitle: 'Signup',
      signupCss: true,
      currentPage: 'signup',
      errorMessage: 'User already exists with this email. Please try another one.'
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({email, password: hashedPassword});
  console.log('New user created:', newUser);
  res.status(201).render('auth/login', {
    pageTitle: 'Login',
    loginCss: true,
    currentPage: 'login'
  });
};