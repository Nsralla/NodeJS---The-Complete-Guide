const User = require('../models/user');
const bcrypt = require('bcryptjs');
exports.getLoginPage = (req, res, next) => {
    // Render the login page with Handlebars
    console.log(req.session.isLoggedIn); // Log the session status
    res.render('auth/login', {
        pageTitle: 'Login',
        loginCss: true,
        currentPage: 'login',
        isAuthenticated: req.session.isLoggedIn
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
      isAuthenticated: req.session.isLoggedIn,
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
      isAuthenticated: req.session.isLoggedIn,
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
    res.redirect('/');
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
      isAuthenticated: req.session.isLoggedIn
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
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: 'User already exists with this email. Please try another one.'
    });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({email, password: hashedPassword});
  console.log('New user created:', newUser);
  res.status(201).render('auth/login', {
    pageTitle: 'Login',
    loginCss: true,
    currentPage: 'login',
    isAuthenticated: req.session.isLoggedIn
  });
};