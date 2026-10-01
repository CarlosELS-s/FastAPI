# Pedido Manager

Front-end React + TypeScript + Tailwind CSS + Lucide Icons para a API FastAPI fornecida.

## Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## API

A camada `src/lib/api.ts` está estruturada para:

- `POST /auth/login`
- `POST /auth/login-form`
- `POST /auth/criar_conta`
- `GET /auth/refresh`
- `GET /pedidos/listar/pedidos-usuario`
- `GET /pedidos/listar`
- `POST /pedidos/pedido`
- `GET /pedidos/pedido/{id_pedido}`
- `POST /pedidos/adicionar-item/{id_pedido}`
- `POST /pedidos/remover-item/{id_item_pedido}`
- `POST /pedidos/pedido/finalizar/{id_pedido}`
- `POST /pedidos/pedido/cancelar/{id_pedido}`

O token é salvo em `localStorage` como `pedido_token` e enviado como `Authorization: Bearer ...`.

### Observações sobre o OpenAPI

1. O contrato não informa o formato exato da resposta de login. O front tenta `access_token`, `token` e `accessToken`, e faz fallback para `/auth/login-form`.
2. `POST /pedidos/pedido` não possui body no contrato; o front chama sem body.
3. `ItemPedidoSchema` não expõe `id_item_pedido`, então a ação de remover item não é colocada em cada linha sem que a API devolva esse ID.
4. A URL da API está em `src/lib/api.ts` como `http://127.0.0.1:8000`, exatamente como solicitado.

## CORS

O FastAPI precisa permitir a origem do Vite (`http://localhost:5173`) durante o desenvolvimento. Exemplo:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Estrutura

- `src/pages`: telas
- `src/components`: layout e componentes reutilizáveis
- `src/context/AuthContext.tsx`: sessão/autenticação
- `src/lib/api.ts`: cliente HTTP e tipos derivados do OpenAPI
