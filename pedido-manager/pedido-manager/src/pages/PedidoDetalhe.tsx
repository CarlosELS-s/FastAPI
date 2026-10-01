import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  XCircle,
  Truck,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ItemPedido, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

const initial = {
  quantidade: 1,
  sabor: "",
  tamanho: "",
};

export default function PedidoDetalhe() {
  const { id } = useParams();
  const pedidoId = Number(id);
  const nav = useNavigate();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const resposta = await api.visualizarPedido(pedidoId);

      const dados =
        resposta?.pedido &&
        typeof resposta.pedido === "object"
          ? resposta.pedido
          : resposta;

      setPedido(dados);
    } catch (e: any) {
      setError(
        e.message ||
          "Não foi possível carregar o pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(pedidoId)) {
      load();
    }
  }, [pedidoId]);

  async function adicionarItem(e: FormEvent) {
    e.preventDefault();

    if (!pedido) return;

    if (
      pedido.status.toUpperCase() !==
      "PENDENTE"
    ) {
      setError(
        "Não é possível adicionar itens a este pedido."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const item: ItemPedido = {
        quantidade: form.quantidade,
        sabor: form.sabor,
        tamanho: form.tamanho,
        preco_unitario: 0,
      };

      await api.adicionarItem(
        pedidoId,
        item
      );

      setForm(initial);
      await load();
    } catch (e: any) {
      setError(
        e.message ||
          "Não foi possível adicionar o item."
      );
    } finally {
      setSaving(false);
    }
  }

  function irParaPagamento() {
    if (!pedido) return;

    if (
      !pedido.itens ||
      pedido.itens.length === 0
    ) {
      setError(
        "Adicione pelo menos um item antes de finalizar o pedido."
      );
      return;
    }

    nav(
      `/pedido/${pedido.id}/pagamento`,
      {
        state: {
          tipo: "FINALIZACAO",
          pedidoId: pedido.id,
          valor: Number(
            pedido.preco || 0
          ),
        },
      }
    );
  }

  async function cancelarPedido() {
    if (!pedido) return;

    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar este pedido?"
    );

    if (!confirmar) return;

    setSaving(true);
    setError("");

    try {
      const statusAtual =
        String(
          pedido.status
        ).toUpperCase();

      let devePagarMulta = false;

      if (
        statusAtual === "FINALIZADO" &&
        pedido.data_finalizacao
      ) {
        const dataFinalizacao =
          new Date(
            pedido.data_finalizacao
          );

        const agora = new Date();

        const diferencaMinutos =
          (agora.getTime() -
            dataFinalizacao.getTime()) /
          (1000 * 60);

        devePagarMulta =
          diferencaMinutos >= 15;
      }

      const resposta =
        await api.cancelarPedido(
          pedido.id
        );

      if (devePagarMulta) {
        const multa =
          resposta?.multa ??
          resposta?.pedido?.multa ??
          pedido.multa ??
          Number(pedido.preco || 0) *
            0.5;

        nav(
          `/pedido/${pedido.id}/pagamento`,
          {
            state: {
              tipo: "CANCELAMENTO",
              pedidoId: pedido.id,
              multa: Number(multa),
            },
          }
        );

        return;
      }

      await load();
    } catch (e: any) {
      setError(
        e.message ||
          "Não foi possível cancelar o pedido."
      );
    } finally {
      setSaving(false);
    }
  }

  async function copiarCodigo() {
    if (!pedido?.codigo_entrega) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(pedido.codigo_entrega)
      );

      setCodigoCopiado(true);

      setTimeout(() => {
        setCodigoCopiado(false);
      }, 2000);
    } catch {
      setError(
        "Não foi possível copiar o código."
      );
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="py-20 text-center text-red-600">
        {error ||
          "Pedido não encontrado."}
      </div>
    );
  }

  const money = (valor: number) =>
    Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

  const status = String(
    pedido.status
  ).toUpperCase();

  const podeAdicionar =
    status === "PENDENTE";

  const podeFinalizar =
    status === "PENDENTE" &&
    Boolean(
      pedido.itens &&
        pedido.itens.length > 0
    );

  const podeCancelar =
    status !== "CANCELADO" &&
    status !== "PRONTO" &&
    status !== "EM_ENTREGA" &&
    status !== "ENTREGUE";

  const emEntrega =
    status === "EM_ENTREGA";

  const produtoSelecionado =
    form.sabor;

  const ehPizza = [
    "Calabresa",
    "Margherita",
    "Carne seca",
    "Pepperoni",
    "Portuguesa",
  ].includes(produtoSelecionado);

  const ehSuco =
    produtoSelecionado ===
    "Suco de laranja";

  const ehRefrigerante =
    produtoSelecionado === "Coca-Cola";

  return (
    <div className="mx-auto max-w-7xl">
      {/* VOLTAR */}
      <button
        type="button"
        onClick={() => nav("/pedidos")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Pedidos
      </button>

      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Pedido #{pedido.id}
            </h1>

            <StatusBadge
              status={pedido.status}
            />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {pedido.itens?.length || 0}{" "}
            item(ns) · Total{" "}
            {money(pedido.preco)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {podeFinalizar && (
            <button
              type="button"
              disabled={saving}
              onClick={
                irParaPagamento
              }
              className="btn-primary"
            >
              <Check size={17} />
              Finalizar
            </button>
          )}

          {podeCancelar && (
            <button
              type="button"
              disabled={saving}
              onClick={
                cancelarPedido
              }
              className="btn-secondary border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  className="animate-spin"
                  size={17}
                />
              ) : (
                <XCircle size={17} />
              )}

              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ERRO */}
      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* CÓDIGO DE ENTREGA */}
      {/* ========================= */}

      {emEntrega && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Truck size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-emerald-900">
                  Seu pedido está a caminho!
                </h2>

                <p className="mt-1 text-sm text-emerald-700">
                  Seu pedido está em rota de entrega.
                </p>

                <p className="mt-3 text-sm font-medium text-emerald-800">
                  Informe este código ao receber o pedido.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-white px-8 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Código de entrega
              </p>

              <p className="mt-2 text-4xl font-black tracking-[0.25em] text-slate-900">
                {pedido.codigo_entrega ||
                  "------"}
              </p>

              {pedido.codigo_entrega && (
                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {codigoCopiado ? (
                    <>
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
                      Código copiado
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar código
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* PEDIDO + ADICIONAR ITEM */}
      {/* ========================= */}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ITENS DO PEDIDO */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold">
              Itens do pedido
            </h2>
          </div>

          {pedido.itens &&
          pedido.itens.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pedido.itens.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-medium">
                        {item.sabor} ·{" "}
                        {item.tamanho}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.quantidade} ×{" "}
                        {money(
                          item.preco_unitario
                        )}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {money(
                        Number(
                          item.quantidade
                        ) *
                          Number(
                            item.preco_unitario
                          )
                      )}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-500">
              Este pedido ainda não possui itens.
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-5">
            <span className="font-medium text-slate-500">
              Total
            </span>

            <span className="text-xl font-bold">
              {money(pedido.preco)}
            </span>
          </div>
        </div>

        {/* ADICIONAR ITEM */}
        {podeAdicionar && (
          <div className="card h-fit p-5">
            <h2 className="font-semibold">
              Adicionar item
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Escolha o produto, tamanho e quantidade.
            </p>

            <form
              onSubmit={
                adicionarItem
              }
              className="mt-5 space-y-4"
            >
              {/* PRODUTO */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Produto
                </span>

                <select
                  className="input"
                  required
                  value={form.sabor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sabor: e.target.value,
                      tamanho: "",
                    })
                  }
                >
                  <option value="">
                    Selecione o produto
                  </option>

                  <optgroup label="Pizzas">
                    <option value="Calabresa">
                      Calabresa
                    </option>

                    <option value="Margherita">
                      Margherita
                    </option>

                    <option value="Carne seca">
                      Carne seca
                    </option>

                    <option value="Pepperoni">
                      Pepperoni
                    </option>

                    <option value="Portuguesa">
                      Portuguesa
                    </option>
                  </optgroup>

                  <optgroup label="Bebidas">
                    <option value="Suco de laranja">
                      Suco de laranja
                    </option>

                    <option value="Coca-Cola">
                      Coca-Cola
                    </option>
                  </optgroup>
                </select>
              </label>

              {/* TAMANHO */}
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
                    setForm({
                      ...form,
                      tamanho:
                        e.target.value,
                    })
                  }
                  disabled={!form.sabor}
                >
                  <option value="">
                    Selecione o tamanho
                  </option>

                  {ehPizza && (
                    <>
                      <option value="Pequena">
                        Pequena — R$ 50,00
                      </option>

                      <option value="Media">
                        Média — R$ 75,00
                      </option>

                      <option value="Grande">
                        Grande — R$ 90,00
                      </option>
                    </>
                  )}

                  {ehSuco && (
                    <>
                      <option value="500ml">
                        500 ml — R$ 15,00
                      </option>

                      <option value="1L">
                        Jarra 1 L — R$ 27,50
                      </option>
                    </>
                  )}

                  {ehRefrigerante && (
                    <>
                      <option value="1L">
                        1 L — R$ 8,00
                      </option>

                      <option value="2L">
                        2 L — R$ 12,00
                      </option>
                    </>
                  )}
                </select>
              </label>

              {/* QUANTIDADE */}
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
                    setForm({
                      ...form,
                      quantidade:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                />
              </label>

              {/* BOTÃO */}
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full"
              >
                {saving ? (
                  <Loader2
                    className="animate-spin"
                    size={17}
                  />
                ) : (
                  <Plus
                    size={17}
                  />
                )}

                Adicionar item
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* CARDÁPIO */}
      {/* ========================= */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            className="mx-auto h-auto w-full max-w-3xl rounded-xl border border-slate-200 object-contain shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}