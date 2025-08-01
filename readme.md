//npm init
// npm install --save express , production depndency
// npm install --save-dev nodemon , dev dependency
//npm install --save body-parser
package.json content:
{
 "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon app.js"
  },
  "devDependencies": {
    "@types/node": "^24.1.0"
  },
  "dependencies": {
    "express": "^5.1.0",
    "nodemon": "^3.1.10"
  }
}


 npm install --save ejs pug express-handlebars
 to install package for html dynamic rendering



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


// to run the code:  npx nodemon "06-Enhancing the app/app.js"