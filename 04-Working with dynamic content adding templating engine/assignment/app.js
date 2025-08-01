const express = require('express');
const expressHbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse URL-encoded bodies
app.engine('hbs', expressHbs.engine({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory



const routes = require('./routes/index').router;
app.use(routes);

app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
});