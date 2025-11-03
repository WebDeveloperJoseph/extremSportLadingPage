-- =============================================
-- EXTREME SPORT - DATABASE SCHEMA
-- =============================================

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco > 0),
    emoji VARCHAR(10),
    imagem_url TEXT,
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    endereco_cep VARCHAR(10) NOT NULL,
    endereco_rua VARCHAR(255) NOT NULL,
    endereco_numero VARCHAR(20) NOT NULL,
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(255) NOT NULL,
    endereco_cidade VARCHAR(255) NOT NULL,
    endereco_estado VARCHAR(2) NOT NULL,
    produtos_json JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('pix', 'cartao', 'boleto')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'enviado', 'entregue', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Admins (via Supabase Auth)
-- Obs: Apenas metadados, autenticação é via auth.users
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON produtos(destaque) WHERE destaque = TRUE;
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_email ON pedidos(cliente_email);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUTOS
-- Todos podem ver produtos
CREATE POLICY "Produtos são visíveis para todos"
    ON produtos FOR SELECT
    TO PUBLIC
    USING (true);

-- Apenas admins podem inserir produtos
CREATE POLICY "Apenas admins podem criar produtos"
    ON produtos FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Apenas admins podem atualizar produtos
CREATE POLICY "Apenas admins podem atualizar produtos"
    ON produtos FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Apenas admins podem deletar produtos
CREATE POLICY "Apenas admins podem deletar produtos"
    ON produtos FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Políticas para PEDIDOS
-- Apenas admins podem ver pedidos
CREATE POLICY "Apenas admins podem ver pedidos"
    ON pedidos FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Qualquer um pode inserir pedido (cliente fazendo checkout)
CREATE POLICY "Qualquer um pode criar pedido"
    ON pedidos FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Apenas admins podem atualizar pedidos
CREATE POLICY "Apenas admins podem atualizar pedidos"
    ON pedidos FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Apenas admins podem deletar pedidos
CREATE POLICY "Apenas admins podem deletar pedidos"
    ON pedidos FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );

-- Políticas para ADMINS
-- Admins só podem ver a si mesmos
CREATE POLICY "Admins podem ver apenas seus próprios dados"
    ON admins FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Apenas super_admins podem criar novos admins
CREATE POLICY "Apenas super_admins podem criar admins"
    ON admins FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid() AND admins.role = 'super_admin'
        )
    );

-- =============================================
-- INSERIR PRIMEIRO ADMIN (VOCÊ)
-- =============================================
-- IMPORTANTE: Execute isso DEPOIS de criar sua conta no Supabase Auth
-- Substitua 'SEU_UUID_AQUI' pelo UUID que você receber ao criar o usuário
-- Substitua 'seu-email@exemplo.com' pelo seu email

-- EXEMPLO (NÃO EXECUTAR AINDA - aguardar criação do usuário):
-- INSERT INTO admins (id, email, role) VALUES 
-- ('UUID_DO_USUARIO', 'seu-email@exemplo.com', 'super_admin');
