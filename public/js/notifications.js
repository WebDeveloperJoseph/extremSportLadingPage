// Sistema de Notificações Global
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Criar container de notificações
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            success: { bg: '#d4edda', border: '#98D447', text: '#155724' },
            error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
            info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;

        notification.style.cssText = `
            background: ${color.bg};
            border-left: 4px solid ${color.border};
            color: ${color.text};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;

        notification.innerHTML = `
            <span style="font-size: 20px;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <span style="opacity: 0.5; font-size: 18px; margin-left: 10px;">×</span>
        `;

        // Adicionar animação CSS
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Click para fechar
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        this.container.appendChild(notification);

        // Auto remover
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        return notification;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Instância global
const notify = new NotificationSystem();

// Exportar para uso global
window.notify = notify;

// Sistema de verificação de conectividade
async function checkServerConnection() {
    const API_BASE = localStorage.getItem('API_BASE') || (window.location.origin.includes('vercel') || window.location.origin.includes('localhost') ? 'https://extremsportladingpage-production.up.railway.app' : window.location.origin);
    
    try {
        const resp = await fetch(`${API_BASE}/api/health`, {
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (resp.ok) {
            const data = await resp.json();
            console.log('✅ Servidor conectado:', data);
            return { connected: true, data };
        } else {
            console.warn('⚠️ Servidor respondeu com erro:', resp.status);
            return { connected: false, status: resp.status };
        }
    } catch (e) {
        console.error('❌ Erro de conexão:', e);
        return { connected: false, error: e.message };
    }
}

// Verificar conexão ao carregar página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const result = await checkServerConnection();
        if (!result.connected) {
            notify.error(
                'Servidor offline! Execute start-server.bat para iniciar o backend.',
                8000
            );
        }
    });
} else {
    checkServerConnection().then(result => {
        if (!result.connected) {
            notify.error(
                'Servidor offline! Execute start-server.bat para iniciar o backend.',
                8000
            );
        }
    });
}
