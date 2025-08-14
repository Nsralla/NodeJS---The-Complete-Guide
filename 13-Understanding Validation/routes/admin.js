// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth'); // Import the authentication middleware
const {check} = require('express-validator'); // Import express-validator for validation

//1- admin/add-product route GET ROUTE, to display add product form
router.get('/add-product', isAuth, adminController.getAddProductPage) // will only trigger on GET request
//2- admin/products route GET to display all products
router.get('/products', isAuth, adminController.getProducts);

//3- admin/ add-product POST route to handle form submission
router.post('/add-product',
    check('title').trim().isAlphanumeric().isLength({ min: 3 }).withMessage("Title must be at least 3 characters long and alphanumeric."),
    check('imageUrl').trim().isURL().withMessage("Invalid image URL."),
    check('price').trim().isFloat({ min: 0.01 }).withMessage("Invalid price."),
    check('description').trim().isLength({ min: 5 }).withMessage("Description must be at least 5 characters long."),
    isAuth,
    adminController.postAddProduct);

//4- admin/delete-product/:productId route to handle product deletion
router.post('/delete-product/:productId',
    check('title').trim().isAlphanumeric().isLength({ min: 3 }).withMessage("Title must be at least 3 characters long and alphanumeric."),
    check('imageUrl').trim().isURL().withMessage("Invalid image URL."),
    check('price').trim().isFloat({ min: 0.01 }).withMessage("Invalid price."),
    check('description').trim().isLength({ min: 5 }).withMessage("Description must be at least 5 characters long."),
    isAuth,
    adminController.postDeleteProduct);

//5-admin/edit-product/:productId: edit produt route
router.get('/edit-product/:productId',isAuth,adminController.getEditProductPage);

// 6-admin/edit-product/:productId
router.post('/edit-product/:productId', isAuth, adminController.postEditProduct); // POST route to handle product editing
module.exports = {
    router: router
};