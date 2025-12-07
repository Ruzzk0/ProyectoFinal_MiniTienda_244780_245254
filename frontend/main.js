// Router principal main.js
function router() {
    const app = document.getElementById('app');
    
    // Limpiar aplicación
    app.innerHTML = '';
    
    // Renderizar header
    renderHeader(app);
    
    // Crear contenedor de contenido principal
    const content = document.createElement('div');
    content.id = 'content';
    content.className = 'content';
    app.appendChild(content);
    
    // Determinar vista basada en el hash
    const hash = window.location.hash;
    
    switch (hash) {
        case '#/cart':
            renderCart(content);
            break;
        case '#/stats':
            renderStats(content);
            break;
        case '#/products':
        default:
            // Redirigir a productos si no hay hash o es inválido
            if (!hash || hash === '#/') {
                window.location.hash = '#/products';
            } else {
                renderProductsList(content);
            }
            break;
    }
}

// Inicializar aplicación cuando se carga la página
window.addEventListener('load', router);

// Manejar cambios en el hash (navegación)
window.addEventListener('hashchange', router);