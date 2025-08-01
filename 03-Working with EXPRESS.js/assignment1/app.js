//npm init
// npm install --save express , production depndency
// npm install --save-dev nodemon , dev dependency

const express = require('express');
const app = express();
const rootDir = require('./util/path'); // Importing the utility path module
const path = require('path');

app.use(express.static(path.join(rootDir, 'public'))); // Serve static files from the public directory


app.use('/users',(req,resp,next)=>{
  resp.sendFile(path.join(rootDir,'views','users.html'));
})
app.use('/',(req,resp,next)=>{
    resp.sendFile(path.join(rootDir,'views','home.html'));
})



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});