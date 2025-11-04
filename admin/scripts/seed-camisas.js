// Seed de Camisas de Times
const STORAGE_BUCKET = 'produtos';

// Lista de camisas disponíveis em img/camisasTimes/
const camisasDisponiveis = [
    {
        arquivo: '1.png',
        nome: 'Camisa Flamengo',
        descricao: 'Camisa oficial de alta qualidade',
        preco: 149.90,
        keywords: ['flamengo', 'crf', 'mengão', 'camisa'],
        emoji: '👕',
        cor: '#D00000'
    },
    {
        arquivo: '2.png',
        nome: 'Camisa Palmeiras',
        descricao: 'Camisa oficial de alta qualidade',
        preco: 149.90,
        keywords: ['palmeiras', 'sep', 'verdão', 'camisa'],
        emoji: '👕',
        cor: '#006437'
    },
    {
        arquivo: '3.png',
        nome: 'Camisa Corinthians',
        descricao: 'Camisa oficial de alta qualidade',
        preco: 149.90,
        keywords: ['corinthians', 'sccp', 'timão', 'camisa'],
        emoji: '👕',
        cor: '#000000'
    },
    {
        arquivo: '4.png',
        nome: 'Camisa São Paulo',
        descricao: 'Camisa oficial de alta qualidade',
        preco: 149.90,
        keywords: ['são paulo', 'spfc', 'tricolor', 'camisa'],
        emoji: '👕',
        cor: '#FF0000'
    }
];

// Sistema de notificações Toast (reutilizado)
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const titles = {
        success: title || 'Sucesso!',
        error: title || 'Erro!',
        warning: title || 'Atenção!',
        info: title || 'Informação'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function log(msg, tipo = 'info') {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${tipo}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Renderizar lista de camisas
function renderizarCamisas() {
    const container = document.getElementById('camisasList');
    const count = document.getElementById('countImages');
    
    count.textContent = camisasDisponiveis.length;
    
    container.innerHTML = camisasDisponiveis.map((cam, idx) => `
        <div class="camisa-item" data-idx="${idx}">
            <div class="camisa-preview">
                <img src="../img/camisasTimes/${cam.arquivo}" alt="${cam.nome}">
            </div>
            <div class="camisa-details">
                <input type="text" class="input-nome" value="${cam.nome}" placeholder="Nome do produto">
                <textarea class="input-desc" rows="2" placeholder="Descrição">${cam.descricao}</textarea>
                <input type="number" class="input-preco" value="${cam.preco}" step="0.01" placeholder="Preço">
                <input type="text" class="input-keywords" value="${cam.keywords.join(', ')}" placeholder="Keywords (separadas por vírgula)">
                <label style="display:flex;align-items:center;gap:8px;margin-top:8px;">
                    <input type="checkbox" class="input-destaque">
                    <span>Destaque</span>
                </label>
            </div>
        </div>
    `).join('');
}

// Cadastrar todas as camisas
async function cadastrarTodasCamisas() {
    const btn = document.getElementById('btnCadastrar');
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';
    
    log('Iniciando cadastro de camisas...', 'info');
    
    let sucesso = 0;
    let falhas = 0;
    
    for (let idx = 0; idx < camisasDisponiveis.length; idx++) {
        const item = document.querySelector(`.camisa-item[data-idx="${idx}"]`);
        const nome = item.querySelector('.input-nome').value.trim();
        const descricao = item.querySelector('.input-desc').value.trim();
        const preco = parseFloat(item.querySelector('.input-preco').value);
        const keywordsRaw = item.querySelector('.input-keywords').value.trim();
        const destaque = item.querySelector('.input-destaque').checked;
        const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(Boolean);
        
        const cam = camisasDisponiveis[idx];
        
        try {
            log(`Processando: ${nome}...`, 'info');
            
            // 1. Buscar o arquivo local
            const localPath = `../img/camisasTimes/${cam.arquivo}`;
            const response = await fetch(localPath);
            if (!response.ok) throw new Error(`Falha ao buscar ${cam.arquivo}`);
            
            const blob = await response.blob();
            
            // 2. Upload para Storage
            const fileExt = cam.arquivo.split('.').pop();
            const fileName = `camisa-${Date.now()}-${idx}.${fileExt}`;
            
            log(`Fazendo upload de ${fileName}...`, 'info');
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, blob);
            
            if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);
            
            // 3. Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);
            
            // 4. Inserir produto com descrição contendo keywords (para filtro funcionar)
            const descricaoComKeywords = `${descricao} [Tags: ${keywords.join(', ')}]`;
            
            const produtoData = {
                nome,
                descricao: descricaoComKeywords,
                preco,
                emoji: cam.emoji || '👕',
                imagem_url: publicUrl,
                destaque: destaque || false,
                estoque: 10 // estoque inicial padrão
            };
            
            const { error: insertError } = await supabase
                .from('produtos')
                .insert([produtoData]);
            
            if (insertError) throw new Error(`Erro ao inserir: ${insertError.message}`);
            
            log(`✅ ${nome} cadastrado com sucesso!`, 'success');
            sucesso++;
            
        } catch (error) {
            log(`❌ Erro em ${nome}: ${error.message}`, 'error');
            console.error(error);
            falhas++;
        }
    }
    
    btn.disabled = false;
    btn.textContent = 'Cadastrar Todas as Camisas';
    
    log(`\n=== RESUMO ===`, 'info');
    log(`Sucesso: ${sucesso}`, 'success');
    log(`Falhas: ${falhas}`, falhas > 0 ? 'error' : 'info');
    
    if (sucesso > 0) {
        showToast(`${sucesso} camisa(s) cadastrada(s) com sucesso!`, 'success');
    }
    if (falhas > 0) {
        showToast(`${falhas} erro(s) encontrado(s). Verifique o log.`, 'warning');
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    renderizarCamisas();
    log('Pronto para cadastrar camisas!', 'info');
});
