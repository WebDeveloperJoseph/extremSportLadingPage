-- =============================================
-- CLIENTES: Tabela + RLS + Função de upsert segura
-- =============================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Policies: somente admins podem ver e alterar clientes
DROP POLICY IF EXISTS "Admins podem ver clientes" ON clientes;
CREATE POLICY "Admins podem ver clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

DROP POLICY IF EXISTS "Apenas admins podem atualizar clientes" ON clientes;
CREATE POLICY "Apenas admins podem atualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

DROP POLICY IF EXISTS "Apenas admins podem inserir clientes" ON clientes;
CREATE POLICY "Apenas admins podem inserir clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

DROP POLICY IF EXISTS "Apenas admins podem deletar clientes" ON clientes;
CREATE POLICY "Apenas admins podem deletar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

-- Função de upsert com SECURITY DEFINER para uso pelo público
-- Retorna o id do cliente (BIGINT)
CREATE OR REPLACE FUNCTION upsert_cliente(
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT
) RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id BIGINT;
BEGIN
  INSERT INTO clientes (nome, email, telefone)
  VALUES (p_nome, p_email, p_telefone)
  ON CONFLICT (email) DO UPDATE
    SET nome = EXCLUDED.nome,
        telefone = EXCLUDED.telefone,
        updated_at = NOW()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_cliente(TEXT, TEXT, TEXT) TO PUBLIC;

-- Relacionar pedidos -> clientes (opcional, nulo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos' AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN cliente_id BIGINT;
    ALTER TABLE pedidos
      ADD CONSTRAINT pedidos_cliente_id_fkey
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
  END IF;
END $$;
