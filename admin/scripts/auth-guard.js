// Auth Guard - Verificar autenticação em todas as páginas admin
(async function() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
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
        window.location.href = 'index.html';
        return;
    }
    
    // Disponibilizar admin e sessão globalmente para diagnósticos
    window.currentAdmin = admin;
    window.currentSession = session;

    // Atualizar email do usuário na sidebar
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = session.user.email;
    }

    // Injetar link 'Ferramentas' apenas para super_admin
    try {
        const nav = document.getElementById('adminNav');
        if (nav && admin.role === 'super_admin') {
            const exists = nav.querySelector('a[href="tools.html"]');
            if (!exists) {
                const a = document.createElement('a');
                a.href = 'tools.html';
                a.className = 'nav-link';
                a.innerHTML = '<span class="icon">🛠️</span> Ferramentas';
                nav.appendChild(a);
            }
        }

        // Injetar link 'Clientes' para todos admins
        if (nav) {
            const existsClientes = nav.querySelector('a[href="clientes.html"]');
            if (!existsClientes) {
                const a2 = document.createElement('a');
                a2.href = 'clientes.html';
                a2.className = 'nav-link';
                a2.innerHTML = '<span class="icon">👥</span> Clientes';
                nav.insertBefore(a2, nav.querySelector('a[href="tools.html"]') || null);
            }
        }
    } catch (e) {
        console.warn('Falha ao injetar link Ferramentas:', e);
    }
})();

// Função de logout
async function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    }
}

// Toggle navegação mobile
function toggleAdminNav() {
    const nav = document.getElementById('adminNav');
    const toggle = document.querySelector('.nav-toggle');
    
    if (nav) {
        nav.classList.toggle('active');
    }
    
    if (toggle) {
        toggle.classList.toggle('active');
    }
}
