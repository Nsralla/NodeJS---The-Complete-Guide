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

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  req.session.isLoggedIn = true;

  req.session.save(err => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).render('500');
    }
    console.log('Session saved during login:', req.session); // <== ADD THIS
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