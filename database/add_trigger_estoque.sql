-- =============================================
-- ADICIONAR TRIGGER DE DECREMENTO DE ESTOQUE
-- =============================================
-- Execute este script no SQL Editor do Supabase DEPOIS de adicionar a coluna estoque

-- Remover trigger existente (se houver)
DROP TRIGGER IF EXISTS trigger_decrementar_estoque ON pedidos;

-- Criar função para decrementar estoque
CREATE OR REPLACE FUNCTION decrementar_estoque_pedido()
RETURNS TRIGGER AS $$
DECLARE
    item JSONB;
    v_produto_id BIGINT;
    v_qtd INT;
    v_estoque_atual INT;
BEGIN
    -- Iterar pelos itens do pedido (espera-se um array JSON de itens: {id, quantidade})
    FOR item IN SELECT jsonb_array_elements(NEW.produtos_json)
    LOOP
        v_produto_id := (item ->> 'id')::BIGINT;
        v_qtd := COALESCE((item ->> 'quantidade')::INT, 0);

        IF v_qtd <= 0 THEN
            CONTINUE;
        END IF;

        -- Verificar estoque atual
        SELECT estoque INTO v_estoque_atual FROM produtos WHERE id = v_produto_id FOR UPDATE;

        IF v_estoque_atual IS NULL THEN
            RAISE EXCEPTION 'Produto % não encontrado para baixar estoque', v_produto_id;
        END IF;

        IF v_estoque_atual < v_qtd THEN
            RAISE EXCEPTION 'Estoque insuficiente para o produto % (disponível %, solicitado %)', v_produto_id, v_estoque_atual, v_qtd;
        END IF;

        -- Decrementar estoque
        UPDATE produtos SET estoque = estoque - v_qtd WHERE id = v_produto_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para decrementar estoque ao inserir pedido
CREATE TRIGGER trigger_decrementar_estoque
    BEFORE INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION decrementar_estoque_pedido();

-- Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_decrementar_estoque';
