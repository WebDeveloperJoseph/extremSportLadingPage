# 🛍️ Mercado Pretinho - Sistema Completo de E-commerce

## ✅ Status do Projeto

O sistema está **100% funcional** com todos os recursos de gerenciamento implementados:

- ✅ **Gerenciamento de Produtos** - Criar, editar, deletar produtos com imagens
- ✅ **Sistema de Banners** - Gerenciar banners promocionais na homepage
- ✅ **Carrosseis de Destaque** - Selecionar produtos para aparecer em carrosseis
- ✅ **Promoções** - Marcar produtos com desconto e gerenciar via admin
- ✅ **Sincronização em Tempo Real** - Produtos aparecem imediatamente no site
- ✅ **Upload de Imagens** - Sistema completo com Multer
- ✅ **Responsividade** - Desktop, tablet e mobile

---

## 🚀 Como Usar o Sistema

### 1️⃣ **Iniciando o Servidor**

```bash
# No terminal, na pasta do projeto:
node server/src/index.js

# Ou use o arquivo de inicialização rápida:
start-server.bat
```

O servidor estará rodando em: **http://localhost:3333**

### 2️⃣ **Acessando o Admin**

Acesse: **http://localhost:3333/admin/dashboard.html**

O painel admin tem 7 abas principais:

#### 📊 **Dashboard**
- Visão geral do negócio
- Links rápidos para todas as seções

#### 📦 **Produtos**
- Criar novos produtos
- Editar informações (nome, descrição, preços, categoria, imagem)
- Definir desconto (% de desconto)
- Ativar/desativar produtos
- Deletar produtos

**Como adicionar um produto:**
1. Clique em "➕ Novo Produto"
2. Preencha: Nome, Descrição, Categoria
3. Selecione uma imagem (vai fazer upload automático)
4. Defina os preços:
   - **Preço Antigo** = preço original (antes da promoção)
   - **Preço Atual** = preço que o cliente paga
   - O desconto % é calculado automaticamente
5. Escolha a categoria
6. Defina o estoque
7. Marque como "Ativo" se quiser que apareça no site
8. Clique "Salvar"

