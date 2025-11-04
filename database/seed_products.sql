-- SEED: Produtos iniciais (sem imagem_url)
-- Execute no SQL Editor do Supabase

INSERT INTO produtos (nome, descricao, preco, emoji, destaque)
VALUES
  ('Chuteira Profissional Branca', 'Chuteira de alta performance para campo', 349.90, '⚽', true),
  ('Chuteira Performance Verde', 'Conforto e tração para jogo intenso', 389.90, '⚽', true),
  ('Kit Chuteiras Premium', 'Conjunto completo para treino e jogo', 699.90, '👟', true),
  ('Luva de Goleiro Pro', 'Proteção e aderência máximas', 179.90, '🧤', true),
  ('Par de Luvas Goleiro Elite', 'Tecnologia anti-impacto e grip superior', 299.90, '🥅', true),
  ('Camisa Esportiva Premium', 'Tecido Dry-Fit respirável', 149.90, '👕', true),
  ('Camisa Treino Profissional', 'Design moderno e alta durabilidade', 139.90, '👕', true),
  ('Skate Profissional', 'Skate completo para manobras radicais', 499.90, '🛹', false),
  ('Capacete Extreme', 'Proteção máxima para esportes radicais', 299.90, '⛑️', false);

-- Após executar este seed, use o painel admin (Produtos) para editar cada produto
-- e fazer upload das imagens. O sistema salvará automaticamente a imagem no
-- bucket 'produtos' e atualizará a coluna imagem_url.
