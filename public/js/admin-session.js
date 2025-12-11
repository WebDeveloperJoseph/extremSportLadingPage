/**
 * Sistema de Proteção de Sessão Admin
 * Verificar autenticação em páginas protegidas
 */

function validateAdminSession() {
    const session = sessionStorage.getItem('adminSession');
    const rememberMe = localStorage.getItem('adminRememberMe');

    // Se não tem sessão e não marcou lembrar, redirecionar para login
    if (!session && !rememberMe) {
        redirectToLogin();
        return false;
    }

    // Se tem rememberMe mas sem sessão, criar nova sessão
    if (rememberMe && !session) {
        sessionStorage.setItem('adminSession', btoa(JSON.stringify({
            login: Date.now(),
            hash: Math.random()
        })));
    }

    // Verificação de timeout de sessão (30 minutos)
    const lastActivity = sessionStorage.getItem('adminLastActivity');
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutos

    if (lastActivity && (now - parseInt(lastActivity)) > timeout) {
        clearAdminSession();
        redirectToLogin();
        return false;
    }

    // Atualizar último tempo de atividade
    sessionStorage.setItem('adminLastActivity', now.toString());

    return true;
}

function clearAdminSession() {
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminLastActivity');
    localStorage.removeItem('adminRememberMe');
}

function redirectToLogin() {
    window.location.href = '../admin/login.html';
}

function logoutAdmin() {
    clearAdminSession();
    redirectToLogin();
}

// Verificar sessão ao carregar página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateAdminSession);
} else {
    validateAdminSession();
}

// Rastrear atividade do usuário
document.addEventListener('click', () => {
    sessionStorage.setItem('adminLastActivity', Date.now().toString());
});

document.addEventListener('keydown', () => {
    sessionStorage.setItem('adminLastActivity', Date.now().toString());
});

// Logout ao fechar abas
window.addEventListener('beforeunload', () => {
    // Limpar dados sensíveis ao sair
});
