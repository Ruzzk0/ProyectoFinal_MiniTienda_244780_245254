# MiniTienda - Proyecto Final (Temas Emergentes de Aplicaciones Web)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Terminado-success)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)

La **MiniTienda** es una aplicación web moderna que simula una tienda en línea, desarrollada con Express, Sequelize, MySQL y JavaScript vanilla.

## Características

- **Backend**: API REST con Express y Sequelize
- **Base de datos**: MySQL con modelos Sequelize
- **Frontend**: Microfrontends con JavaScript vanilla
- **Enrutamiento**: Del lado del cliente usando hash routing
- **Almacenamiento**: localStorage para el carrito de compras
- **Manejo de errores**: Tanto en frontend como backend

## Estructura del Proyecto
El proyecto está organizado en dos módulos principales: Cliente y Servidor.

```text
ProyectoFinal_MiniTienda_244780/
├── backend/                  # API REST y Lógica de Negocio
│   ├── models/
│   │   ├── db.js             # Conexión a Base de Datos
│   │   └── Product.js        # Modelo Sequelize
│   ├── routes/
│   │   └── products.routes.js # Endpoints (CRUD + Checkout)
│   ├── index.js              # Punto de entrada del servidor
│   └── package.json
│
└── frontend/                 # Interfaz de Usuario
    ├── assets/               # Imágenes de productos (jpg/png)
    ├── components/           # Microfrontends (Lógica modular)
    │   ├── header.js
    │   ├── productsList.js
    │   └── cartStats.js      # Lógica del carrito y PDF
    ├── styles.css            # Estilos globales (Clean UI)
    ├── index.html            # Entry point
    └── main.js               # Router principal (Hash Routing)
