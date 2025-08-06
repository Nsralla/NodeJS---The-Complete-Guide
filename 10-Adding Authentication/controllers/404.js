exports.get404Page = (req, res, next) => {
    res.status(404).render('404', { 
        pageTitle: 'Page Not Found',
        page404: true,
        isAuthenticated: req.isLoggedIn
    }); // Render 404 page if no route matches
}