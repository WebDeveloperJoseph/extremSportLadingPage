# 🛒 Mercado Pretinho - Plataforma E-Commerce

Sistema completo de e-commerce para loja de variedades, focado em material escolar. Desenvolvido com **Express.js**, **Prisma**, **SQLite** e **HTML/CSS/JavaScript puro**.

---

## 📁 Estrutura de Pastas

```
mercado-pretinho/
├── 📂 server/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js              # Servidor Express principal
│   │   ├── db.js                 # Configuração Prisma
│   │   ├── routes/               # Rotas da API
│   │   │   ├── products.js       # CRUD de produtos
│   │   │   ├── upload.js         # Upload de imagens
│   │   │   ├── banners.js        # Gerencio de banners
│   │   │   ├── featured.js       # Produtos em destaque
│   │   │   └── settings.js       # Configurações
│   │   ├── services/             # Lógica de negócio
│   │   └── data/                 # Banco SQLite
│   ├── uploads/                  # Imagens enviadas
│   ├── package.json
│   └── prisma/
│       └── schema.prisma         # Schema do banco
│
├── 📂 public/                    # Frontend - Homepage
│   ├── index.html                # Página principal
│   ├── carrinho.html             # Página do carrinho
│   ├── style.css                 # Estilos globais
│   ├── carrinho.css              # Estilos do carrinho
│   └── js/
│       ├── home.js               # Lógica da homepage
│       ├── products.js           # Gerenciamento de produtos
│       ├── search.js             # Busca e filtros
│       ├── cart.js               # Carrinho de compras
│       └── notifications.js      # Sistema de notificações
│
├── 📂 admin/                     # Painel Administrativo
│   ├── dashboard.html            # Dashboard principal
│   ├── produtos.html             # Gerencio de produtos
│   ├── pedidos.html              # Gerencio de pedidos
│   ├── categorias.html           # Gerencio de categorias
│   ├── banners.html              # Gerencio de banners
│   ├── destaques.html            # Produtos em destaque
│   ├── configuracoes.html        # Configurações
│   ├── login.html                # Login administrativo
│   ├── admin.css                 # Estilos admin
│   └── js/
│       ├── admin-*.js            # Lógica de cada página
│       └── notifications.js
│
├── 📂 assets/                    # Arquivos estáticos
│   └── img/                      # Imagens do site
│       ├── backgound.png
│       ├── logoPretinho.jpg
│       └── ...
│
├── .git/                         # Controle de versão
├── .gitignore
└── README.md                     # Este arquivo
```

---

## 🚀 Como Iniciar

### Pré-requisitos
- **Node.js** (v16+)
- **npm** ou **yarn**

### 1️⃣ Instalar dependências
```bash
cd server
npm install
```

### 2️⃣ Configurar banco de dados (Prisma)
```bash
npx prisma migrate dev --name init
```

### 3️⃣ Iniciar servidor
```bash
npm start
```

O servidor rodará em **http://localhost:3333**

---

## 📍 URLs Principais

| URL | Descrição |
|-----|-----------|
| `http://localhost:3333/` | Homepage da loja |
| `http://localhost:3333/carrinho.html` | Página do carrinho |
| `http://localhost:3333/admin/dashboard.html` | Dashboard admin |
| `http://localhost:3333/admin/produtos.html` | Gerencio de produtos |

---

## 🔌 API REST

### Produtos
```
GET    /api/products              # Listar todos
POST   /api/products              # Criar novo
GET    /api/products/:id          # Obter um
PUT    /api/products/:id          # Atualizar
DELETE /api/products/:id          # Deletar
```

### Upload de Imagens
```
POST   /api/upload                # Upload (multipart/form-data)
```

### Banners
```
GET    /api/banners               # Listar todos
POST   /api/banners               # Criar novo
PUT    /api/banners/:id           # Atualizar
DELETE /api/banners/:id           # Deletar
```

### Featured (Produtos em Destaque)
```
GET    /api/featured-groups       # Listar grupos
POST   /api/featured-groups       # Criar novo
```

### Health Check
```
GET    /api/health                # Verificar status do servidor
```

---

## 💾 Banco de Dados (Prisma + SQLite)

O banco está configurado em `server/prisma/schema.prisma`.

### Modelos disponíveis:
- **Product** - Produtos da loja
- **Banner** - Banners promocionais
- **FeaturedGroup** - Grupos de destaque
- **Category** - Categorias de produtos

### Rodar migrações
```bash
# Criar nova migração
npx prisma migrate dev --name sua_migração

# Ver estado do banco
npx prisma studio
```

---

## 📸 Upload de Imagens

Arquivos enviados são salvos em `server/uploads/` com nome aleatório.

