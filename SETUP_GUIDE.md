# 🚀 Guia Completo de Configuração - Extreme Sport Backend

## 📋 Checklist Geral

- [ ] Executar schema SQL no Supabase
- [ ] Configurar Storage (bucket produtos)
- [ ] Criar primeiro usuário admin
- [ ] Registrar admin na tabela
- [ ] Acessar painel admin e fazer login
- [ ] Migrar produtos para o banco
- [ ] Testar site público
- [ ] Deploy no Vercel

---

## 1️⃣ EXECUTAR SCHEMA SQL

### Passo 1: Abrir SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto **extreme-sport**
3. Menu lateral → **SQL Editor**
4. Clique em **New Query**

### Passo 2: Executar SQL

1. Abra o arquivo: `database/schema.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. Cole no editor SQL do Supabase
4. Clique em **Run** (ou Ctrl+Enter)
5. ✅ Aguarde mensagem de sucesso

**Resultado:** 3 tabelas criadas (produtos, pedidos, admins) + índices + triggers + políticas RLS

> Atualização (Estoque): o schema agora inclui a coluna `estoque` em `produtos` e um trigger que decrementa o estoque automaticamente quando um pedido é criado. Reaplique o `database/schema.sql` se você configurou antes desta mudança (ou execute apenas os trechos de ALTER/CREATE FUNCTION/TRIGGER).

---

## 2️⃣ CONFIGURAR STORAGE

### Passo 1: Criar Bucket

1. Menu lateral → **Storage**
2. Clique em **New Bucket**
3. Preencha:
   - **Name**: `produtos`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO**
4. Clique em **Create bucket**

### Passo 2: Configurar Políticas

#### Política 1: Leitura Pública

1. Clique no bucket `produtos`
2. Aba **Policies** → **New Policy**
3. Escolha **For full customization create a policy from scratch**
4. Preencha:
   ```
   Policy name: Public Read Access
   Allowed operation: SELECT ✅
   Policy definition: true
   ```
5. **Review** → **Save policy**

#### Política 2: Upload Admin

1. **New Policy** novamente
2. Preencha:
   ```
   Policy name: Admin Upload Access
   Allowed operation: INSERT ✅
   Policy definition:
   EXISTS (
       SELECT 1 FROM admins
       WHERE admins.id = auth.uid()
   )
   ```
3. **Review** → **Save policy**

#### Política 3: Delete Admin

1. **New Policy** novamente
2. Preencha:
   ```
   Policy name: Admin Delete Access
   Allowed operation: DELETE ✅
   Policy definition:
   EXISTS (
       SELECT 1 FROM admins
       WHERE admins.id = auth.uid()
   )
   ```
3. **Review** → **Save policy**

---

## 3️⃣ CRIAR USUÁRIO ADMIN

### Passo 1: Criar Usuário

1. Menu lateral → **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - **Email**: seu-email@exemplo.com (use seu email real)
   - **Password**: crie uma senha forte e **ANOTE**
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO**
4. Clique em **Create User**

### Passo 2: Copiar UUID

1. Na lista de usuários, você verá o usuário criado
2. **COPIE O UUID** (exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. Guarde esse UUID, vamos usar no próximo passo

### Passo 3: Registrar Admin

1. Volte para **SQL Editor** → **New Query**
2. Execute este comando (**SUBSTITUA OS VALORES**):

```sql
INSERT INTO admins (id, email, role) VALUES 
('UUID_COPIADO_NO_PASSO_2', 'seu-email@exemplo.com', 'super_admin');
```

**Exemplo real:**
```sql
INSERT INTO admins (id, email, role) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'jose@gmail.com', 'super_admin');
```

3. Clique em **Run**
4. ✅ Deve aparecer: "Success. No rows returned"

---

## 4️⃣ ACESSAR PAINEL ADMIN

### Passo 1: Abrir Página de Login

Você tem 2 opções:

**Opção A - Local (Recomendado para testar):**
```
http://localhost:5500/admin/
```
(Use Live Server no VS Code ou abra o arquivo diretamente)

**Opção B - Vercel (depois do deploy):**
```
https://seu-site.vercel.app/admin/login.html
```

### Passo 2: Fazer Login

1. Digite o **email** que você criou
2. Digite a **senha** que você criou
3. Clique em **Entrar**
4. ✅ Você será redirecionado para o dashboard

### Passo 3: Explorar Painel

- **Dashboard** → Veja estatísticas (ainda zeradas)
- **Produtos** → Adicione/edite/exclua produtos
- **Pedidos** → Veja todos os pedidos recebidos
- **Ver Site** → Abre a página pública

---

## 5️⃣ MIGRAR PRODUTOS EXISTENTES

Como você já tem imagens PNG e 9 produtos definidos, há 2 opções:

### Opção A: Manual via Painel Admin (Recomendado)

1. Acesse **Produtos** no painel admin
2. Clique em **➕ Novo Produto**
3. Preencha os dados:
   - **Nome**: Chuteira Profissional Branca
   - **Preço**: 349.90
   - **Descrição**: Chuteira de alta performance para campo
   - **Emoji**: ⚽
   - **Imagem**: Upload de `img/chuteiraBranca.png`
   - **Destaque**: Marque se quiser aparecer no carrossel
4. Clique em **Salvar Produto**
5. Repita para os outros 8 produtos

**Produtos para adicionar:**
1. Chuteira Profissional Branca - R$ 349,90 - img/chuteiraBranca.png - ⚽
2. Chuteira Performance Verde - R$ 389,90 - img/chuteiraVerde.png - ⚽
3. Kit Chuteiras Premium - R$ 699,90 - img/chuteiras.png - 👟
4. Luva de Goleiro Pro - R$ 179,90 - img/luvaGoleiro.png - 🧤
5. Par de Luvas Goleiro Elite - R$ 299,90 - img/luvasGoleiro.png - 🥅
6. Camisa Esportiva Premium - R$ 149,90 - img/modeloCamisa.png - 👔
7. Camisa Treino Profissional - R$ 139,90 - img/modeloCamisa2.png - 👕
8. Skate Profissional - R$ 499,90 - sem imagem - 🛹
9. Capacete Extreme - R$ 299,90 - sem imagem - ⛑️

### Opção B: SQL Insert (Rápido mas sem imagens)

Se quiser inserir rápido sem imagens:

```sql
INSERT INTO produtos (nome, descricao, preco, emoji, destaque) VALUES
('Chuteira Profissional Branca', 'Chuteira de alta performance para campo', 349.90, '⚽', true),
('Chuteira Performance Verde', 'Conforto e tração para jogo intenso', 389.90, '⚽', true),
('Kit Chuteiras Premium', 'Conjunto completo para treino e jogo', 699.90, '👟', true),
('Luva de Goleiro Pro', 'Proteção e aderência máximas', 179.90, '🧤', true),
('Par de Luvas Goleiro Elite', 'Tecnologia anti-impacto e grip superior', 299.90, '🥅', true),
('Camisa Esportiva Premium', 'Tecido Dry-Fit respirável', 149.90, '👔', true),
('Camisa Treino Profissional', 'Design moderno e alta durabilidade', 139.90, '👕', true),
('Skate Profissional', 'Skate completo para manobras radicais', 499.90, '🛹', false),
('Capacete Extreme', 'Proteção máxima para esportes radicais', 299.90, '⛑️', false);
```

Depois você volta no painel admin e edita cada produto para fazer upload das imagens.

---

## 6️⃣ TESTAR SITE PÚBLICO

### Passo 1: Abrir Site

**Local:**
```
http://localhost:5500/index.html
```

**Vercel:**
```
https://seu-site.vercel.app
```

### Passo 2: Verificar Produtos

1. Verifique se os produtos aparecem na grid
2. Verifique se o carrossel mostra os produtos em destaque
3. Teste adicionar ao carrinho

### Passo 3: Testar Checkout

1. Adicione alguns produtos ao carrinho
2. Clique em **Finalizar Compra**
3. Preencha o formulário completo
4. Clique em **Enviar Pedido**
5. ✅ Deve redirecionar para WhatsApp

### Passo 4: Verificar Pedido no Banco

1. Volte para o painel admin
2. Vá em **Pedidos**
3. ✅ O pedido de teste deve aparecer com status "pendente"

---

## 7️⃣ DEPLOY NO VERCEL

### Passo 1: Commit das Mudanças

```powershell
cd C:\Users\JoseDev\Desktop\extremSport
git add .
git commit -m "feat: Adicionar backend Supabase com painel admin completo"
git push origin main
```

### Passo 2: Vercel Deploy Automático

O Vercel detecta automaticamente e faz o deploy.

### Passo 3: Testar Site em Produção

1. Acesse: https://seu-site.vercel.app
2. Teste carrinho e checkout
3. Acesse: https://seu-site.vercel.app/admin/
4. Faça login e teste o painel admin

---

## ✅ CHECKLIST FINAL

Marque conforme for completando:

- [ ] Schema SQL executado no Supabase
- [ ] Bucket `produtos` criado como público
- [ ] 3 políticas de Storage configuradas
- [ ] Usuário admin criado no Authentication
- [ ] Admin registrado na tabela `admins`
- [ ] Login no painel admin funcionando
- [ ] Dashboard mostrando estatísticas
- [ ] Produtos migrados para o banco (9 produtos)
- [ ] Imagens dos produtos enviadas para Storage
- [ ] Site público carregando produtos do banco
- [ ] Checkout salvando pedidos no banco
- [ ] Pedidos aparecendo no painel admin
- [ ] Deploy no Vercel concluído
- [ ] Site em produção funcionando

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### Erro: "new row violates row-level security policy"

**Causa:** Você não está autenticado ou não é admin

**Solução:**
1. Certifique-se de que criou o usuário em Authentication
2. Certifique-se de que executou o INSERT na tabela `admins`
3. Faça logout e login novamente

### Erro: "Failed to fetch" ao carregar produtos

**Causa:** Problemas de CORS ou API Key incorreta

**Solução:**
1. Verifique se `config/supabase.js` tem a URL e Key corretas
2. Verifique se o domínio do Vercel está autorizado no Supabase (Settings → API → URL Configuration)

### Produtos não aparecem no site

**Causa:** Banco ainda vazio ou erro ao buscar

**Solução:**
1. Verifique se inseriu produtos no banco (SQL ou painel admin)
2. Abra o Console do navegador (F12) e veja se há erros

### Upload de imagem falha

**Causa:** Bucket não é público ou políticas incorretas

**Solução:**
1. Verifique se marcou "Public bucket" ao criar
2. Verifique se configurou as 3 políticas (Read, Insert, Delete)

---

## 📞 PRÓXIMOS PASSOS

Após configurar tudo:

1. **Adicionar mais produtos** conforme o estoque do cliente
2. **Gerenciar pedidos** diariamente pelo painel admin
3. **Atualizar status** dos pedidos (confirmado → enviado → entregue)
4. **Monitorar estatísticas** no dashboard

---

## 🎯 RESUMO DO QUE FOI CRIADO

**Backend:**
- ✅ Banco PostgreSQL com 3 tabelas
- ✅ Row Level Security (RLS) implementado
- ✅ Storage com bucket público para imagens
- ✅ Autenticação via Supabase Auth

**Painel Admin:**
- ✅ Login seguro com validação de admin
- ✅ Dashboard com estatísticas em tempo real
- ✅ CRUD completo de produtos com upload de imagens
- ✅ Gerenciamento de pedidos com filtros e atualização de status
- ✅ Design responsivo verde/preto/branco

**Site Público:**
- ✅ Carregamento dinâmico de produtos do banco
- ✅ Checkout com salvamento automático no banco
- ✅ Integração WhatsApp mantida
- ✅ Carrossel e todas as features anteriores funcionando

Tudo 100% grátis usando o plano Free do Supabase! 🎉
