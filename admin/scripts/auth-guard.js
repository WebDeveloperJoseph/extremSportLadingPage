// Auth Guard - Verificar autenticação em todas as páginas admin
(async function() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar se é admin
    const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (error || !admin) {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return;
    }
    
    // Atualizar email do usuário na sidebar
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = session.user.email;
    }
})();

// Função de logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    }
}
