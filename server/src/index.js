import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quotesRouter from './routes/quotes.js';
import uploadRouter from './routes/upload.js';
import productsRouter from './routes/products.js';
import bannersRouter from './routes/banners.js';
import featuredRouter from './routes/featured.js';
import settingsRouter from './routes/settings.js';
import ordersRouter from './routes/orders.js';
import { initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

console.log('📦 Inicializando banco de dados...');

// Inicializa DB
try {
  initDb();
  console.log('✅ Banco de dados inicializado');
} catch(err) {
  console.error('❌ Erro ao inicializar BD:', err);
}

// Static files - servir frontend, admin, js, uploads, assets
const uploadsPath = path.join(__dirname, '..', 'uploads');
const publicPath = path.join(__dirname, '..', '..', 'public');
const adminPath = path.join(__dirname, '..', '..', 'admin');
const assetsPath = path.join(__dirname, '..', '..', 'assets');

console.log('📁 Pasta de uploads:', uploadsPath);
console.log('📁 Pasta de public:', publicPath);
console.log('📁 Pasta de admin:', adminPath);
console.log('📁 Pasta de assets:', assetsPath);

// Servir arquivos estáticos
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(publicPath));  // Serve public como root (/)
app.use('/admin', express.static(adminPath));
app.use('/assets', express.static(assetsPath));  // Serve assets com prefixo

app.get('/api/health', (req, res) => {
  console.log('✅ Health check recebido');
  res.json({ status: 'ok', service: 'pretinho-backend', time: new Date().toISOString() });
});

console.log('🔌 Montando rotas...');
app.use('/api/company-quotes', quotesRouter);
console.log('  ✓ quotes');
app.use('/api/upload', uploadRouter);
console.log('  ✓ upload');
app.use('/api/products', productsRouter);
console.log('  ✓ products');
app.use('/api/banners', bannersRouter);
console.log('  ✓ banners');
app.use('/api/featured-groups', featuredRouter);
console.log('  ✓ featured');
app.use('/api/settings', settingsRouter);
console.log('  ✓ settings');
app.use('/api/orders', ordersRouter);
console.log('  ✓ orders');

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Erro ao iniciar servidor:', err);
    process.exit(1);
  }
  console.log(`✅ Pretinho backend rodando em http://localhost:${PORT}`);
  console.log(`✅ API Health: http://localhost:${PORT}/api/health`);
  console.log(`✅ Produtos: http://localhost:${PORT}/api/products`);
});
