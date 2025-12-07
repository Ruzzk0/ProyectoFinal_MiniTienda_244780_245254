const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 🔥 AQUÍ AGREGAMOS LA COLUMNA QUE FALTA 🔥
  imageURL: {
    type: DataTypes.STRING,
    allowNull: true, // Permitimos que sea nulo por si acaso
    defaultValue: 'assets/placeholder.jpg' // Imagen por defecto
  }
}, {
  tableName: 'products',
  timestamps: true
});

module.exports = Product;