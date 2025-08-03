const express = require('express');
const expressHbs = require('express-handlebars');
// const db = require('./util/database.js'); // Import the database connection
const sequelize = require('./util/database'); // Import the Sequelize instance
const Product = require('./models/product'); // Import the Product model
const User = require('./models/user'); // Import the User model
const Cart = require('./models/cart');
const CartItem = require('./models/cart-items'); // Import the CartItem model
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




// Routes
app.use((req,res,next)=>{ // this will execute for every request
  User.findByPk(1)
  .then(user=>{
    //@ts-ignore
    req.user = user; // Attach the user to the request object
    // console.log('User fetched from database:', user);
    next(); // Call the next middleware, then it will call the request handler
  })
  .catch(err=>{
    console.log("error while fetching the user with id 1" +err);
  });
});
app.use('/admin', adminRoutes); // Use admin routes
app.use('/', shopRoutes); // Use shop routes
const errorController = require('./controllers/404');
app.use(errorController.get404Page);




// associate models (RELATIONSHIPS)
//1- one to many relationship between User and Product (creation of products)
Product.belongsTo(User, {constraints:true, onDelete: 'CASCADE'}); // Define the relationship between Product and User
User.hasMany(Product); // A User can have many Products
//2- One to One relationship between User and Cart
User.hasOne(Cart); // A User can have  one Cart
Cart.belongsTo(User); // A Cart belongs to a User
//3- Many to Many relationship between Cart and Product
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });




sequelize
.sync({ force: true }) // Sync the database, force:true will drop the table if it exists
.then(result=>{
  console.log('Database synced successfully');
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });

})
.catch(err=>{
  console.log(err);
});



// Use Case	.toJSON() Needed?
// Access fields in JS code (.title)	❌ No
// Rendering in Handlebars/EJS	✅ Yes
// Sending as JSON (res.json(...))	✅ Yes
// Looping with .map() or using spread	✅ Yes