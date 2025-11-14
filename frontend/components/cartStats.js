function renderCart(container) {
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear título
    const title = document.createElement('h1');
    title.textContent = 'Carrito de Compras';
    container.appendChild(title);
    
    // Obtener carrito del localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Tu carrito está vacío.';
        container.appendChild(emptyMessage);
        return;
    }
    
    // Crear contenedor de items del carrito
    const cartContainer = document.createElement('div');
    cartContainer.className = 'cart-items';
    
    // Crear items del carrito
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemInfo = document.createElement('div');
        itemInfo.innerHTML = `
            <div><strong>${item.name}</strong></div>
            <div>Precio: $${item.price.toFixed(2)}</div>
            <div>Cantidad: ${item.quantity}</div>
            <div>Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
        `;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-danger';
        removeButton.textContent = 'Eliminar';
        removeButton.addEventListener('click', () => removeFromCart(item.id));
        
        cartItem.appendChild(itemInfo);
        cartItem.appendChild(removeButton);
        cartContainer.appendChild(cartItem);
    });
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
    
    // Botón para vaciar carrito
    const clearButton = document.createElement('button');
    clearButton.className = 'btn btn-danger';
    clearButton.textContent = 'Vaciar Carrito';
    clearButton.addEventListener('click', clearCart);
    
    container.appendChild(cartContainer);
    container.appendChild(totalDiv);
    container.appendChild(clearButton);
}

function renderStats(container) {
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear título
    const title = document.createElement('h1');
    title.textContent = 'Estadísticas';
    container.appendChild(title);
    
    // Crear contenedor de estadísticas
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    
    // Obtener carrito del localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Calcular estadísticas del carrito
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const uniqueProducts = cart.length;
    
    // Crear tarjetas de estadísticas
    const stats = [
        { label: 'Productos en Carrito', value: totalItems },
        { label: 'Valor Total', value: `$${totalValue.toFixed(2)}` },
        { label: 'Productos Únicos', value: uniqueProducts }
    ];
    
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        
        statCard.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        
        statsContainer.appendChild(statCard);
    });
    
    container.appendChild(statsContainer);
    
    // Agregar estadísticas de productos desde la API
    fetchProductStats(container);
}

async function fetchProductStats(container) {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        // Calcular estadísticas de productos
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
        const averagePrice = products.length > 0 
            ? products.reduce((sum, product) => sum + product.price, 0) / products.length 
            : 0;
        
        // Crear contenedor para estadísticas de productos
        const productStatsContainer = document.createElement('div');
        productStatsContainer.className = 'stats-container';
        productStatsContainer.style.marginTop = '2rem';
        
        const productStats = [
            { label: 'Total de Productos', value: totalProducts },
            { label: 'Stock Total', value: totalStock },
            { label: 'Precio Promedio', value: `$${averagePrice.toFixed(2)}` }
        ];
        
        productStats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            
            statCard.innerHTML = `
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            
            productStatsContainer.appendChild(statCard);
        });
        
        container.appendChild(productStatsContainer);
        
    } catch (error) {
        console.error('Error al cargar estadísticas de productos:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'No se pudieron cargar las estadísticas de productos.';
        errorDiv.style.marginTop = '2rem';
        container.appendChild(errorDiv);
    }
}

function removeFromCart(productId) {
    if (window.confirm('¿Seguro que quieres eliminar este producto del carrito?')) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Recargar la vista del carrito
        const content = document.getElementById('content');
        if (content) {
            renderCart(content);
        }
    }
}

function clearCart() {
    if (window.confirm('¿Seguro que quieres vaciar todo el carrito?')) {
        localStorage.removeItem('cart');
        
        // Recargar la vista del carrito
        const content = document.getElementById('content');
        if (content) {
            renderCart(content);
        }
    }
}