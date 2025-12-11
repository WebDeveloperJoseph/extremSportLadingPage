/**
 * Melhorias de UX/UI para Admin Dashboard
 * Responsividade aprimorada e interações suaves
 */

document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile
    setupMobileMenu();
    
    // Ripple effect nos botões
    addRippleEffect();
    
    // Smooth transitions
    setupTransitions();
});

// Menu hamburger para mobile
function setupMobileMenu() {
    // Se houver um botão de menu, adicionar funcionalidade
    const menuToggle = document.querySelector('.menu-toggle-mobile');
    const sidebarNav = document.querySelector('.sidebar-nav');
    
    if (menuToggle && sidebarNav) {
        menuToggle.addEventListener('click', () => {
            sidebarNav.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.admin-sidebar') && !e.target.closest('.menu-toggle-mobile')) {
                sidebarNav.classList.remove('active');
            }
        });
    }
}

// Efeito de ripple nos botões
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-action, .quick-action-btn, button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple-animation 0.6s ease-out';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Setup transições suaves
function setupTransitions() {
    // Prevenir layout shifts
    document.querySelectorAll('.dashboard-card, .stat-card').forEach(card => {
        card.style.willChange = 'transform, box-shadow';
    });
    
    // Lazy loading de imagens se houver
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Animação de ripple em CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        from {
            transform: scale(0);
            opacity: 0.6;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .dashboard-card,
    .stat-card {
        animation: fadeIn 0.4s ease-out;
    }
    
    .orders-table tbody tr {
        transition: background-color 0.2s ease;
    }
    
    .orders-table tbody tr:hover {
        background-color: #f9fafb;
    }
`;
document.head.appendChild(style);

// Função para atualizar cores dinamicamente
function updateThemeColor(primaryColor, secondaryColor) {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--secondary', secondaryColor);
}

// Função para toggle de modo escuro (opcional)
function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark-mode');
    
    if (html.classList.contains('dark-mode')) {
        localStorage.setItem('adminDarkMode', 'true');
    } else {
        localStorage.removeItem('adminDarkMode');
    }
}

// Verificar tema salvo
window.addEventListener('load', () => {
    if (localStorage.getItem('adminDarkMode') === 'true') {
        document.documentElement.classList.add('dark-mode');
    }
});

// Função para scroll suave
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Função de confirmação com estilo
function confirmAction(message) {
    return confirm(`⚠️ ${message}`);
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInUp 0.3s ease;
        max-width: 300px;
        border-left: 4px solid #98D447;
    `;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.borderLeftColor = colors[type] || colors.info;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('✅ Melhorias de UX/UI carregadas!');
