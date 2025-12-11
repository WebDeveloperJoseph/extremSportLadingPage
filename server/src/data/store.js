import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname);
const quotesPath = path.join(dataDir, 'quotes.json');

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(quotesPath)) {
    fs.writeFileSync(quotesPath, '[]', 'utf-8');
  }
}

export function getQuotes() {
  ensureFile();
  const raw = fs.readFileSync(quotesPath, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuotes(quotes) {
  ensureFile();
  fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), 'utf-8');
}

export function addQuote(quote) {
  const quotes = getQuotes();
  quotes.push(quote);
  saveQuotes(quotes);
  return quote;
}

export function getQuoteById(id) {
  const quotes = getQuotes();
  return quotes.find(q => q.id === id) || null;
}
