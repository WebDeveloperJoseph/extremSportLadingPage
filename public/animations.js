/**
 * Sistema de Animações Avançadas
 * Usa Intersection Observer para animar elementos ao entrar no viewport
 */

// Intersection Observer para ativar animações
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Desobservar após animar para melhor performance
            animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todos os elementos com data-animate
document.querySelectorAll('[data-animate]').forEach(element => {
    animationObserver.observe(element);
});

// Animação de contagem para números (ex: estatísticas)
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Detectar quando números entram em viewport e animar
const numberElements = document.querySelectorAll('[data-counter]');
numberElements.forEach(element => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-counter'));
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(element);
});

// Efeito de parallax suave ao scroll
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
        const scrollPosition = window.pageYOffset;
        const elementOffset = element.offsetTop;
        const distance = scrollPosition - elementOffset;
        const parallaxValue = distance * 0.5;
        
        element.style.transform = `translateY(${parallaxValue}px)`;
    });
});

// Animação de entrada em cascata para grids
function staggerAnimation() {
    const cards = document.querySelectorAll('.product-card, .highlight-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInScale 0.6s ease-out ${index * 0.1}s backwards`;
    });
}

// Executar ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', staggerAnimation);
} else {
    staggerAnimation();
}

// Efeito de onda ao clicar em botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Detectar preferência de movimento reduzido
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('[data-animate]').forEach(el => {
        el.style.animation = 'none';
        el.classList.add('visible');
    });
}

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

console.log('✨ Sistema de animações avançadas ativado!');
