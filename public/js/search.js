// Sistema de Busca e Filtros na Loja
// API_BASE já definido globalmente

document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
    setupCategoryFilters();
});

function setupSearch() {
    // Desktop Search
    const desktopSearchInput = document.querySelector('.search-box input[type="search"]');
    const desktopSearchButton = document.querySelector('.search-box button');

    // Mobile Search
    const mobileSearchInput = document.querySelector('.mobile-search-bar input[type="search"]');
    const mobileSearchButton = document.querySelector('.mobile-search-bar button');

    // Setup Desktop Search
    if (desktopSearchInput && desktopSearchButton) {
        desktopSearchButton.addEventListener('click', performSearch);
        desktopSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Auto-complete suggestion on input
        desktopSearchInput.addEventListener('input', function(e) {
            showSearchSuggestions(e.target.value);
        });
    }

    // Setup Mobile Search
    if (mobileSearchInput && mobileSearchButton) {
        mobileSearchButton.addEventListener('click', performSearch);
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Auto-complete suggestion on input
        mobileSearchInput.addEventListener('input', function(e) {
            showSearchSuggestions(e.target.value);
        });
    }

    // Sincronizar os dois inputs
    if (desktopSearchInput && mobileSearchInput) {
        desktopSearchInput.addEventListener('input', function() {
            mobileSearchInput.value = this.value;
        });
        mobileSearchInput.addEventListener('input', function() {
            desktopSearchInput.value = this.value;
        });
    }
}

async function showSearchSuggestions(term) {
    if (!term || term.length < 2) return;

    try {
        const products = await getProducts();
        const suggestions = products
            .filter(p => p.active && (
                p.name.toLowerCase().includes(term.toLowerCase()) ||
                p.category.toLowerCase().includes(term.toLowerCase())
            ))
            .slice(0, 5)
            .map(p => p.name);

        // Aqui você pode mostrar sugestões em uma dropdown se quiser
        console.log('Sugestões:', suggestions);
    } catch (e) {
        console.error('Erro ao buscar sugestões:', e);
    }
}

async function performSearch() {
    const searchInput = document.querySelector('.search-box input[type="search"]') || 
                       document.querySelector('.mobile-search-bar input[type="search"]');
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        loadPublicProducts();
        showNotification('⚠️ Digite algo para buscar', 'warning');
        return;
    }

    try {
        const products = await getProducts();
        const filtered = products.filter(p => 
            p.active && (
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            )
        );

        if (filtered.length === 0) {
            showNoResults(searchTerm);
            showNotification(`❌ Nenhum produto encontrado para "${searchTerm}"`, 'error');
        } else {
            renderPublicProducts(filtered);
            showNotification(`📦 ${filtered.length} produto(s) encontrado(s)!`, 'success');
            
            // Scroll para os resultados
            setTimeout(() => {
                document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    } catch (e) {
        console.error('Erro ao buscar:', e);
        showNotification('❌ Erro ao buscar produtos', 'error');
        showNotification('❌ Erro ao buscar produtos', 'error');
    }
}

function showNoResults(searchTerm) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div style="font-size: 5rem; margin-bottom: 20px;">🔍</div>
            <h2 style="color: #666; margin-bottom: 15px;">Nenhum produto encontrado</h2>
            <p style="color: #999; margin-bottom: 20px;">
                Não encontramos produtos para "${searchTerm}"
            </p>
            <button onclick="clearSearch()" class="btn-primary" style="display: inline-block; padding: 12px 30px;">
                Ver Todos os Produtos
            </button>
        </div>
    `;
}

function clearSearch() {
    const searchInput = document.querySelector('.search-box input[type="search"]');
    if (searchInput) searchInput.value = '';
    loadPublicProducts();
}

function setupCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.card-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.highlight-card');
            const categoryTitle = card.querySelector('h3').textContent.toLowerCase();
            
            filterByCategory(categoryTitle);
            
            // Scroll para produtos
            document.getElementById('ofertas').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

async function filterByCategory(categoryName) {
    const categoryMap = {
        'mochilas': 'mochilas',
        'canetas': 'canetas',
        'cadernos': 'cadernos',
        'estojos': 'estojos'
    };

    const category = categoryMap[categoryName];
    
    if (!category) {
        loadPublicProducts();
        return;
    }

    try {
        const products = await getProducts();
        const filtered = products.filter(p => p.active && p.category === category);

        if (filtered.length === 0) {
            const productsGrid = document.querySelector('.products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <h3 style="color: #666;">Nenhum produto nesta categoria ainda</h3>
                    </div>
                `;
            }
        } else {
            renderPublicProducts(filtered);
            showNotification(`📦 ${filtered.length} produto(s) em ${categoryName}`, 'info');
        }
    } catch (e) {
        console.error('Erro ao filtrar:', e);
        showNotification('❌ Erro ao filtrar produtos', 'error');
    }
}

// Adicionar CSS para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.95rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-success {
        background-color: #98D447;
        color: white;
    }

    .notification-error {
        background-color: #dc3545;
        color: white;
    }

    .notification-warning {
        background-color: #ffc107;
        color: #333;
    }

    .notification-info {
        background-color: #17a2b8;
        color: white;
    }
`;
document.head.appendChild(notificationStyles);

window.clearSearch = clearSearch;
window.filterByCategory = filterByCategory;