**Exemplo de upload (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.url); // URL pública da imagem
```

---

## 🎨 Categorias de Produtos

- 📚 **Livros & Cadernos**
- ✏️ **Escrever** (Canetas, lápis)
- 🎨 **Materiais Artísticos**
- 📐 **Geometria**
- 🎒 **Mochilas & Estojos**
- 🖇️ **Papelaria Geral**

---

## 🔒 Autenticação Admin

> ⚠️ **TODO**: Sistema de login ainda em desenvolvimento

---

## 📝 Exemplo: Criar Produto via API

```bash
curl -X POST http://localhost:3333/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mochila Escolar",
    "description": "Mochila resistente e confortável",
    "price": 89.90,
    "priceOld": 129.90,
    "category": "mochilas",
    "stock": 50,
    "brand": "Marca",
    "imageUrl": "/uploads/imagem.jpg",
    "active": true
  }'
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Express.js | 4.18.2 | Framework web |
| Prisma | 5.x | ORM + Migrations |
| SQLite | Latest | Banco de dados |
| Node.js | 16+ | Runtime |
| HTML5 | - | Markup |
| CSS3 | - | Estilos |
| JavaScript Vanilla | ES6+ | Frontend |

---

## 📦 Dependências Principais

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "multer": "^1.4.5",
  "@prisma/client": "^5.x",
  "dotenv": "^16.x"
}
```

---

## 🚧 Funcionalidades em Desenvolvimento

- [ ] Sistema de autenticação admin
- [ ] Carrinho de compras salvo no LocalStorage
- [ ] Integração de pagamento (Stripe/MercadoPago)
- [ ] Notificações por email
- [ ] Relatórios de vendas
- [ ] Integração WhatsApp
- [ ] Aplicativo mobile

---

## 🐛 Troubleshooting

### Servidor não inicia
```bash
# Verificar se porta 3333 está em uso
netstat -ano | findstr :3333

