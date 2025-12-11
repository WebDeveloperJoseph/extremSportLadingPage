# ⚡ Quick Start Guide - Mercado Pretinho

## 🚀 5 Passos para Iniciar

### 1. Abrir Terminal
```powershell
cd C:\Users\JoseDev\Desktop\mercado-pretinho\server
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar Servidor
```bash
npm start
```

✅ Você verá:
```
✅ Pretinho backend rodando em http://localhost:3333
```

### 4. Abrir no Navegador

| O quê? | URL |
|--------|-----|
| 🏠 **Loja** | http://localhost:3333/ |
| 🛒 **Carrinho** | http://localhost:3333/carrinho.html |
| 🔧 **Admin** | http://localhost:3333/admin/dashboard.html |
| 📦 **Produtos Admin** | http://localhost:3333/admin/produtos.html |

### 5. Testar Upload
1. Acesse: http://localhost:3333/admin/produtos.html
2. Clique em "➕ Novo Produto"
3. Preencha os dados
4. Selecione uma imagem
5. Clique em "💾 Salvar Produto"

---

## 📍 Estrutura Nova (Limpinha!)

```
mercado-pretinho/
├── server/          ← Backend (npm start aqui)
├── public/          ← Homepage
├── admin/           ← Painel admin
├── assets/          ← Imagens
└── README.md
```

---

## 🎯 O que foi feito?

✅ Deletado: `mercado-pretinho-final/` (não precisamos mais)
✅ Limpado: Todos os arquivos de teste antigos
✅ Organizado: Pastas profissionais (public, admin, assets)
✅ Atualizado: Servidor para apontar para as novas pastas
✅ Documentação: README completo + Quick Start

---

## 🚨 Dúvidas Comuns

### Server não inicia?
```bash
# Ver se porta 3333 está em uso
netstat -ano | findstr :3333

# Se estiver, matar o processo
taskkill /PID <numero> /F
```

### Imagens não aparecem?
Verificar se:
- Pasta `assets/img/` tem imagens
- URLs dos HTMLs apontam para `/assets/img/`

### Admin não carrega?
Verificar console do navegador (F12) para erros

---

## 📦 Próximas Features

🔄 Quando quiser, podemos adicionar:
- Carrinho salvo (LocalStorage)
- Login admin
- Pagamentos (Stripe/MercadoPago)
- Notificações WhatsApp
- Relatórios de vendas

---

**Tá tudo pronto! Quer começar a adicionar features?** 🚀
