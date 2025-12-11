// Servidor estático simples SEM auto-reload
const express = require('express');
const path = require('path');

const app = express();
const PORT = 5500;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor estático rodando em http://localhost:${PORT}`);
  console.log('🚫 Auto-reload DESABILITADO - página não recarrega automaticamente');
});
