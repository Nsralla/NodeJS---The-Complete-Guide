const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('shop', 'root', 'jj137157177jj', {
  host: 'localhost',
  dialect: 'mysql' // or 'postgres', 'sqlite', 'mariadb', 'mssql'
});

module.exports = sequelize;
