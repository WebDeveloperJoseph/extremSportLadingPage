// ==========================================
// GERENCIAMENTO DE CONFIGURAÇÕES DE FRETE
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadShippingSettings();
    setupShippingListeners();
});

function setupShippingListeners() {
    const shippingEnabledCheckbox = document.getElementById('shippingEnabled');
    const shippingTypeSelect = document.getElementById('shippingType');
    
    if (shippingEnabledCheckbox) {
        shippingEnabledCheckbox.addEventListener('change', toggleShippingOptions);
    }
    
    if (shippingTypeSelect) {
        shippingTypeSelect.addEventListener('change', updateShippingTypeDisplay);
    }
}

function toggleShippingOptions() {
    const shippingEnabled = document.getElementById('shippingEnabled').checked;
    const shippingOptions = document.getElementById('shippingOptions');
    
    if (shippingOptions) {
        shippingOptions.style.display = shippingEnabled ? 'block' : 'none';
    }
}

function updateShippingTypeDisplay() {
    const shippingType = document.getElementById('shippingType').value;
    const fixedGroup = document.getElementById('fixedShippingGroup');
    const progressiveGroup = document.getElementById('progressiveShippingGroup');
    
    if (shippingType === 'fixed') {
        fixedGroup.style.display = 'block';
        progressiveGroup.style.display = 'none';
    } else if (shippingType === 'progressive') {
        fixedGroup.style.display = 'none';
        progressiveGroup.style.display = 'block';
    } else {
        fixedGroup.style.display = 'none';
        progressiveGroup.style.display = 'none';
    }
}

function loadShippingSettings() {
    const settings = localStorage.getItem('shippingSettings');
    
    if (settings) {
        try {
            const data = JSON.parse(settings);
            
            document.getElementById('shippingEnabled').checked = data.enabled || false;
            document.getElementById('shippingType').value = data.type || 'fixed';
            document.getElementById('shippingValue').value = data.value || '0.00';
            document.getElementById('progressiveValueBase').value = data.progressiveBase || '100.00';
            document.getElementById('shippingInfo').value = data.info || 'Entrega em até 5 dias úteis';
            
            toggleShippingOptions();
            updateShippingTypeDisplay();
            
            notify.success('Configurações de frete carregadas!', 2000);
        } catch (error) {
            console.error('Erro ao carregar configurações de frete:', error);
            notify.error('Erro ao carregar configurações', 3000);
        }
    }
}

function saveShippingSettings() {
    const shippingSettings = {
        enabled: document.getElementById('shippingEnabled').checked,
        type: document.getElementById('shippingType').value,
        value: parseFloat(document.getElementById('shippingValue').value) || 0,
        progressiveBase: parseFloat(document.getElementById('progressiveValueBase').value) || 100,
        info: document.getElementById('shippingInfo').value
    };
    
    try {
        localStorage.setItem('shippingSettings', JSON.stringify(shippingSettings));
        
        // Também salva no backend se necessário
        fetch('/api/settings/shipping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shippingSettings)
        }).then(response => {
            if (response.ok) {
                notify.success('Configurações de frete salvas com sucesso!', 2500);
            }
        }).catch(error => {
            console.log('Salvo apenas localmente:', error);
            notify.success('Configurações de frete salvas localmente!', 2500);
        });
    } catch (error) {
        console.error('Erro ao salvar configurações de frete:', error);
        notify.error('Erro ao salvar configurações', 3000);
    }
}

// Exportar função para ser usada no carrinho
function getShippingSettings() {
    const settings = localStorage.getItem('shippingSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    return {
        enabled: false,
        type: 'fixed',
        value: 0,
        progressiveBase: 100,
        info: 'Entrega em até 5 dias úteis'
    };
}
