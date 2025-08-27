const express = require('express');
const expressHbs = require('express-handlebars');
// const db = require('./util/database.js'); // Import the database connection
const sequelize = require('./util/database'); // Import the Sequelize instance
const Product = require('./models/product'); // Import the Product model
const User = require('./models/user'); // Import the User model
const Cart = require('./models/cart');
const CartItem = require('./models/cart-items'); // Import the CartItem model
const Order = require('./models/order'); // Import the Order model
const OrderItem = require('./models/order-item'); // Import the OrderItem model
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session); // Import MongoDB session store
const csrf = require('csurf'); // Import CSRF protection middleware
const csrfProtection = csrf();
const multer = require('multer');

const adminRoutes = require('./routes/admin').router;
const shopRoutes = require('./routes/shop').router;
const authRoutes = require('./routes/auth');



const app = express();
const store = new MongoDbStore({
  uri: 'mongodb://localhost:27017/sessions',
  collection: 'sessions'
});

// Add error handling for the store
store.on('error', function (error) {
  console.log('Session store error:', error);
});

// Test the store connection
store.on('connected', function () {
  console.log('MongoDB session store connected successfully');
});


const filter = (req, file, cb) => {
  if (!file) {
    return cb(null, false);
  }
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  req.fileValidationError = 'Not an image! Please upload an image file (JPG, PNG, etc.)';
  cb(null, false);
};
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Set the filename to include the current timestamp
  }
});




// Middleware
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies
app.use(multer({storage: fileStorage, fileFilter: filter}).single('image')); // Middleware to handle file uploads
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: false, // Set to false for HTTP (development)
    httpOnly: true,
    sameSite: 'lax' // Add this for better cookie handling
  }
}));
app.use(csrfProtection); // Use CSRF protection middleware

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
app.set('views', path.join(__dirname, 'views')); // Set the views directory for handlebars templates




// Routes
app.use((req, res, next) => {
  if (!req.session.isLoggedIn) {
    // Note: you're using isLoggedIn in auth.js, not loggedIn
    return next();
  }
  
  if (!req.session.userId) {
    console.log('No userId in session, skipping user fetch');
    return next();
  }
  
  User.findByPk(req.session.userId)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user; // Set the user object on the request
      next();
    })
    .catch(err => {
      const error = new Error("Error while fetching the user");
      error.originalMessage = err.message;
      error.statusCode = 500;
      return next(error);
    });
});


app.use((req, res, next) => {
  const token = req.csrfToken();
  console.log('CSRF token issued for view:', token);
  res.locals.csrfToken = token; // Make CSRF token available in templates
  res.locals.isAuthenticated = req.session.isLoggedIn;  // Make isAuthenticated available in templates
  next();
});


app.use('/admin', adminRoutes); // Use admin routes
app.use(shopRoutes); // Use shop routes
app.use(authRoutes);
// Add this route before the 404 handler
app.get('/500', (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error',
    currentPage: 'error',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: "Server Error",
    errorStatus: 500
  });
});


const errorController = require('./controllers/404');
app.use(errorController.get404Page);

app.use((error, req,res, next)=>{
  const statusCode = error.statusCode || 500;
  const isAuthenticated = req.session? req.session.isLoggedIn : false;
  if(statusCode === 400){
    return res.status(404).render('404',{
      pageTitle: 'Not Found',
      isAuthenticated: isAuthenticated,
      errorMessage: error.message || "AN KNOWN  ERROR OCCURED",
    });
  }
  return res.status(500).render('500',{
    pageTitle: 'Error',
    isAuthenticated: isAuthenticated,
    errorMessage: error.message || "AN KNOWN  ERROR OCCURED",
    originalMessage: error.originalMessage || "No original message available",
    errorStatus: 500  
  })
})

// associate models (RELATIONSHIPS)
//1- one to many relationship between User and Product (creation of products)
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' }); // Define the relationship between Product and User
User.hasMany(Product); // A User can have many Products
//2- One to One relationship between User and Cart
User.hasOne(Cart); // A User can have  one Cart
Cart.belongsTo(User); // A Cart belongs to a User
//3- Many to Many relationship between Cart and Product
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
//4- One to Many relationship between Order and User
User.hasMany(Order);
Order.belongsTo(User);
// 5- Many to Many relationship between Order and Product
Order.belongsToMany(Product, { through: OrderItem }); // Many to Many relationship between Order and Product
Product.belongsToMany(Order, { through: OrderItem });



sequelize
  .sync({  }) // Sync the database, force:true will drop the table if it exists
  .then(result => {
    console.log('Database synced successfully');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });

  })
  .catch(err => {
    console.log(err);
  });



// Use Case	.toJSON() Needed?
// Access fields in JS code (.title)	❌ No
// Rendering in Handlebars/EJS	✅ Yes
// Sending as JSON (res.json(...))	✅ Yes
// Looping with .map() or using spread	✅ Yes