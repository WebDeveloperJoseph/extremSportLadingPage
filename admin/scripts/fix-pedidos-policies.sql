-- Políticas RLS para tabela pedidos (adicionar ao Supabase)

-- Habilitar RLS na tabela pedidos (se ainda não estiver)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Leitura: Apenas admins podem ver pedidos
CREATE POLICY IF NOT EXISTS "admin_read_pedidos" ON public.pedidos
FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));

-- Inserção: Usuários logados podem criar pedidos OU público pode criar (checkout)
CREATE POLICY IF NOT EXISTS "public_insert_pedidos" ON public.pedidos
FOR INSERT WITH CHECK (true); -- Permite inserção pública para checkout

-- Atualização: Apenas admins podem atualizar pedidos
CREATE POLICY IF NOT EXISTS "admin_update_pedidos" ON public.pedidos
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));

-- Exclusão: Apenas admins podem excluir pedidos
CREATE POLICY IF NOT EXISTS "admin_delete_pedidos" ON public.pedidos
FOR DELETE USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));