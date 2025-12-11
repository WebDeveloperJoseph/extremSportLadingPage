# Pretinho Backend (Orçamentos B2B)

API simples em Node.js/Express para receber orçamentos de empresas (CNPJ), listar e exportar em Excel (.xlsx) e Word (.docx). Persistência local via arquivo JSON para desenvolvimento.

## Requisitos
- Node.js 18+

## Instalação

No PowerShell do Windows:

```powershell
cd "c:\Users\JoseDev\Desktop\mercado-pretinho\server"
npm install
```

## Rodando o servidor (dev)

```powershell
npm run dev
```

O servidor sobe em `http://localhost:3333` por padrão. Você pode alterar a porta com `PORT=xxxx` no arquivo `.env` (opcional).

## Rotas principais

- `GET /api/health` → status do serviço
- `POST /api/company-quotes` → cria um orçamento B2B
  - Body JSON:
    ```json
    {
      "company": { "cnpj": "00.000.000/0000-00", "razaoSocial": "Empresa X", "email": "contato@x.com", "telefone": "(11) 99999-9999" },
      "items": [ { "productId": 1, "name": "Caderno", "price": 15.9, "quantity": 10 } ],
      "discount": 0,
      "shipping": 0,
      "notes": "Entrega em até 7 dias"
    }
    ```
- `GET /api/company-quotes` → lista orçamentos
- `GET /api/company-quotes/:id` → detalhes de um orçamento
- `PATCH /api/company-quotes/:id/status` → altera status ("novo", "em-analise", "aprovado", "rejeitado", "enviado")
- `GET /api/company-quotes/:id/export?format=xlsx|docx` → exporta orçamento

## Integração rápida no Frontend

- Para enviar um orçamento do carrinho como empresa (CNPJ):

```js
async function enviarOrcamentoEmpresa(payload) {
  const resp = await fetch('http://localhost:3333/api/company-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) throw new Error('Falha ao enviar orçamento');
  return resp.json();
}
```

`payload` deve conter `company`, `items`, `discount`, `shipping` e `notes` conforme o exemplo acima.

## Observações
- Persistência é feita em `src/data/quotes.json` (criado automaticamente).
- Uso local e desenvolvimento. Para produção, considere um banco de dados.
