const express = require('express');
const expressHbs = require('express-handlebars');
// const db = require('./util/database.js'); // Import the database connection
const sequelize = require('./util/database'); // Import the Sequelize instance
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin').router;
const shopRoutes = require('./routes/shop').router;

// Middleware
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

// Register eq helper with Handlebars engine
const hbs = expressHbs.create({
  layoutsDir: path.join(__dirname, 'views/layouts'),
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: {
    eq: (a, b) => a === b
  }
});


// Configure handlebars engine
app.engine('hbs', hbs.engine); // Register the handlebars engine with the app

app.set('view engine', 'hbs'); // Set handlebars as the templating engine
app.set('views',  path.join(__dirname, 'views')); // Set the views directory for handlebars templates
                
app.use('/admin', adminRoutes); // Use admin routes
app.use('/', shopRoutes); // Use shop routes
const errorController = require('./controllers/404');
app.use(errorController.get404Page);
sequelize.sync()
.then(result=>{
  console.log('Database synced successfully');
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });

})
.catch(err=>{
  console.log(err);
});
