const path = require('path');
const express = require('express');
const router = express.Router();
const rootDir = require('../util/path'); // Importing the utility path module

router.get('/',(req, res, next) => { // get doesn't act like use, the url must match exactly
    res.sendFile(path.join(rootDir,'views','shop.html'));

});

module.exports = {
    router:router
};