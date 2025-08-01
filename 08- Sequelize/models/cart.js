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

    addProductToCart(product){
        // check if the product already exists in the cart
        const existingProductIndex = this.products.findIndex(prd => prd.id === product.id);
        if(existingProductIndex === -1){
            // if not, add the product to the cart
            const newProduct = { ...product, quantity: 1 }; // Create a new object with quantity
            this.products.push(newProduct);
            this.totalPrice += Number(product.price); // Update total price
        }

        // if it exists, increment the quantity and update total price
        else{
                const existingProduct = this.products.find(prd=>prd.id === product.id);
                existingProduct.quantity+=1;
                this.products[existingProductIndex] = existingProduct; // Update the product in the cart
                this.totalPrice += Number(product.price); // Update total price
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
