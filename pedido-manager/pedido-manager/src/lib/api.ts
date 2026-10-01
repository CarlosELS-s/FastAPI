export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

/* =========================
   TIPOS
========================= */

export type Login = {
  nome?: string;
  telefone?: number;
  email?: string;
  senha?: string;
};

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export type Usuario = {
  id?: number;
  nome: string;
  telefone: number;
  email?: string | null;
  senha?: string;
  adm?: boolean | null;
  admin?: boolean | null;
  ativo?: boolean | null;
};

export type ItemPedido = {
  quantidade: number;
  sabor: string;
  tamanho: string;
  preco_unitario: number;
};

export type Pedido = {
  id: number;
  status: string;
  preco: number;
  usuario?: number;

  multa?: number;

  pagamento?: string | null;
  forma_pagamento?: string | null;

  data_finalizacao?: string | null;

  codigo_entrega?: string | null;

  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  complemento?: string | null;

  itens: ItemPedido[];
};

/* =========================
   TOKEN
========================= */

function token() {
  return localStorage.getItem(
    "pedido_token"
  );
}

/* =========================
   REQUEST
========================= */

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(
    options.headers
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (
    options.auth !== false &&
    token()
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token()}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const text =
    await response.text();

  let data: any = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.detail?.[0]?.msg ||
      data?.detail ||
      data?.message ||
      `Erro ${response.status}`;

    throw new Error(
      typeof message === "string"
        ? message
        : "Não foi possível concluir a operação."
    );
  }

  return data as T;
}

/* =========================
   API
========================= */

export const api = {
  /* =========================
     USUÁRIO / AUTH
  ========================= */
listarUsuarios: () =>
  request<Usuario[]>(
    "/auth/usuarios"
  ),

informacaoUsuarioAdmin: (
  id: number
) =>
  request<Usuario>(
    `/auth/usuarios/${id}`
  ),

alterarStatusUsuario: (
  id: number
) =>
  request<Usuario>(
    `/auth/usuarios/${id}/status`,
    {
      method: "PATCH",
    }
  ),

  informacaoUsuario: (
    id: number
  ) =>
    request<any>(
      `/pedidos/informacao-usuario/${id}`
    ),

  login: (body: Login) =>
    request<any>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      }
    ),

  loginForm: (
    body: URLSearchParams
  ) =>
    request<any>(
      "/auth/login-form",
      {
        method: "POST",
        body,
        auth: false,
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    ),

  criarConta: (
    body: Usuario
  ) =>
    request<any>(
      "/auth/criar_conta",
      {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      }
    ),

  refresh: () =>
    request<any>(
      "/auth/refresh"
    ),

  adicionarEmail: (
    id: number,
    email: string
  ) =>
    request<any>(
      `/auth/adicionar-email/${id}`,
      {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      }
    ),

  verificarEmail: (
    id: number,
    codigo: string
  ) =>
    request<any>(
      `/auth/verificar-email/${id}`,
      {
        method: "POST",
        body: JSON.stringify({
          codigo,
        }),
      }
    ),

  /* =========================
     PEDIDOS
  ========================= */
criarProduto: (produto: {
  nome: string;
  categoria: string;
  descricao?: string | null;
  imagem?: string | null;
  disponivel: boolean;
  tamanhos: {
    tamanho: string;
    preco: number;
    estoque: number;
  }[];
}) =>
  request<any>("/produtos/", {
    method: "POST",
    body: JSON.stringify(produto),
  }),

removerProduto: (id: number) =>
  request<any>(`/produtos/${id}`, {
    method: "DELETE",
  }),

listarTodosProdutos: () =>
  request<any[]>("/produtos/admin"),

listarProdutos: () =>
  request<any[]>("/produtos/"),
alterarPrecoProduto: (idTamanho: number, preco: number) =>
  request<any>(`/produtos/tamanho/${idTamanho}`, {
    method: "PATCH",
    body: JSON.stringify({
      preco,
    }),
  }),

alterarEstoqueProduto: (idTamanho: number, estoque: number) =>
  request<any>(`/produtos/tamanho/${idTamanho}/estoque`, {
    method: "PATCH",
    body: JSON.stringify({
      estoque,
    }),
  }),

alterarDisponibilidadeProduto: (id: number) =>
  request<any>(`/produtos/${id}/disponibilidade`, {
    method: "PATCH",
  }),

  listarPedidos: () =>
    request<Pedido[]>(
      "/pedidos/listar/pedidos-usuario"
    ),

  todosPedidos: async () => {
    const resposta =
      await request<{
        pedidos: Pedido[];
      }>(
        "/pedidos/listar"
      );

    return resposta.pedidos;
  },

  criarPedido: () =>
    request<any>(
      "/pedidos/pedido",
      {
        method: "POST",
      }
    ),

  visualizarPedido: async (
    id: number
  ) => {
    const resposta =
      await request<{
        quantidade_item_pedido?: number;
        quantidade_iten_pedido?: number;
        pedido: Pedido;
      }>(
        `/pedidos/pedido/${id}`
      );

    return resposta.pedido;
  },

  adicionarItem: (
    id: number,
    body: ItemPedido
  ) =>
    request<any>(
      `/pedidos/adicionar-item/${id}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),

  removerItem: (
    id: number
  ) =>
    request<any>(
      `/pedidos/remover-item/${id}`,
      {
        method: "POST",
      }
    ),

  /* =========================
     FINALIZAR
  ========================= */

  finalizarPedido: (
    id: number,
    formaPagamento: string
  ) =>
    request<any>(
      `/pedidos/pedido/finalizar/${id}`,
      {
        method: "POST",
        body: JSON.stringify({
          forma_pagamento:
            formaPagamento,
        }),
      }
    ),

  /* =========================
     CANCELAR
  ========================= */

  cancelarPedido: (
    id: number
  ) =>
    request<any>(
      `/pedidos/pedido/cancelar/${id}`,
      {
        method: "POST",
      }
    ),

  pagarMulta: (
    id: number,
    formaPagamento: string
  ) =>
    request<any>(
      `/pedidos/pedido/cancelar/${id}/pagar-multa`,
      {
        method: "POST",
        body: JSON.stringify({
          forma_pagamento:
            formaPagamento,
        }),
      }
    ),

  /* =========================
     PEDIDO PRONTO
  ========================= */

  marcarPedidoPronto: (
    id: number
  ) =>
    request<any>(
      `/pedidos/pedido/Pronto/${id}`,
      {
        method: "POST",
      }
    ),

  pedidoPronto: (
    id: number
  ) =>
    request<any>(
      `/pedidos/pedido/Pronto/${id}`,
      {
        method: "POST",
      }
    ),

  /* =========================
     EM ENTREGA
  ========================= */

  emEntrega: (
    id: number
  ) =>
    request<any>(
      `/pedidos/Em-entrega/${id}`,
      {
        method: "POST",
      }
    ),

  /* =========================
     ENTREGUE
  ========================= */

  entregue: (
    id: number,
    codigo: string
  ) =>
    request<any>(
      `/pedidos/entregue/${id}`,
      {
        method: "POST",
        body: JSON.stringify({
          codigo,
        }),
      }
    ),

  /* =========================
     ENDEREÇO
  ========================= */

  adicionarEndereco: (
    id: number,
    endereco: {
      cep: string;
      rua: string;
      numero: string;
      bairro: string;
      complemento?: string;
    }
  ) =>
    request<any>(
      `/pedidos/pedido/endereco/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(
          endereco
        ),
      }
    ),
};