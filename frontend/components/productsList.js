async function renderProductsList(container) {
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear título
    const title = document.createElement('h1');
    title.textContent = 'Nuestros Productos';
    container.appendChild(title);
    
    // Crear contenedor de productos
    const productsContainer = document.createElement('div');
    productsContainer.className = 'products-grid';
    container.appendChild(productsContainer);
    
    try {
        // Mostrar mensaje de carga
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Cargando productos...';
        productsContainer.appendChild(loading);
        
        // Obtener productos de la API
        const response = await fetch('http://localhost:3000/api/products');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        // Limpiar mensaje de carga
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No hay productos disponibles.';
            productsContainer.appendChild(emptyMessage);
            return;
        }
        
        // Crear tarjetas de productos
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock">Stock: ${product.stock}</div>
                <div class="product-description">${product.description || 'Sin descripción'}</div>
                <button class="btn add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    Agregar al Carrito
                </button>
            `;
            
            productsContainer.appendChild(productCard);
        });
        
        // Agregar event listeners a los botones
        const addToCartButtons = productsContainer.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        
        // Mostrar mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Ocurrió un error al cargar los productos. Intente de nuevo más tarde.';
        productsContainer.innerHTML = '';
        productsContainer.appendChild(errorDiv);
    }
}

function addToCart(event) {
    const button = event.target;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));
    
    // Obtener carrito actual del localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Incrementar cantidad si ya existe
        existingItem.quantity += 1;
    } else {
        // Agregar nuevo producto al carrito
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    // Guardar carrito actualizado en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar confirmación
    window.alert(`"${productName}" agregado al carrito.`);
}