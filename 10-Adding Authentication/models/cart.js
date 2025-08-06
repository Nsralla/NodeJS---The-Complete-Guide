const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Cart = sequelize.define('cart',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }
});

module.exports = Cart;

// cart has many to many relationship with product
// cart has a one to one relationship with user