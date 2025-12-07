const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const sequelize = require('../models/db');

// POST /api/checkout - Procesar venta y restar stock
router.post('/api/checkout', async (req, res, next) => {
  // Iniciamos una transacción: O se guarda todo, o no se guarda nada (seguridad)
  const t = await sequelize.transaction();

  try {
    const { cart, clientName, rfc } = req.body;

    // Validación básica
    if (!cart || cart.length === 0) {
      throw new Error('El carrito está vacío');
    }

    let totalVenta = 0;

    // Recorremos cada producto del carrito
    for (const item of cart) {
      // Buscamos el producto en la DB bloqueándolo para esta transacción
      const product = await Product.findByPk(item.id, { transaction: t });

      // 1. Verificar si existe
      if (!product) {
        throw new Error(`El producto con ID ${item.id} no existe.`);
      }

      // 2. Verificar Stock
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para: ${product.name}. Disponibles: ${product.stock}`);
      }

      // 3. Restar Stock
      await product.update({ 
        stock: product.stock - item.quantity 
      }, { transaction: t });

      // Sumar al total (usamos precio de DB por seguridad)
      totalVenta += product.price * item.quantity;
    }

    // Si todo salió bien, confirmamos los cambios en la DB
    await t.commit();

    // Generamos un folio simple
    const folio = `FAC-${Date.now().toString().slice(-6)}`;

    // Respondemos al Frontend "Todo OK, genera el PDF con este folio"
    res.status(200).json({
      message: 'Venta exitosa',
      folio: folio,
      total: totalVenta,
      client: clientName
    });

  } catch (err) {
    // Si algo falló, deshacemos todos los cambios (nadie pierde stock)
    await t.rollback();
    
    // Retornamos error 400 (Bad Request)
    res.status(400).json({ message: err.message });
  }
});

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