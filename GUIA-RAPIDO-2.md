# 🚀 GUIA RÁPIDO - MERCADO PRETINHO

## ⚡ Iniciar Rápido

```bash
# 1. Abra o terminal e rode:
node server/src/index.js

# 2. Abra no navegador:
http://localhost:3333

# Pronto! 🎉
```

---

## 📍 Navegação Rápida

| O que fazer | Link |
|---|---|
| Ver a loja | http://localhost:3333/index.html |
| Gerenciar produtos | http://localhost:3333/admin/produtos.html |
| Criar promoção | http://localhost:3333/admin/produtos.html *(editar produto)* |
| Ver promoções | http://localhost:3333/admin/promocoes.html |
| Gerenciar banners | http://localhost:3333/admin/banners.html |
| Selecionar destaques | http://localhost:3333/admin/destaques.html |
| Dashboard completo | http://localhost:3333/admin/dashboard.html |

---

## 🎯 Tarefas Comuns

### ✨ Criar um Produto
```
1. Vá para: Admin → Produtos
2. Clique: ➕ Novo Produto
3. Preencha:
   ✓ Nome do produto
   ✓ Descrição (optional)
   ✓ Categoria (mochilas, canetas, etc)
   ✓ Preço Antigo: 50.00
   ✓ Preço Atual: 35.00
   ✓ Imagem (upload)
   ✓ Estoque
   ✓ Marque "Ativo"
4. Clique: Salvar
5. ✅ Pronto! Produto aparece na homepage
```

### 💰 Criar uma Promoção
```
Opção 1: Ao criar o produto
 • Preço Antigo: R$ 50.00
 • Preço Atual: R$ 35.00
 • Desconto é calculado: 30%

Opção 2: Editar produto existente
 • Admin → Produtos
 • Clique em "Editar"
 • Altere os preços
 • Clique "Salvar"
```

### 🎨 Criar um Banner
```
1. Admin → Banners
2. Clique: ➕ Novo Banner
3. Informe:
   ✓ Imagem (URL ou upload)
   ✓ Título
   ✓ Subtítulo
   ✓ Link (optional)
   ✓ Ordem (1, 2, 3...)
   ✓ Ativo: SIM
4. Clique: Salvar
5. ✅ Banner aparece no topo da homepage
```

### ⭐ Selecionar Destaques
```
1. Admin → Destaques
2. Selecione até 6 produtos para cada seção:
   • Mais Vendidos
   • Novidades
   • Promoções
3. Clique: Salvar Destaques
4. ✅ Carrosseis aparecem na homepage
```

### 👀 Ver Todas as Promoções
```
1. Admin → Promoções
2. Vê todos os produtos com desconto
3. Mostrar: Preço antigo, novo e desconto %
4. Remover: Clique "Remover Promo"
```

---

## 🔧 Troubleshooting Rápido

### ❌ Produtos não aparecem
```
☐ Servidor está rodando? (terminal aberto?)
☐ Produtos marcados como "Ativo"?
☐ Recarregue a página (Ctrl+F5)
☐ Abra o console (F12) e procure por erros
```

### ❌ Imagens não carregam
```
☐ Arquivo foi enviado com sucesso?
☐ Pasta /server/uploads/ existe?
☐ Tente re-fazer upload
☐ Verifique tamanho (máx 5MB)
```

### ❌ Destaques não aparecem
```
☐ Vá para Admin → Destaques
☐ Selecione produtos
☐ Clique "Salvar"
☐ Recarregue homepage
```

### ❌ Admin não carrega
```
☐ Servidor rodando?
☐ Porta 3333 disponível?
☐ F5 para recarregar
☐ Ctrl+Shift+Delete para limpar cache
```

---

## 💡 Dicas Importantes

### ✅ Produtos
- Use preço antigo e atual para criar promoção
- Imagem em formato PNG/JPG funciona melhor
- Stock negativo = infinito
- Sempre marque "Ativo" para aparecer

### ✅ Banners
- Imagem deve ser em 16:9 (1920x1080, 1280x720, etc)
- Link vazio = banner sem ação
- Ordem controla sequência no carrossel
- Auto-rotate a cada 5 segundos

### ✅ Destaques
- Até 6 produtos por carrossel
- Se vazio, mostra todos ativos
- Prioriza produtos selecionados
- Carousel de Promoções mostra produtos com desconto

### ✅ Responsive
- Desktop: 3 colunas
- Tablet: 2 colunas  
- Mobile: 1 coluna
- Carrosseis rolam em mobile

---

## 📊 Dados Úteis

### Preços - Como funciona
```
Preço Antigo: R$ 100.00 (de)
Preço Atual:  R$  75.00 (por)
Desconto %:   (100-75)/100 = 25%

Badge no card: "-25%"
Preço exibido: ~~100~~ → 75 (verde)
```

### Banco de Dados
```
Arquivo: server/data/pretinho.db
Tipo: SQLite
Criado automaticamente
Backup: Faça cópia de pretinho.db
```

### Upload de Imagens
```
Pasta: server/uploads/
Aceita: JPEG, PNG, WebP
Máximo: 5MB
Caminho na URL: http://localhost:3333/server/uploads/...
```

---

## 🎨 Customizar Cores

Arquivo: `style.css`

```css
:root {
    --cor-laranja: #FF8C00;     /* Cor principal */
    --cor-verde: #98D447;       /* Cor secundária */
    --cor-laranja-hover: #e67e00;
    --cor-verde-hover: #7ab836;
    --cor-cinza-claro: #f4f4f4;
}
```

Altere os códigos HEX para suas cores!

---

## 📞 Links de Referência

- **Express.js**: https://expressjs.com/
- **SQLite**: https://www.sqlite.org/
- **Multer**: https://github.com/expressjs/multer
- **Cores HEX**: https://htmlcolorcodes.com/

---

## ✨ Funcionalidades Escondidas

### Página de Testes
```
http://localhost:3333/teste-sistema.html
Testa todos os endpoints da API
```

### Console Log
```
Abra F12 → Console
Vê mensagens de debug
Útil para troubleshooting
```

### LocalStorage
```
F12 → Application → Local Storage
Vê dados do carrinho
Vê configurações salvas
```

---

## 🚀 Próximos Passos

Depois de dominar o básico:

- [ ] Adicione checkout com pagamento
- [ ] Implemente autenticação de usuário
- [ ] Crie sistema de avaliações
- [ ] Adicione WhatsApp API para pedidos
- [ ] Integre com redes sociais
- [ ] Crie mobile app

---

## 📖 Documentação Completa

Para guias detalhados:
- `MANUAL-COMPLETO.md` - Guia de uso completo
- `IMPLEMENTACAO-COMPLETA.md` - O que foi implementado
- `CHECKLIST-FINAL.md` - Checklist de features
- `DIAGRAMA-FLUXO.txt` - Diagramas visuais

---

## 🎊 Você está pronto!

Comece a usar o sistema:
1. ✅ Inicie o servidor
2. ✅ Abra http://localhost:3333/index.html
3. ✅ Crie um produto
4. ✅ Veja aparecer na homepage
5. 🎉 Pronto!

**Divirta-se! 🚀**
