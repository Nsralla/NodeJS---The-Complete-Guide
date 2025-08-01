// const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin').router;
const shopRoutes = require('./routes/shop').router;
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

app.use('/admin', adminRoutes); // Use admin routes
app.use('/shop', shopRoutes); // Use shop routes
app.use((req,res,next)=>{
    res.status(404).sendFile(path.join(__dirname,'views','404.html'));
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
