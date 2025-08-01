const Product = require('./product'); // Import Product model
class Cart {
    static instance; // Add this line to declare the static property

    constructor(){
        if(!Cart.instance){
            this.products = [];
            this.totalPrice = 0;
            Cart.instance = this;
        }
        return Cart.instance;
    }

    addProductToCart(productId, productPrice){
        // check if the product already exists in the cart
        const existingProductIndex = this.products.findIndex(prd => prd.id === productId);
        if(existingProductIndex === -1){
            // if not, add the product to the cart
            const newProduct = Product.loadProduct(productId);
            if(newProduct){
                newProduct.quantity = 1; // Initialize quantity to 1
                this.products.push(newProduct);
                this.totalPrice += Number(productPrice); // Update total price
            }
            else{
                console.error(`Product with ID ${productId} not found.`);
            }
        }
        // if it exists, increment the quantity and update total price
        else{
            const existingProduct = this.products.find(prd=>prd.id === productId);
            existingProduct.quantity+=1;
            this.products[existingProductIndex] = existingProduct; // Update the product in the cart
            this.totalPrice += Number(productPrice); // Update total price
        }
    }

    removeProductFromCart(productId){
        const productIndex = this.products.findIndex(prd => prd.id === productId);
        const productQuantity = this.products[productIndex].quantity;
        if(productIndex !== -1){
            const product = this.products[productIndex];
            if(productQuantity > 1){
                this.products[productIndex].quantity -= 1; // Decrement quantity
            }else{
                // this.totalPrice -= product.price * this.products[productIndex].quantity; // Update total price
                this.products.splice(productIndex,1); // Remove the product from the cart
            }
             this.totalPrice -= product.price; // Update total price
           
        }
    }


   static getCartInstance(){
        if(!Cart.instance){
            Cart.instance = new Cart();
            }
        return Cart.instance;
        }
};

module.exports = Cart;
