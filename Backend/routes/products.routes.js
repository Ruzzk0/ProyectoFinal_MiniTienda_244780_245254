const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Obtener todos los productos
router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/api/products', async (req, res, next) => {
  try {
    const { name, price, stock, description } = req.body;
    const product = await Product.create({ name, price, stock, description });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Actualizar un producto
router.put('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const { name, price, stock, description } = req.body;
    await product.update({ name, price, stock, description });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Eliminar un producto
router.delete('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await product.destroy();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;