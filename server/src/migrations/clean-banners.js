/**
 * Migração para remover banners duplicados
 * Mantém apenas os 3 primeiros banners e remove os duplicados (id > 685)
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'pretinho.db');

console.log('🔧 Iniciando limpeza de banners...');
console.log('📂 Caminho do banco:', dbPath);

const cleanBanners = async () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('❌ Erro ao abrir banco de dados:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Banco de dados aberto');
      
      // Primeiro, verifica quantos banners existem
      db.get('SELECT COUNT(*) as total FROM banners', (err, row) => {
        if (err) {
          console.error('❌ Erro ao contar banners:', err.message);
          db.close();
          reject(err);
          return;
        }
        
        console.log(`📊 Total de banners antes da limpeza: ${row.total}`);
        
        // Remove banners duplicados (mantém apenas os primeiros 3-5)
        db.run('DELETE FROM banners WHERE id > 5', function(err) {
          if (err) {
            console.error('❌ Erro ao deletar banners:', err.message);
            db.close();
            reject(err);
            return;
          }
          
          console.log(`✅ ${this.changes} banners duplicados removidos`);
          
          // Verifica quantos restaram
          db.get('SELECT COUNT(*) as total FROM banners', (err, row) => {
            if (err) {
              console.error('⚠️  Aviso: Erro ao contar banners após limpeza:', err.message);
            } else {
              console.log(`📊 Total de banners após limpeza: ${row.total}`);
            }
            
            // Vacuum para otimizar o banco
            db.run('VACUUM', (err) => {
              if (err) {
                console.error('⚠️  Aviso: Erro ao executar VACUUM:', err.message);
              } else {
                console.log('✅ Banco de dados otimizado (VACUUM executado)');
              }
              
              db.close((err) => {
                if (err) {
                  console.error('❌ Erro ao fechar banco:', err.message);
                  reject(err);
                } else {
                  console.log('✅ Migração de banners concluída com sucesso!');
                  resolve();
                }
              });
            });
          });
        });
      });
    });
  });
};

// Executa a migração se rodado diretamente
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || 
                      import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  console.log('🚀 Executando migração diretamente...');
  cleanBanners()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erro na execução:', err);
      process.exit(1);
    });
}

export default cleanBanners;
