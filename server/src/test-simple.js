import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Servidor teste rodando em http://127.0.0.1:${PORT}`);
  console.log(`✅ Teste: http://127.0.0.1:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err.message);
});
