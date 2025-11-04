-- =============================================
-- ADICIONAR COLUNA ESTOQUE NA TABELA PRODUTOS
-- =============================================
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna estoque (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'produtos' 
        AND column_name = 'estoque'
    ) THEN
        ALTER TABLE produtos 
        ADD COLUMN estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0);
        
        RAISE NOTICE 'Coluna estoque adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna estoque já existe!';
    END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'produtos'
ORDER BY ordinal_position;
