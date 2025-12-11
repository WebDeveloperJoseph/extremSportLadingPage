#!/usr/bin/env node

/**
 * Script para testar adição de banner EQUIPE
 * Execute: node adicionar-equipe.js
 */

const API_BASE = 'http://localhost:3333';

async function addEquipeBanner() {
  const bannerData = {
    image: '/assets/img/EQUIPE.jpeg',
    title: 'Conheça Nossa Equipe',
    subtitle: 'Profissionais dedicados ao seu sucesso',
    link: '',
    ord: 1,
    active: true
  };

  console.log('\n🎬 Adicionando banner EQUIPE...');
  console.log('📤 Dados:', JSON.stringify(bannerData, null, 2));

  try {
    const response = await fetch(`${API_BASE}/api/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerData)
    });

    console.log(`\n📡 Status HTTP: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('\n✅ Banner adicionado com sucesso!');
    console.log('📋 ID:', result.id);
    console.log('📸 Imagem:', result.image);
    console.log('📝 Título:', result.title);
    console.log('🔗 Status:', result.active ? 'ATIVO' : 'INATIVO');
    
    console.log('\n🎉 Acesse http://127.0.0.1:5500/ para ver o banner no carrossel!\n');

  } catch (e) {
    console.error('\n❌ Erro:', e.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. O servidor Node está rodando em http://localhost:3333');
    console.error('   2. Execute: npm start (na pasta server/)');
    process.exit(1);
  }
}

addEquipeBanner();
