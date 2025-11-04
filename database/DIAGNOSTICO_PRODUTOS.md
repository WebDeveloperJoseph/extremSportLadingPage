# Diagnóstico: Produtos Não Chegam no Admin

## ✅ Melhorias Implementadas

### 1. Sistema de Notificações Toast
- Notificações visuais em tempo real
- Feedback imediato de todas as operações
- Tipos: Sucesso ✅, Erro ❌, Aviso ⚠️, Info ℹ️
- Auto-desaparecem após 5 segundos

### 2. Logs Detalhados
- Console.log mostra dados carregados
- Erros detalhados do Supabase
- Mensagens específicas para cada operação

### 3. Estados de Erro Melhorados
- Botão "Tentar Novamente" quando falha
- Mensagem de erro específica exibida
- Loading states em todas operações

## 🔍 Como Diagnosticar o Problema

### Passo 1: Abrir Console do Navegador
1. Acesse `/admin/produtos.html`
2. Pressione **F12** (Chrome/Edge) ou **Ctrl+Shift+I** (Firefox)
3. Vá na aba **Console**

### Passo 2: Verificar Notificações
Ao carregar a página, você verá uma das seguintes notificações:

#### ✅ Caso de Sucesso:
```
ℹ️ Carregando produtos...
✅ X produto(s) carregado(s) com sucesso
```

#### ⚠️ Banco Vazio:
```
ℹ️ Carregando produtos...
⚠️ Nenhum produto encontrado no banco de dados
```

#### ❌ Erro de Conexão/Permissão:
```
ℹ️ Carregando produtos...
❌ Erro ao buscar produtos: [mensagem específica]
```

### Passo 3: Analisar Erros Comuns

#### Erro 1: "Could not find the 'estoque' column"
**Causa:** Coluna estoque não existe no banco  
**Solução:** Execute `database/add_estoque_column.sql` no Supabase

#### Erro 2: "permission denied for table produtos"
**Causa:** RLS bloqueando acesso  
**Solução:** Verifique se você está autenticado como admin

```sql
-- Verificar no Supabase SQL Editor
SELECT * FROM admins WHERE email = 'seu-email@exemplo.com';
```

#### Erro 3: "relation 'public.produtos' does not exist"
**Causa:** Tabela não foi criada  
**Solução:** Execute `database/schema.sql` completo no Supabase

#### Erro 4: Produtos aparecem mas sem imagem
**Causa:** URLs quebradas ou Storage não configurado  
**Solução:** Verifique Storage bucket "produtos" existe e é público

### Passo 4: Verificar no Console
Procure por estas mensagens no console:

```javascript
// Sucesso - você verá:
Produtos carregados: Array(X) [...]

// Erro - você verá:
Erro Supabase: { message: "...", code: "..." }
Erro ao carregar produtos: Error: ...
```

### Passo 5: Testar Conexão Supabase

Abra o console e execute:

```javascript
// Testar conexão
const { data, error } = await supabase.from('produtos').select('count');
console.log('Teste conexão:', { data, error });

// Verificar autenticação
const { data: session } = await supabase.auth.getSession();
console.log('Sessão:', session);

// Verificar admin
const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('id', session.session.user.id)
    .single();
console.log('Admin:', admin);
```

## 🛠️ Soluções Rápidas

### Solução 1: Reset Completo do Banco
1. Acesse Supabase SQL Editor
2. Execute: `DROP TABLE IF EXISTS produtos CASCADE;`
3. Execute: `database/schema.sql` completo
4. Execute: `/admin/seed.html` para popular

### Solução 2: Verificar RLS Policies
```sql
-- Listar policies da tabela produtos
SELECT * FROM pg_policies WHERE tablename = 'produtos';

-- Deve ter:
-- 1. "Produtos são visíveis publicamente" (SELECT)
-- 2. "Apenas admins podem criar produtos" (INSERT)
-- 3. "Apenas admins podem atualizar produtos" (UPDATE)
-- 4. "Apenas admins podem deletar produtos" (DELETE)
```

### Solução 3: Recriar Admin User
```sql
-- Verificar se você está na tabela admins
SELECT * FROM admins;

-- Se não estiver, adicione:
-- (Substitua 'SEU_UUID' pelo ID do auth.users)
INSERT INTO admins (id, email, role)
VALUES ('SEU_UUID', 'seu-email@exemplo.com', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
```

### Solução 4: Verificar Storage
1. Acesse Supabase Dashboard → Storage
2. Verifique se existe bucket "produtos"
3. Políticas do bucket:
   - SELECT: público (qualquer um pode ler)
   - INSERT/UPDATE/DELETE: apenas authenticated + admin

## 📊 Checklist de Verificação

- [ ] Supabase está configurado em `config/supabase.js`
- [ ] Tabela `produtos` existe no banco
- [ ] Coluna `estoque` existe na tabela produtos
- [ ] Você está autenticado (não redirecionado para /admin/)
- [ ] Seu usuário está na tabela `admins`
- [ ] RLS policies estão aplicadas
- [ ] Storage bucket "produtos" existe
- [ ] Console do navegador não mostra erros de CORS
- [ ] Notificações toast aparecem na tela
- [ ] Console mostra "Produtos carregados: ..."

## 🎯 Próximos Passos

1. **Abra `/admin/produtos.html`**
2. **Veja as notificações toast** (canto superior direito)
3. **Abra o Console** (F12)
4. **Copie os erros** (se houver)
5. **Siga a solução** específica para seu erro

## 💡 Dica Importante

Se você vir a mensagem:
> ⚠️ Nenhum produto encontrado no banco de dados

Isso significa que:
- ✅ Conexão com Supabase OK
- ✅ Autenticação OK
- ✅ Permissões OK
- ❌ **Banco está vazio**

**Solução:** Execute `/admin/seed.html` para popular os produtos!