# Matar processo
taskkill /PID <PID> /F
```

### Imagens não carregam
- Verificar se `server/uploads/` existe
- Conferir se as URLs estão corretas (e.g., `/uploads/nome.jpg`)

### Prisma Studio não abre
```bash
npx prisma studio
# Acesse: http://localhost:5555
```

---

## 📞 Contato & Suporte

- 📧 Email: suporte@mercadopretinho.com.br
- 💬 WhatsApp: (11) 9999-9999
- 🐙 GitHub: [seu-repo]

---

## 📄 Licença

Todos os direitos reservados © 2025 Mercado Pretinho

---

**Última atualização:** 4 de dezembro de 2025

## ✨ Funcionalidades Implementadas

### 🌐 **Loja Pública (Frontend)**
- ✅ Listagem dinâmica de produtos
- ✅ Sistema de busca funcional
- ✅ Filtros por categoria
- ✅ Carrinho de compras completo
- ✅ Adicionar/remover produtos do carrinho
- ✅ Atualizar quantidade de itens
- ✅ Cálculo automático de subtotais e total
- ✅ Sistema de cupons de desconto
- ✅ Calculadora de frete por CEP
- ✅ Finalização de pedido
- ✅ Design totalmente responsivo
- ✅ Notificações visuais (feedback)
- ✅ Contador de itens no carrinho

### 🔧 **Painel Administrativo**
- ✅ Sistema de login seguro
- ✅ Dashboard com estatísticas em tempo real
- ✅ **Gerenciamento de Produtos** (CRUD completo)
  - Adicionar novos produtos
  - Editar produtos existentes
  - Excluir produtos
  - Ativar/desativar produtos
  - Busca e filtros
  - Cálculo automático de desconto
- ✅ **Gerenciamento de Pedidos**
  - Visualizar todos os pedidos
  - Detalhes completos do pedido
  - Atualizar status do pedido
  - Filtrar por status
  - Estatísticas de pedidos
  - Excluir pedidos
- ✅ **Gerenciamento de Categorias**
  - Visualizar categorias
  - Contagem de produtos por categoria
- ✅ **Configurações da Loja**
  - Informações da loja (nome, email, telefone)
  - Exportar/importar dados (backup)
  - Gerenciar cupons de desconto
  - Limpar todos os dados

## 📁 Estrutura do Projeto

```
mercado-pretinho/
│
├── index.html              # Página principal da loja
├── carrinho.html           # Página do carrinho de compras
├── style.css               # Estilos principais
├── carrinho.css            # Estilos do carrinho
│
├── admin/                  # Painel Administrativo
│   ├── login.html          # Login do admin
│   ├── dashboard.html      # Dashboard principal
│   ├── produtos.html       # Gerenciamento de produtos
│   ├── pedidos.html        # Gerenciamento de pedidos
│   ├── categorias.html     # Gerenciamento de categorias
│   ├── configuracoes.html  # Configurações da loja
│   └── admin.css           # Estilos do admin
│
├── js/                     # Scripts JavaScript
│   ├── admin-login.js      # Sistema de login
│   ├── admin-dashboard.js  # Dashboard admin
│   ├── admin-produtos.js   # Gerenciamento de produtos
│   ├── admin-pedidos.js    # Gerenciamento de pedidos
│   ├── products.js         # Produtos na página pública
│   ├── cart.js             # Sistema completo do carrinho
│   └── search.js           # Sistema de busca e filtros
│
├── img/                    # Imagens dos produtos
└── data/                   # Dados (futuro uso)
```

## 🚀 Como Usar

### Página Pública (Loja)

1. Abra `index.html` no navegador
2. Navegue pelos produtos em oferta
3. Clique em "Adicionar ao Carrinho" para ir ao carrinho
4. O ícone 🛒 no topo mostra a quantidade de itens

### Painel Administrativo

#### 1️⃣ **Acessar o Admin**
- Abra: `admin/login.html`
- **Usuário:** `admin`
- **Senha:** `admin123`

#### 2️⃣ **Dashboard**
- Visualize estatísticas da loja
- Veja produtos recentes
- Acesse ações rápidas

#### 3️⃣ **Gerenciar Produtos**
- Clique em "📦 Produtos" no menu lateral
- **Adicionar Produto:** Clique no botão "➕ Novo Produto"
- **Editar Produto:** Clique no botão "✏️ Editar"
- **Excluir Produto:** Clique no botão "🗑️ Excluir"

#### 4️⃣ **Formulário de Produto**
Preencha os campos:
- **Nome do Produto** (obrigatório)
- **Categoria** (obrigatório)
- **Descrição** (opcional)
- **Preço Original** (obrigatório)
- **Preço em Oferta** (obrigatório)
- **Desconto** (calculado automaticamente)
- **URL da Imagem** (caminho da imagem, ex: `img/mochila.jpg`)
- **Estoque** (quantidade disponível)
- **Produto Ativo** (marque para aparecer na loja)

## 💾 Armazenamento de Dados

Os dados são salvos no **LocalStorage** do navegador:
- `products` - Lista de todos os produtos
- `adminLoggedIn` - Status de login (sessão)
- `adminRemember` - Lembrar login

### ⚠️ Importante
- Os dados ficam salvos apenas no navegador atual
- Para produção real, seria necessário um backend
- Limpar cache do navegador apaga os dados

## 🎨 Personalização

### Cores
Edite as variáveis CSS em `style.css`:
```css
:root {
    --cor-laranja: #FF8C00;  /* Laranja Vibrante */
    --cor-verde: #98D447;    /* Verde Limão */
}
```

### Adicionar Imagens de Produtos
1. Coloque as imagens na pasta `img/`
2. No admin, use o caminho: `img/nome-da-imagem.jpg`

## 🔧 Funcionalidades

### ✅ Página Pública
- [x] Listagem de produtos dinâmica
- [x] Filtro por categoria
- [x] Carrinho de compras
- [x] Design responsivo
- [x] Produtos carregados do admin

### ✅ Painel Admin
- [x] Sistema de login
- [x] Dashboard com estatísticas
- [x] CRUD completo de produtos
- [x] Upload de imagens (via URL)
- [x] Cálculo automático de desconto
- [x] Busca e filtros
- [x] Ativar/desativar produtos

## 📱 Responsividade

O sistema é totalmente responsivo:
- **Desktop:** Layout completo
- **Tablet:** Layout adaptado
- **Mobile:** Layout em coluna única

## 🔐 Segurança

⚠️ **IMPORTANTE:** Este é um projeto de demonstração!

Para produção:
- Use backend real (Node.js, PHP, etc.)
- Implemente autenticação segura (JWT, OAuth)
- Use banco de dados (MySQL, MongoDB)
- Adicione validação server-side
- Implemente HTTPS

## 📝 Próximos Passos (Sugestões)

1. Sistema de upload de imagens
2. Gerenciamento de pedidos
3. Gerenciamento de clientes
4. Relatórios de vendas
5. Sistema de categorias dinâmico
6. Integração com gateway de pagamento
7. Sistema de estoque automático
8. Notificações por email

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se todos os arquivos estão na estrutura correta
2. Abra o Console do Navegador (F12) para ver erros
3. Certifique-se de que o JavaScript está habilitado

## 📄 Licença

Projeto de demonstração - Use livremente! 🎉


QR code - Assim que o cliente abrir o site vai aparecer uma mensagem: Leve seu orçamento até nossa loja e receba o maior desconto da região