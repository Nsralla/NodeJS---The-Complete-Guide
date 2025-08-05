exports.getLoginPage = (req,res,next)=>{
    // Render the login page with Handlebars
    console.log(req.session.isLoggedIn); // Log the session status
        res.render('auth/login',{
            pageTitle: 'Login',
            loginCss: true,
            currentPage: 'login',
            isAuthenticated: req.session.isLoggedIn
        });
    }

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    // req.isLoggedIn = true; // this will be lost because res.redirect will send a new req
    // alternatively, you can use sessions or cookies to maintain the login state
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly'); //httpOnly prevents client-side scripts from accessing the cookie
    req.session.isLoggedIn = true;
    res.redirect('/login');
};