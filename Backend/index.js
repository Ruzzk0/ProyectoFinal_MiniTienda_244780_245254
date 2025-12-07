const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./models/db');
const Product = require('./models/Product');
const productRoutes = require('./routes/products.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use(productRoutes);

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
});

// Inicializar base de datos y servidor
async function initializeServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados con la base de datos.');
    
    // Insertar datos de ejemplo si la tabla está vacía
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.bulkCreate([
        { name: 'Laptop HP', price: 899.99, stock: 10, description: 'Laptop HP con 8GB RAM y 256GB SSD', imageURL: 'assets/laptopHp.jpg'},
        { name: 'Mouse Inalámbrico', price: 29.99, stock: 25, description: 'Mouse inalámbrico ergonómico', imageURL: 'assets/mouseInalambrico.jpeg' },
        { name: 'Teclado Mecánico', price: 79.99, stock: 15, description: 'Teclado mecánico RGB', imageURL: 'assets/tecladoMecanico.jpeg' },
        { name: 'Monitor 24"', price: 199.99, stock: 8, description: 'Monitor Full HD 24 pulgadas', imageURL: 'assets/monitor24.jpg' },
        { name: 'Auriculares Bluetooth', price: 59.99, stock: 20, description: 'Auriculares con cancelación de ruido', imageURL: 'assets/audifonosBluetooth.jpg' }
      ]);
      console.log('Datos de ejemplo insertados.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
  }
}

initializeServer();