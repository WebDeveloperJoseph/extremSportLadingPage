// Script para carregar produtos no painel admin via localStorage
// Executar ANTES do admin-produtos.js

console.log('✅ [load-products-admin.js] Carregado');

// Expor função global para simular os dados
window.loadProductsFromStorage = function() {
    console.log('🔍 [loadProductsFromStorage] Buscando produtos no localStorage...');
    
    const cached = localStorage.getItem('allProducts');
    if (cached) {
        try {
            const products = JSON.parse(cached);
            console.log(`✅ Encontrados ${products.length} produtos no localStorage`);
            console.log('📦 Produtos:', products);
            
            // Exponha globalmente para admin-produtos.js
            window.products = products;
            window.PRODUCTS_DATA = products;
            
            return products;
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
        }
    }
    
    console.warn('⚠️ Nenhum produto em cache');
    return [];
};

// Tentar carregar assim que esse script executa
window.loadProductsFromStorage();
