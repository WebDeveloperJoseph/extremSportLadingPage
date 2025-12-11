// Sistema de Login Admin com Segurança
// Simples encriptação XOR para dados em transit (use HTTPS em produção)
function simpleEncrypt(str, key = 'pretinho2025') {
    return btoa(String.fromCharCode(...str.split('').map((char, i) => char.charCodeAt(0) ^ key.charCodeAt(i % key.length))));
}

function simpleDecrypt(encoded, key = 'pretinho2025') {
    try {
        return atob(encoded).split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
    } catch(e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const btnLogin = loginForm.querySelector('.btn-login');

    // Credenciais padrão (em produção, isso seria no backend com hash bcrypt)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'admin123'
    };

    console.log('📋 Login form carregado');
    console.log('✓ Credenciais esperadas:', ADMIN_CREDENTIALS);

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        console.log('🔐 Tentativa de login:');
        console.log(`  Usuario: "${username}"`);
        console.log(`  Senha: "${password}"`);
        console.log(`  Lembrar: ${remember}`);

        // Desabilitar botão
        btnLogin.disabled = true;
        btnLogin.textContent = 'Verificando...';

        // Pequeno delay para simular processamento
        await new Promise(resolve => setTimeout(resolve, 500));

        // Validação local das credenciais
        const isValid = username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
        
        console.log('Comparação:');
        console.log(`  "${username}" === "${ADMIN_CREDENTIALS.username}" ? ${username === ADMIN_CREDENTIALS.username}`);
        console.log(`  "${password}" === "${ADMIN_CREDENTIALS.password}" ? ${password === ADMIN_CREDENTIALS.password}`);
        console.log(`  Resultado final: ${isValid}`);

        if (isValid) {
            // Tentar enviar para backend se disponível
            try {
                const payload = {
                    user: simpleEncrypt(username),
                    pass: simpleEncrypt(password),
                    timestamp: Date.now()
                };

                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Cache-Control': 'no-cache'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(payload),
                    timeout: 3000
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        loginSuccess(remember, data.token);
                    } else {
                        loginSuccess(remember); // Fallback
                    }
                } else {
                    loginSuccess(remember); // Backend indisponível, usar local
                }
            } catch (error) {
                // Backend não disponível, aceitar credencial local
                console.log('🟡 Backend indisponível, autenticando localmente');
                loginSuccess(remember);
            }
        } else {
            loginFailed();
        }

        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar no Sistema';
    });

    function loginSuccess(remember, token = null) {
        // Token de sessão (não senha!)
        const sessionToken = btoa(JSON.stringify({login: Date.now(), hash: Math.random()}));
        sessionStorage.setItem('adminSession', sessionToken);
        
        if (remember) {
            localStorage.setItem('adminRememberMe', 'true');
        }

        // Limpar campos
        loginForm.reset();

        console.log('✅ Login realizado com sucesso!');
        
        // Redirecionar para admin
        setTimeout(() => {
            window.location.href = './index.html';
        }, 500);
    }

    function loginFailed() {
        errorMessage.textContent = '❌ Usuário ou senha incorretos!';
        errorMessage.style.display = 'block';

        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // Verificar se já está logado
    if (sessionStorage.getItem('adminSession')) {
        window.location.href = './index.html';
    } else if (localStorage.getItem('adminRememberMe')) {
        sessionStorage.setItem('adminSession', btoa(JSON.stringify({login: Date.now(), hash: Math.random()})));
        window.location.href = './index.html';
    }
});
