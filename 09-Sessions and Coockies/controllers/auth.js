exports.getLoginPage = (req,res,next)=>{
    const cookieHeader = req.get('Cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const loggedIn = cookies.loggedIn === 'true';
        console.log('Logged In:', loggedIn);
        console.log('Cookie:', cookies);
        res.render('auth/login',{
            pageTitle: 'Login',
            loginCss: true,
            currentPage: 'login',
            isAuthenticated: loggedIn
        });
    }

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    // req.isLoggedIn = true; // this will be lost because res.redirect will send a new req
    // alternatively, you can use sessions or cookies to maintain the login state
    res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly'); //httpOnly prevents client-side scripts from accessing the cookie


    // Here you would typically validate the credentials against a database
    // For simplicity, we will just log them and redirect to the home page
    console.log(`Email: ${email}, Password: ${password}`);
    res.redirect('/');
};