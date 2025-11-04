# Corrigir Pedidos Não Aparecendo no Admin

Se os pedidos não aparecem em `/admin/pedidos.html`, verifique os passos abaixo:

## 1) Confirmar que a tabela e policies existem
Abra o SQL Editor do Supabase e execute:

```sql
-- Verificar se a tabela pedidos existe
select * from information_schema.tables where table_name = 'pedidos';

-- Ver policies aplicadas
select * from pg_policies where tablename = 'pedidos';
```

Você deve ter, no mínimo:
- RLS habilitado em `pedidos`
- Policy de SELECT para admins
- Policy de INSERT para PUBLIC

## 2) Aplicar (ou reaplicar) apenas a parte de pedidos do schema
Se necessário, rode o SQL abaixo no Supabase:

```sql
-- Tabela de Pedidos
create table if not exists pedidos (
    id bigserial primary key,
    cliente_nome varchar(255) not null,
    cliente_email varchar(255) not null,
    cliente_telefone varchar(20) not null,
    endereco_cep varchar(10) not null,
    endereco_rua varchar(255) not null,
    endereco_numero varchar(20) not null,
    endereco_complemento varchar(255),
    endereco_bairro varchar(255) not null,
    endereco_cidade varchar(255) not null,
    endereco_estado varchar(2) not null,
    produtos_json jsonb not null,
    total decimal(10,2) not null check (total > 0),
    forma_pagamento varchar(20) not null check (forma_pagamento in ('pix','cartao','boleto')),
    status varchar(20) default 'pendente' check (status in ('pendente','confirmado','enviado','entregue','cancelado')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Trigger updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger update_pedidos_updated_at
before update on pedidos
for each row execute function update_updated_at_column();

-- Habilitar RLS
alter table pedidos enable row level security;

-- SELECT somente admins
drop policy if exists "Apenas admins podem ver pedidos" on pedidos;
create policy "Apenas admins podem ver pedidos"
  on pedidos for select
  to authenticated
  using (
    exists (select 1 from admins where admins.id = auth.uid())
  );

-- INSERT para qualquer usuário (clientes)
drop policy if exists "Qualquer um pode criar pedido" on pedidos;
create policy "Qualquer um pode criar pedido"
  on pedidos for insert
  to public
  with check (true);
```

## 3) Testar com um Pedido de Teste pelo Admin
Na página `/admin/pedidos.html`, clique em **Criar Pedido Teste**. 
- Se criar com sucesso, as policies e a tabela estão OK.
- Se falhar, a mensagem do erro vai indicar o ajuste necessário.

## 4) Testar pelo Site Público
No site, finalize uma compra. No console (F12) você verá:
- "Pedido salvo no banco" (sucesso), e uma notificação na tela
- OU uma mensagem: "Não foi possível salvar seu pedido no sistema..." (erro no insert)

Se houver erro, verifique CORS/URL do projeto:
- Settings → API → verifique Allowed Origins se você usa configurações personalizadas
- Auth → URL Configuration → configure seu domínio de produção (se necessário)

## 5) Verificar dados salvos
```sql
select id, cliente_nome, total, status, created_at from pedidos order by created_at desc limit 20;
```

Pronto! Com isso, os pedidos devem aparecer corretamente no admin.