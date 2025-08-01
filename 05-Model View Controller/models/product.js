const products = [];

class Product {
    constructor(title){
        this.title = title;
    }

    save(){
        products.push(this);
    }

    static fetchAll(){
        return products;
    }

};

module.exports = Product; // exports the class itself, not an instance
//exports.ProductObj = Product; // exports an object with a property Product, so to access it you would say: const Product = require('./product').Product;