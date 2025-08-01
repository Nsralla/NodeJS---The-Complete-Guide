const Product = require('../models/product'); // Import Product model
const Cart = require('../models/cart'); // Import Cart model


exports.getShowProducts = (req, res, next) => { // get doesn't act like use, the url must match exactly
    // send products to the shop page
    res.render('shop/product-list', {
        products: Product.fetchAll(),
        pageTitle: 'Shop',
        hasProducts: Product.fetchAll().length > 0,
        productCss: true,
        formCss: 'add-product.css',
        currentPage: 'products'
    });

};


exports.getIndexPage = (req,res,next)=>{
    res.render('shop/index',{
        pageTitle: 'Home page',
        products: Product.fetchAll(),
        hasProducts: Product.fetchAll().length > 0,
        currentPage:'index'
    });
};

exports.getCart = (req,res,next)=>{
    const cart = Cart.getCartInstance();
    res.render('shop/cart',{ 
        pageTitle:'Your Cart',
        products: cart.products,
        totalPrice: cart.totalPrice,
        currentPage:'cart',
        cartCss: true,
    });

};

exports.postCart = (req,res,next)=>{
    const productId =req.body.productId; // Get the product ID from the request body
    const productPrice = Product.loadProduct(productId).price; // Get the product price from the Product model
    const cart = Cart.getCartInstance();
    cart.addProductToCart(productId, productPrice); // Add product to cart
    res.redirect('/cart'); // Redirect to the cart page after adding product
}

exports.getCheckout = (req,res,next)=>{
    res.render('shop/checkout',{ 
        pageTitle: 'Checkout',
        products: Product.fetchAll(),
        currentPage: 'checkout'
    });
};

exports.getOrders = (req,res,next)=>{
    res.render('shop/orders',{
        pageTitle: 'Your Orders',
        currentPage: 'orders'
    });
};



exports.getProductDetails = (req, res, next) => {
   const productId = req.params.productId;
   const product = Product.loadProduct(productId); // Load product by ID
   if(!product){
    res.status(404).render('404');
   }
   res.render('shop/product-details',{
       product: product,
       pageTitle: product.title,
       productDetailsCss: true,
       currentPage: 'product-details'
       
   })
};


exports.deleteProduct = (req,res,next)=>{
    const id = req.params.productId;
    Product.delete(id);
    res.redirect('/products'); // Redirect to the products page after deletion
};


exports.deleteProductFromCart = (req,res,next)=>{
    const id = req.params.productId;
    const cart = Cart.getCartInstance();
    cart.removeProductFromCart(id);
    res.redirect('/cart'); // Redirect to the cart page after deletion
};