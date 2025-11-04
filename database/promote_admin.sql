-- PROMOVER USUÁRIO A ADMIN (rodar no SQL Editor do Supabase)
-- Opção A: Já tem o UUID do usuário (copie de Authentication > Users)
-- Substitua os valores e rode:
--
-- INSERT INTO admins (id, email, role)
-- VALUES ('UUID-AQUI', 'email-do-usuario@exemplo.com', 'admin');
--
-- Ou use 'super_admin' no lugar de 'admin' para acesso total.

-- Opção B: Promover usando apenas o email (resolve o UUID automaticamente)
-- Altere o email abaixo e rode:
-- A execução no SQL Editor tem permissões para consultar auth.users

INSERT INTO admins (id, email, role)
SELECT u.id, u.email, 'admin'
FROM auth.users u
WHERE u.email = 'SEU-EMAIL-AQUI@exemplo.com'
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- Para dar acesso total:
-- UPDATE admins SET role = 'super_admin' WHERE email = 'SEU-EMAIL-AQUI@exemplo.com';
