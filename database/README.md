# Configuração do Banco de Dados Supabase

## Passo 1: Executar Schema SQL

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione o projeto "extreme-sport"
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo `schema.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)

Isso criará:
- ✅ Tabela `produtos`
- ✅ Tabela `pedidos`
- ✅ Tabela `admins`
- ✅ Índices de performance
- ✅ Triggers de atualização automática
- ✅ Políticas de segurança (RLS)

## Passo 2: Criar Primeiro Usuário Admin

1. No painel do Supabase, vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: crie uma senha forte
   - **Auto Confirm User**: ✅ SIM (marque essa opção)
4. Clique em **Create User**
5. **COPIE O UUID** do usuário criado (aparece na listagem)

## Passo 3: Registrar Admin na Tabela

1. Volte para **SQL Editor**
2. Execute este comando (substitua os valores):

```sql
INSERT INTO admins (id, email, role) VALUES 
('UUID_COPIADO_NO_PASSO_2', 'seu-email@exemplo.com', 'super_admin');
```

Exemplo:
```sql
INSERT INTO admins (id, email, role) VALUES 
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'jose@exemplo.com', 'super_admin');
```

## Passo 4: Configurar Storage (próximo passo)

Após executar esses 3 passos, me avise que vou configurar o Storage para as imagens dos produtos.

---

**Credenciais do Projeto:**
- Project URL: `https://hmhoholrueivqvmbbfql.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