#### 🖼️ **Banners**
- Criar banners promocionais que aparecem no topo da homepage
- Cada banner tem:
  - **Imagem** (URL ou upload)
  - **Título** e **Subtítulo**
  - **Link** (opcional, pode ser URL ou âncora como #ofertas)
  - **Ordem** (controla a sequência)
  - **Ativo/Inativo**

**Como adicionar um banner:**
1. Clique "➕ Novo Banner"
2. Informe a imagem (URL)
3. Digite título e subtítulo
4. Defina a ordem (1, 2, 3...)
5. Marque como ativo
6. Clique "Salvar"

#### ⭐ **Destaques**
- Selecione até 6 produtos para cada carrossel
- 3 carrosseis disponíveis:
  - **Mais Vendidos**
  - **Novidades**
  - **Promoções**

**Como gerenciar destaques:**
1. Vá para "Destaques"
2. Selecione até 6 produtos para cada carrossel
3. Clique "Salvar Destaques"
4. Os produtos aparecerão nos carrosseis da homepage

#### 🎉 **Promoções**
- Gerencia todos os produtos com desconto
- Mostra o preço antigo, novo e a % de desconto
- Permite remover a promoção de um produto

**Como gerenciar promoções:**
1. Vá para "Promoções"
2. Veja todos os produtos em promoção
3. Clique "Editar" para mudar os preços
4. Clique "Remover Promo" para desfazer o desconto

#### 📁 **Categorias**
- Gerenciar categorias de produtos
- Padrão: mochilas, canetas, cadernos, estojos

#### ⚙️ **Configurações**
- Configurações gerais do sistema

---

## 📱 Página Pública (Homepage)

Acesse: **http://localhost:3333/index.html**

A homepage mostra:

1. **Hero Section** - Banner principal com call-to-action
2. **Banner Carousel** - Carrossel com banners gerenciados no admin
3. **Categorias em Destaque** - Cards das 4 categorias principais
4. **Grid de Produtos** - Todos os produtos ativos
5. **3 Carrosseis:**
   - Mais Vendidos (produtos selecionados ou todos se vazio)
   - Novidades (produtos selecionados ou todos se vazio)
   - Promoções (produtos com desconto, ou todos se nenhum em promoção)

---

## 🔄 Fluxo de Trabalho Recomendado

### Para um lançamento de promoção:

1. **Crie os produtos** na aba "Produtos"
   - Nome, descrição, imagem, categoria, estoque, ativo

2. **Defina os preços** (na mesma tela ou editando depois)
   - Preço Antigo (original)
   - Preço Atual (com desconto)
   - O desconto % é automático

3. **Selecione produtos especiais** na aba "Destaques"
   - Escolha até 6 para o carrossel de Promoções
   - Escolha até 6 para o carrossel de Mais Vendidos
   - Escolha até 6 para o carrossel de Novidades

4. **Crie banners** na aba "Banners"
   - Imagem promocional
   - Texto atrativo
   - Link para seção de ofertas

5. **Acompanhe** na aba "Promoções"
   - Veja todos os produtos em desconto
   - Confirme preços e descontos

---

## 🗂️ Estrutura de Pastas

```
mercado-pretinho/
├── server/
│   ├── src/
│   │   ├── index.js           # Servidor Express principal
│   │   ├── db.js              # Configuração SQLite + Prisma
│   │   └── routes/            # Endpoints da API
│   │       ├── products.js    # CRUD de produtos
│   │       ├── banners.js     # CRUD de banners
│   │       ├── featured.js    # Gerenciamento de destaques
│   │       └── ...
│   ├── data/
│   │   └── pretinho.db        # Banco de dados (criado automaticamente)
│   └── uploads/               # Imagens dos produtos
│
├── public/
│   ├── index.html             # Homepage pública
│   ├── style.css              # Estilos globais
│   ├── carrinho.html          # Página do carrinho
│   ├── js/
│   │   ├── products.js        # Carregamento de produtos
│   │   ├── home.js            # Lógica da homepage
│   │   ├── admin-*.js         # Lógica das páginas admin
│   │   └── ...
│   └── ...
│
├── admin/
│   ├── dashboard.html         # Painel principal
│   ├── produtos.html          # Gerenciamento de produtos
│   ├── banners.html           # Gerenciamento de banners
│   ├── destaques.html         # Seleção de destaques
│   ├── promocoes.html         # Gerenciamento de promoções
│   ├── admin.css              # Estilos do admin
│   └── ...
│
├── assets/img/                # Imagens estáticas
├── package.json               # Dependências do projeto
└── README.md
```

---

## 🔌 API Endpoints

### Produtos
- `GET /api/products` - Listar todos
- `POST /api/products` - Criar novo
- `PUT /api/products/:id` - Editar
- `DELETE /api/products/:id` - Deletar

### Banners
- `GET /api/banners` - Listar todos
- `POST /api/banners` - Criar novo
- `PUT /api/banners/:id` - Editar
- `DELETE /api/banners/:id` - Deletar

### Destaques
- `GET /api/featured-groups` - Listar seleções
- `PUT /api/featured-groups` - Atualizar seleções

### Upload
- `POST /api/upload` - Upload de imagem (multipart/form-data)

---

## 🎨 Customização

### Alterar cores do site:
Edite as variáveis CSS no início de `style.css`:

```css
:root {
    --cor-laranja: #FF8C00;    /* Cor principal */
    --cor-verde: #98D447;       /* Cor secundária */
    --cor-laranja-hover: #e67e00;
    --cor-verde-hover: #7ab836;
    --cor-texto-escuro: #333;
    --cor-texto-medio: #666;
    --cor-cinza-claro: #f4f4f4;
    --sombra-leve: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Alterar nome da loja:
Procure por "Pretinho Variedades" nos arquivos e substitua.

---

## 🐛 Troubleshooting

### **Produtos não aparecem na homepage**
1. Verifique se o servidor está rodando (`npm start`)
2. Certifique-se de que os produtos estão marcados como "Ativo"
3. Recarregue a página (F5)

### **Imagens não aparecem**
1. Certifique-se que o arquivo foi enviado corretamente
2. Verifique o caminho na pasta `server/uploads/`
3. Tente fazer re-upload do arquivo

### **Erro de conexão ao servidor**
1. Verifique se o servidor está rodando na porta 3333
2. Verifique o console do navegador (F12) para mensagens de erro
3. Tente reiniciar o servidor

### **Destaques não aparecem nos carrosseis**
1. Vá para "Destaques" no admin
2. Selecione produtos para cada carrossel
3. Clique "Salvar Destaques"
4. Recarregue a homepage

---

## 📊 Dados Iniciais

O banco de dados é criado automaticamente na primeira execução com:
- Tabelas: `products`, `banners`, `featured_groups`, `settings`
- Sem dados iniciais (para começar do zero)

Para adicionar produtos iniciais:
1. Acesse o admin
2. Clique em "Novo Produto"
3. Preencha os dados
4. Clique "Salvar"

---

## 🔐 Segurança

**Nota:** Este é um projeto de demonstração. Em produção:
- Implemente autenticação real no admin
- Valide dados no backend
- Use variáveis de ambiente para senhas
- Implemente rate limiting
- Use HTTPS

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os arquivos existem
2. Confirme que Node.js e npm estão instalados
3. Verifique os logs do console (tanto no navegador quanto no terminal)
4. Tente limpar cache do navegador (Ctrl+Shift+Delete)

---

**Desenvolvido com ❤️ usando Express.js, SQLite e Vanilla JavaScript**
