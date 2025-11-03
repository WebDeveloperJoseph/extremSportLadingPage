# Configuração do Supabase Storage

## Passo 1: Criar Bucket de Storage

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione o projeto "extreme-sport"
3. No menu lateral, clique em **Storage**
4. Clique em **New Bucket**
5. Preencha:
   - **Name**: `produtos`
   - **Public bucket**: ✅ **SIM** (marque esta opção)
6. Clique em **Create bucket**

## Passo 2: Configurar Políticas de Acesso (RLS)

1. Ainda na página do Storage, clique no bucket `produtos`
2. Clique na aba **Policies**
3. Clique em **New Policy**

### Política 1: Leitura Pública (todos podem ver imagens)

1. Clique em **For full customization create a policy from scratch**
2. Preencha:
   - **Policy name**: `Public Read Access`
   - **Allowed operation**: SELECT ✅
   - **Policy definition**: 
   ```sql
   true
   ```
3. Clique em **Review** e depois em **Save policy**

### Política 2: Upload apenas para Admins

1. Clique novamente em **New Policy**
2. Preencha:
   - **Policy name**: `Admin Upload Access`
   - **Allowed operation**: INSERT ✅
   - **Policy definition**:
   ```sql
   EXISTS (
       SELECT 1 FROM admins
       WHERE admins.id = auth.uid()
   )
   ```
3. Clique em **Review** e depois em **Save policy**

### Política 3: Delete apenas para Admins

1. Clique novamente em **New Policy**
2. Preencha:
   - **Policy name**: `Admin Delete Access`
   - **Allowed operation**: DELETE ✅
   - **Policy definition**:
   ```sql
   EXISTS (
       SELECT 1 FROM admins
       WHERE admins.id = auth.uid()
   )
   ```
3. Clique em **Review** e depois em **Save policy**

## Passo 3: Verificar Configuração

1. Volte para a aba **Files** do bucket `produtos`
2. Tente fazer upload de uma imagem de teste
3. Se der erro "new row violates row-level security policy", é porque você ainda não criou o usuário admin (ver próximo passo)

## Verificação Final

✅ Bucket `produtos` criado como público  
✅ Política de leitura pública configurada  
✅ Políticas de upload/delete apenas para admins  

Pronto! Agora o Storage está configurado e pronto para uso.

## Próximo Passo

Agora você precisa **executar o schema SQL** e **criar o primeiro usuário admin**.

Veja as instruções em: `database/README.md`
