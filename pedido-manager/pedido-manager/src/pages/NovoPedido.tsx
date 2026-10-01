import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, ItemPedido } from "../lib/api";

type ProdutoTamanho = {
  id: number;
  tamanho: string;
  preco: number;
  estoque: number;
};

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  descricao?: string | null;
  imagem?: string | null;
  disponivel: boolean;
  tamanhos: ProdutoTamanho[];
};

type ItemCarrinho = {
  id: number;
  produto: string;
  tamanho: string;
  quantidade: number;
  preco_unitario: number;
};

const initial = {
  produto: "",
  tamanho: "",
  quantidade: 1,
};

export default function NovoPedido() {
  const nav = useNavigate();

  const [form, setForm] = useState(initial);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [error, setError] = useState("");

  async function carregarProdutos() {
    try {
      setCarregandoProdutos(true);
      setError("");

      const resposta = await api.listarProdutos();

      setProdutos(resposta);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar o cardápio."
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosDisponiveis = produtos.filter(
    (produto) =>
      produto.disponivel &&
      produto.tamanhos.some(
        (tamanho) => Number(tamanho.estoque) > 0
      )
  );

  const produtoSelecionado = produtosDisponiveis.find(
    (produto) => produto.nome === form.produto
  );

  const tamanhosDisponiveis =
    produtoSelecionado?.tamanhos.filter(
      (tamanho) =>
        Number(tamanho.estoque) > 0
    ) || [];

  const tamanhoSelecionado =
    tamanhosDisponiveis.find(
      (tamanho) =>
        tamanho.tamanho === form.tamanho
    );

  const precoUnitario =
    Number(tamanhoSelecionado?.preco || 0);

  const estoqueDisponivel =
    Number(tamanhoSelecionado?.estoque || 0);

  const totalAtual =
    precoUnitario *
    Number(form.quantidade || 0);

  const totalCarrinho =
    carrinho.reduce(
      (total, item) =>
        total +
        item.preco_unitario *
          item.quantidade,
      0
    );

  function alterarProduto(produto: string) {
    setForm({
      produto,
      tamanho: "",
      quantidade: 1,
    });

    setError("");
  }

  function alterarTamanho(tamanho: string) {
    setForm({
      ...form,
      tamanho,
      quantidade: 1,
    });

    setError("");
  }

  function alterarQuantidade(valor: number) {
    setError("");

    setForm({
      ...form,
      quantidade: Math.max(1, valor),
    });
  }

  function adicionarAoCarrinho(
    e: FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!form.produto) {
      setError("Selecione um produto.");
      return;
    }

    if (!form.tamanho) {
      setError("Selecione o tamanho.");
      return;
    }

    if (
      !form.quantidade ||
      form.quantidade < 1
    ) {
      setError(
        "A quantidade precisa ser pelo menos 1."
      );
      return;
    }

    if (
      estoqueDisponivel <= 0
    ) {
      setError(
        "Este produto está esgotado."
      );
      return;
    }

    if (
      form.quantidade >
      estoqueDisponivel
    ) {
      setError(
        `Não temos essa quantidade no estoque. Temos ${estoqueDisponivel} em estoque.`
      );
      return;
    }

    if (precoUnitario <= 0) {
      setError(
        "Não foi possível calcular o preço."
      );
      return;
    }

    const itemExistente =
      carrinho.find(
        (item) =>
          item.produto ===
            form.produto &&
          item.tamanho ===
            form.tamanho
      );

    if (itemExistente) {
      const novaQuantidade =
        itemExistente.quantidade +
        Number(form.quantidade);

      if (
        novaQuantidade >
        estoqueDisponivel
      ) {
        setError(
          `Não temos essa quantidade no estoque. Temos ${estoqueDisponivel} em estoque.`
        );
        return;
      }

      setCarrinho(
        carrinho.map((item) =>
          item.id ===
          itemExistente.id
            ? {
                ...item,
                quantidade:
                  novaQuantidade,
              }
            : item
        )
      );
    } else {
      const novoItem: ItemCarrinho = {
        id: Date.now(),
        produto: form.produto,
        tamanho: form.tamanho,
        quantidade:
          Number(form.quantidade),
        preco_unitario:
          precoUnitario,
      };

      setCarrinho([
        ...carrinho,
        novoItem,
      ]);
    }

    setForm(initial);
  }

  function removerDoCarrinho(
    id: number
  ) {
    setCarrinho(
      carrinho.filter(
        (item) => item.id !== id
      )
    );
  }

  function diminuirQuantidade(
    id: number
  ) {
    setCarrinho(
      carrinho
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantidade:
              item.quantidade - 1,
          };
        })
        .filter(
          (item) =>
            item.quantidade > 0
        )
    );
  }

  function aumentarQuantidade(
    id: number
  ) {
    const item =
      carrinho.find(
        (item) => item.id === id
      );

    if (!item) {
      return;
    }

    const produto =
      produtos.find(
        (produto) =>
          produto.nome ===
          item.produto
      );

    const tamanho =
      produto?.tamanhos.find(
        (tamanho) =>
          tamanho.tamanho ===
          item.tamanho
      );

    const estoque =
      Number(
        tamanho?.estoque || 0
      );

    if (
      item.quantidade >= estoque
    ) {
      setError(
        `Não temos essa quantidade no estoque. Temos ${estoque} em estoque.`
      );
      return;
    }

    setError("");

    setCarrinho(
      carrinho.map((itemAtual) =>
        itemAtual.id === id
          ? {
              ...itemAtual,
              quantidade:
                itemAtual.quantidade +
                1,
            }
          : itemAtual
      )
    );
  }

  async function finalizarPedido() {
    setError("");

    if (carrinho.length === 0) {
      setError(
        "Adicione pelo menos um item ao carrinho."
      );
      return;
    }

    setLoading(true);

    try {
      const resposta =
        await api.criarPedido();

      const pedidoId =
        resposta?.id ??
        resposta?.pedido_id;

      if (!pedidoId) {
        throw new Error(
          "A API não retornou o ID do pedido."
        );
      }

      for (const item of carrinho) {
        const itemPedido: ItemPedido = {
          quantidade:
            item.quantidade,
          sabor: item.produto,
          tamanho: item.tamanho,
          preco_unitario: 0,
        };

        await api.adicionarItem(
          Number(pedidoId),
          itemPedido
        );
      }

      setCarrinho([]);

      nav(
        `/pedido/${pedidoId}/endereco`
      );
    } catch (e: any) {
      setError(
        e?.message ||
          "Não foi possível finalizar o pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  function dinheiro(
    valor: number
  ) {
    return Number(
      valor || 0
    ).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <button
        type="button"
        onClick={() =>
          nav("/pedidos")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Pedidos
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Fazer pedido
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Escolha os produtos disponíveis e monte seu carrinho.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Cardápio
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Confira nossas pizzas e bebidas.
            </p>
          </div>

          <div className="bg-slate-50 p-4 md:p-6">
            <img
              src="/cardapio.jpg"
              alt="Cardápio da pizzaria"
              className="mx-auto h-auto w-full rounded-xl border border-slate-200 object-contain shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card h-fit p-6">
            <div className="mb-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <Plus size={24} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Adicionar produto
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Escolha o produto, tamanho e quantidade.
              </p>
            </div>

            {carregandoProdutos ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Carregando produtos...
              </div>
            ) : produtosDisponiveis.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                Nenhum produto disponível no momento.
              </div>
            ) : (
              <form
                onSubmit={
                  adicionarAoCarrinho
                }
                className="space-y-5"
              >
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Produto
                  </span>

                  <select
                    className="input"
                    required
                    value={
                      form.produto
                    }
                    onChange={(e) =>
                      alterarProduto(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione o produto
                    </option>

                    {Array.from(
                      new Set(
                        produtosDisponiveis.map(
                          (produto) =>
                            produto.categoria
                        )
                      )
                    ).map(
                      (categoria) => (
                        <optgroup
                          key={
                            categoria
                          }
                          label={
                            categoria
                          }
                        >
                          {produtosDisponiveis
                            .filter(
                              (produto) =>
                                produto.categoria ===
                                categoria
                            )
                            .map(
                              (
                                produto
                              ) => (
                                <option
                                  key={
                                    produto.id
                                  }
                                  value={
                                    produto.nome
                                  }
                                >
                                  {
                                    produto.nome
                                  }
                                </option>
                              )
                            )}
                        </optgroup>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tamanho
                  </span>

                  <select
                    className="input"
                    required
                    value={
                      form.tamanho
                    }
                    onChange={(e) =>
                      alterarTamanho(
                        e.target.value
                      )
                    }
                    disabled={
                      !form.produto
                    }
                  >
                    <option value="">
                      Selecione o tamanho
                    </option>

                    {tamanhosDisponiveis.map(
                      (tamanho) => (
                        <option
                          key={
                            tamanho.id
                          }
                          value={
                            tamanho.tamanho
                          }
                        >
                          {tamanho.tamanho}{" "}
                          —{" "}
                          {dinheiro(
                            tamanho.preco
                          )}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {tamanhoSelecionado && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {form.produto}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {form.tamanho}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {dinheiro(
                            precoUnitario
                          )}
                        </p>

                      </div>
                    </div>
                  </div>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantidade
                  </span>

                  <input
                    className="input"
                    type="number"
                    min="1"
                    required
                    value={
                      form.quantidade
                    }
                    onChange={(e) =>
                      alterarQuantidade(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    disabled={
                      !form.tamanho
                    }
                  />
                </label>

                {form.produto &&
                  form.tamanho &&
                  precoUnitario > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Total do item
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {form.quantidade}{" "}
                            ×{" "}
                            {dinheiro(
                              precoUnitario
                            )}
                          </p>
                        </div>

                        <p className="text-lg font-bold text-slate-900">
                          {dinheiro(
                            totalAtual
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                >
                  <Plus size={18} />
                  Adicionar ao carrinho
                </button>
              </form>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <ShoppingCart
                  size={21}
                  className="text-slate-900"
                />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Carrinho
                  </h2>

                  <p className="text-xs text-slate-500">
                    {carrinho.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        item.quantidade,
                      0
                    )}{" "}
                    item(ns)
                  </p>
                </div>
              </div>

              <span className="text-lg font-bold text-slate-900">
                {dinheiro(
                  totalCarrinho
                )}
              </span>
            </div>

            {carrinho.length ===
            0 ? (
              <div className="p-8 text-center">
                <ShoppingCart
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Seu carrinho está vazio.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Adicione produtos para continuar.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {carrinho.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.produto}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {item.tamanho}
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {dinheiro(
                                item.preco_unitario
                              )}{" "}
                              cada
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removerDoCarrinho(
                                item.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remover item"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() =>
                                diminuirQuantidade(
                                  item.id
                                )
                              }
                              className="px-3 py-1.5 text-lg font-medium text-slate-600 hover:bg-slate-50"
                            >
                              −
                            </button>

                            <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                              {
                                item.quantidade
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                aumentarQuantidade(
                                  item.id
                                )
                              }
                              className="px-3 py-1.5 text-lg font-medium text-slate-600 hover:bg-slate-50"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-bold text-slate-900">
                            {dinheiro(
                              item.preco_unitario *
                                item.quantidade
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">
                      Total
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      {dinheiro(
                        totalCarrinho
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      finalizarPedido
                    }
                    disabled={loading}
                    className="btn-primary mt-4 w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Criando pedido...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={18}
                        />
                        Finalizar pedido
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}