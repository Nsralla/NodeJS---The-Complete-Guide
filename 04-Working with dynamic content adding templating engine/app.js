const express = require('express');
const expressHbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin').router;
const shopRoutes = require('./routes/shop').router;

// Middleware
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Configure handlebars engine
app.engine('hbs', expressHbs.engine({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main',
    extname: 'hbs'

}));
app.set('view engine', 'hbs'); // Set handlebars as the templating engine
app.set('views',  path.join(__dirname, 'views')); // Set the views directory for handlebars templates

app.use('/admin', adminRoutes); // Use admin routes
app.use('/shop', shopRoutes); // Use shop routes
app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found',page404: true }); // Render 404 page if no route matches
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
