function renderCart(container) {
    // 1. Limpieza y Título
    container.innerHTML = '';
    
    const title = document.createElement('h1');
    title.textContent = 'Carrito de Compras';
    title.style.marginBottom = '1.5rem';
    container.appendChild(title);

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // 2. Estado Vacío
    if (cart.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.innerHTML = `
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">Tu carrito está vacío.</p>
            <a href="#/products" class="btn">Ver Productos</a>
        `;
        container.appendChild(emptyMessage);
        return;
    }

    // 3. Crear Estructura de Wrapper (Layout de 2 columnas)
    const wrapper = document.createElement('div');
    wrapper.className = 'cart-wrapper';

    // --- COLUMNA IZQUIERDA: ITEMS ---
    const itemsList = document.createElement('div');
    itemsList.className = 'cart-items-list';

    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        
        itemRow.innerHTML = `
            <div class="item-details">
                <strong>${item.name}</strong>
                <small>Precio: $${item.price.toFixed(2)} | Cant: ${item.quantity}</small>
            </div>
            <div style="display:flex; align-items:center;">
                <span class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;

        // Botón Eliminar (Pequeño y discreto)
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger';
        removeBtn.innerHTML = '&times;'; // Icono de X
        removeBtn.style.padding = '0.4rem 0.8rem';
        removeBtn.title = "Eliminar producto";
        removeBtn.onclick = () => removeFromCart(item.id);

        itemRow.children[1].appendChild(removeBtn); // Agregar botón al div de la derecha
        itemsList.appendChild(itemRow);
    });

    // --- COLUMNA DERECHA: RESUMEN Y ACCIONES ---
    
    // Cálculos
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const iva = subtotal * 0.16; // IVA 16%
    const total = subtotal + iva;

    const summaryCard = document.createElement('div');
    summaryCard.className = 'cart-summary-card';

    summaryCard.innerHTML = `
        <h3 class="cart-summary-title">Resumen del Pedido</h3>
        
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>IVA (16%)</span>
            <span>$${iva.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>

        <div class="summary-actions">
            <button id="btn-checkout" class="btn btn-checkout">
                Pagar y Facturar 🧾
            </button>
            
            <button id="btn-clear" class="btn btn-outline-danger">
                Vaciar Carrito
            </button>
        </div>
    `;

    // 4. Ensamblaje
    wrapper.appendChild(itemsList);
    wrapper.appendChild(summaryCard);
    container.appendChild(wrapper);

    // 5. Event Listeners (Conectar lógica)
    document.getElementById('btn-checkout').addEventListener('click', () => initiateCheckout(cart));
    document.getElementById('btn-clear').addEventListener('click', clearCart);
}

// --- FUNCIONES QUE TE FALTABAN ---

// 1. Conecta el botón con el Backend
async function initiateCheckout(cart) {
    // Pedir datos (en un caso real usarías un modal bonito, por ahora prompt es funcional)
    const clientName = prompt("Nombre / Razón Social:") || "Público en General";
    const rfc = prompt("RFC:") || "XAXX010101000";

    if (!confirm(`¿Confirmar compra por un total de $${calculateTotal(cart)}?`)) return;

    // Feedback visual en el botón
    const btn = document.getElementById('btn-checkout');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Procesando... ⏳';
    btn.disabled = true;

    try {
        // FETCH AL BACKEND
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cart: cart,
                clientName: clientName,
                rfc: rfc
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en el servidor');
        }

        // SI TODO SALIÓ BIEN:
        // 1. Generar PDF
        generateInvoicePDF(clientName, rfc, cart, result.folio);
        
        // 2. Limpiar carrito
        localStorage.removeItem('cart');
        
        // 3. Avisar al usuario
        alert(`¡Venta Exitosa!\nFolio: ${result.folio}\nTu factura se ha descargado.`);
        
        // 4. Recargar vista (ahora vacía)
        const content = document.getElementById('content');
        if (content) renderCart(content);

    } catch (error) {
        console.error(error);
        alert("❌ Error: " + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Helper para calcular total rápido
function calculateTotal(cart) {
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    return (subtotal * 1.16).toFixed(2);
}

// 2. Genera el PDF (Diseño System Design: Vino y Dorado)
function generateInvoicePDF(clientName, rfc, cart, folio) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colores del System Design
    const colorVino = [86, 21, 48];    // #561530
    const colorDorado = [245, 173, 24]; // #F5AD18

    // --- ENCABEZADO ---
    doc.setFillColor(...colorVino);
    doc.rect(0, 0, 210, 40, 'F'); // Barra superior vino

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MINI TIENDA OFICIAL", 15, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Comprobante Fiscal Digital", 15, 30);

    // --- DATOS DEL CLIENTE ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Cliente: ${clientName}`, 15, 55);
    doc.text(`RFC: ${rfc}`, 15, 60);
    
    // --- DATOS DE LA VENTA ---
    doc.text(`Folio: ${folio}`, 140, 55);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 60);

    // --- TABLA DE PRODUCTOS ---
    const bodyData = cart.map(item => [
        item.name,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 70,
        head: [['Producto', 'Cant.', 'P. Unitario', 'Importe']],
        body: bodyData,
        theme: 'grid',
        headStyles: { 
            fillColor: colorVino, 
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: { fontSize: 10, cellPadding: 3 }
    });

    // --- TOTALES ---
    let finalY = doc.lastAutoTable.finalY + 10;
    const total = parseFloat(calculateTotal(cart));
    const subtotal = total / 1.16;
    const iva = total - subtotal;

    doc.setFontSize(10);
    doc.text(`Subtotal:`, 150, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });

    doc.text(`IVA (16%):`, 150, finalY + 6);
    doc.text(`$${iva.toFixed(2)}`, 195, finalY + 6, { align: 'right' });

    // Total en Dorado y Grande
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorDorado);
    doc.text(`TOTAL:`, 150, finalY + 16);
    doc.text(`$${total.toFixed(2)}`, 195, finalY + 16, { align: 'right' });

    // --- PIE DE PÁGINA ---
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento es una representación impresa de un CFDI simulado.", 105, 280, { align: 'center' });

    doc.save(`Factura_${folio}.pdf`);
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