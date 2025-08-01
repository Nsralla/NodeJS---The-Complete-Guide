const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));

const users = [];
router.get('/',(req,res,next)=>{
    res.render('index')
});

router.post('/users',(req,res,next)=>{
    users.push({username:req.body.username});
    res.render('users',{users:users, pageTitle: 'User List', hasUsers:users.length > 0}); // Render users view with the list of users
});
router.get('/users',(req,res,next)=>{
    res.render('users',{users:users, pageTitle: 'User List', hasUsers:users.length > 0}); // Render users view with the list of users
});

module.exports = {
    router: router
};

