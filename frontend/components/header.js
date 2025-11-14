function renderHeader(container) {
    const header = document.createElement('header');
    
    const nav = document.createElement('nav');
    
    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.textContent = '🛒 Mini Tienda';
    
    const navLinks = document.createElement('ul');
    navLinks.className = 'nav-links';
    
    const links = [
        { href: '#/products', text: 'Productos' },
        { href: '#/cart', text: 'Carrito' },
        { href: '#/stats', text: 'Estadísticas' }
    ];
    
    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        li.appendChild(a);
        navLinks.appendChild(li);
    });
    
    nav.appendChild(logo);
    nav.appendChild(navLinks);
    header.appendChild(nav);
    
    container.appendChild(header);
}