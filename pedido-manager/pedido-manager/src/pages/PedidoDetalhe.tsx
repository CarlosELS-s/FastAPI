import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";

import { api, ItemPedido, Pedido } from "../lib/api";

function StatusBadge({ status }: { status: string }) {
  const valor = status.toLowerCase();

  let classe =
    "bg-amber-50 text-amber-700 border-amber-200";

  if (
    valor.includes("final") ||
    valor.includes("concl")
  ) {
    classe =
      "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (valor.includes("cancel")) {
    classe =
      "bg-red-50 text-red-700 border-red-200";
  }

  if (valor.includes("pronto")) {
    classe =
      "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (valor.includes("entrega")) {
    classe =
      "bg-purple-50 text-purple-700 border-purple-200";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classe}`}
    >
      {status || "Pendente"}
    </span>
  );
}

function formatarStatus(status: string) {
  if (!status) return "Pendente";

  const valor = status.toLowerCase();

  if (valor.includes("cancel")) return "Cancelado";
  if (valor.includes("final")) return "Finalizado";
  if (valor.includes("concl")) return "Finalizado";
  if (valor.includes("pronto")) return "Pronto";
  if (valor.includes("entrega")) return "Em entrega";
  if (valor.includes("entregue")) return "Entregue";

  return status;
}

function dinheiro(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularPreco(tamanho: string) {
  const valor = tamanho.toLowerCase();

  if (valor === "pequeno" || valor === "p") {
    return 50;
  }

  if (valor === "medio" || valor === "m" || valor === "médio") {
    return 75;
  }

  if (valor === "grande" || valor === "g") {
    return 80;
  }

  return 0;
}

export default function PedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<ItemPedido>({
    quantidade: 1,
    sabor: "",
    tamanho: "",
    preco_unitario: 0,
  });

  const [formaPagamento, setFormaPagamento] = useState("");
  const [mostrarPagamento, setMostrarPagamento] =
    useState(false);

  const [mostrarMulta, setMostrarMulta] = useState(false);
  const [formaPagamentoMulta, setFormaPagamentoMulta] =
    useState("");

  async function load() {
    if (!pedidoId || Number.isNaN(pedidoId)) {
      setError("Pedido inválido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // visualizarPedido já retorna diretamente um Pedido.
      const dados = await api.visualizarPedido(pedidoId);

      setPedido(dados);
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível carregar o pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [pedidoId]);

  const status = pedido?.status?.toLowerCase() || "";

  const finalizado =
    status.includes("final") ||
    status.includes("concl");

  const cancelado = status.includes("cancel");

  const pronto = status.includes("pronto");

  const emEntrega =
    status.includes("entrega") ||
    status.includes("em_entrega");

  const entregue = status.includes("entregue");

  const podeAdicionar =
    !finalizado &&
    !cancelado &&
    !pronto &&
    !emEntrega &&
    !entregue;

  const podeFinalizar =
    !finalizado &&
    !cancelado &&
    !pronto &&
    !emEntrega &&
    !entregue;

  /*
   * A multa só deve aparecer depois de 15 minutos
   * da finalização do pedido.
   */
  const passou15Minutos = useMemo(() => {
    if (!pedido?.data_finalizacao) {
      return false;
    }

    const dataFinalizacao = new Date(
      pedido.data_finalizacao
    ).getTime();

    if (Number.isNaN(dataFinalizacao)) {
      return false;
    }

    const agora = Date.now();
    const quinzeMinutos = 15 * 60 * 1000;

    return agora - dataFinalizacao >= quinzeMinutos;
  }, [pedido?.data_finalizacao]);

  useEffect(() => {
    if (!finalizado || !pedido?.data_finalizacao) {
      return;
    }

    const verificar = () => {
      const dataFinalizacao = new Date(
        pedido.data_finalizacao as string
      ).getTime();

      if (Number.isNaN(dataFinalizacao)) {
        return;
      }

      const quinzeMinutos = 15 * 60 * 1000;

      setMostrarMulta(
        Date.now() - dataFinalizacao >= quinzeMinutos
      );
    };

    verificar();

    const intervalo = window.setInterval(
      verificar,
      1000
    );

    return () => window.clearInterval(intervalo);
  }, [finalizado, pedido?.data_finalizacao]);

  function alterarTamanho(tamanho: string) {
    setForm((anterior) => ({
      ...anterior,
      tamanho,
      preco_unitario: calcularPreco(tamanho),
    }));
  }

  async function adicionarItem() {
    if (!pedido) return;

    setError("");

    if (!form.sabor) {
      setError("Selecione o sabor.");
      return;
    }

    if (!form.tamanho) {
      setError("Selecione o tamanho.");
      return;
    }

    if (form.quantidade < 1) {
      setError("A quantidade deve ser pelo menos 1.");
      return;
    }

    const preco = calcularPreco(form.tamanho);

    if (!preco) {
      setError("Tamanho inválido.");
      return;
    }

    try {
      setSaving(true);

      await api.adicionarItem(pedido.id, {
        quantidade: form.quantidade,
        sabor: form.sabor,
        tamanho: form.tamanho,
        preco_unitario: preco,
      });

      setForm({
        quantidade: 1,
        sabor: "",
        tamanho: "",
        preco_unitario: 0,
      });

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível adicionar o item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removerItem() {
    if (!pedido) return;

    if (!pedido.itens || pedido.itens.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.removerItem(pedido.id);

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível remover o item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function finalizar() {
    if (!pedido) return;

    if (!pedido.itens || pedido.itens.length === 0) {
      setError(
        "Adicione pelo menos um item antes de finalizar o pedido."
      );
      return;
    }

    if (!formaPagamento) {
      setError("Selecione a forma de pagamento.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.finalizarPedido(
        pedido.id,
        formaPagamento
      );

      setMostrarPagamento(false);
      setFormaPagamento("");

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível finalizar o pedido."
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelar() {
    if (!pedido) return;

    try {
      setSaving(true);
      setError("");

      /*
       * Antes de 15 minutos, o cancelamento é normal.
       * Depois de 15 minutos, mostramos a opção de
       * pagamento da multa.
       */
      if (finalizado && passou15Minutos) {
        setMostrarMulta(true);
        return;
      }

      await api.cancelarPedido(pedido.id);

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível cancelar o pedido."
      );
    } finally {
      setSaving(false);
    }
  }

  async function pagarMulta() {
    if (!pedido) return;

    if (!formaPagamentoMulta) {
      setError(
        "Selecione a forma de pagamento da multa."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.pagarMulta(
        pedido.id,
        formaPagamentoMulta
      );

      setMostrarMulta(false);
      setFormaPagamentoMulta("");

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível pagar a multa."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Carregando pedido...
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "Pedido não encontrado."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Pedido
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            #{pedido.id}
          </h1>
        </div>

        <StatusBadge status={formatarStatus(pedido.status)} />
      </div>

      {error && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Itens do pedido
                </h2>

                <p className="text-sm text-slate-500">
                  {pedido.itens?.length || 0} item(ns)
                </p>
              </div>
            </div>

            {!pedido.itens ||
            pedido.itens.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Nenhum item adicionado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {pedido.itens.map((item, index) => (
                  <div
                    key={`${item.sabor}-${item.tamanho}-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold capitalize text-slate-900">
                        {item.sabor}
                      </p>

                      <p className="text-sm capitalize text-slate-500">
                        Tamanho: {item.tamanho}
                      </p>

                      <p className="text-sm text-slate-500">
                        Quantidade: {item.quantidade}
                      </p>
                    </div>

                    <div className="font-semibold text-slate-900">
                      {dinheiro(
                        item.preco_unitario *
                          item.quantidade
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {podeAdicionar && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Adicionar item
                </h2>

                <p className="text-sm text-slate-500">
                  Escolha o sabor, tamanho e quantidade.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Sabor
                  </span>

                  <select
                    value={form.sabor}
                    onChange={(e) =>
                      setForm((anterior) => ({
                        ...anterior,
                        sabor: e.target.value,
                      }))
                    }
                    className="input w-full"
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="calabresa">
                      Calabresa
                    </option>
                    <option value="peperone">
                      Peperone
                    </option>
                    <option value="portuguesa">
                      Portuguesa
                    </option>
                    <option value="marguerita">
                      Marguerita
                    </option>
                    <option value="carne seca">
                      Carne seca
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Tamanho
                  </span>

                  <select
                    value={form.tamanho}
                    onChange={(e) =>
                      alterarTamanho(e.target.value)
                    }
                    className="input w-full"
                  >
                    <option value="">
                      Selecione
                    </option>
                    <option value="pequeno">
                      Pequeno — R$ 50,00
                    </option>
                    <option value="medio">
                      Médio — R$ 75,00
                    </option>
                    <option value="grande">
                      Grande — R$ 80,00
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Quantidade
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm((anterior) => ({
                        ...anterior,
                        quantidade: Math.max(
                          1,
                          Number(e.target.value) || 1
                        ),
                      }))
                    }
                    className="input w-full"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={adicionarItem}
                disabled={saving}
                className="btn-primary mt-5 w-full sm:w-auto"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={18} />
                )}

                Adicionar item
              </button>
            </section>
          )}

          {finalizado && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <Check
                  size={22}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <h2 className="font-bold text-emerald-800">
                    Pedido finalizado
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700">
                    O pedido já foi finalizado e não é
                    possível adicionar novos itens.
                  </p>
                </div>
              </div>
            </section>
          )}

          {cancelado && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex gap-3">
                <XCircle
                  size={22}
                  className="mt-0.5 text-red-600"
                />

                <div>
                  <h2 className="font-bold text-red-800">
                    Pedido cancelado
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    Este pedido foi cancelado.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Resumo
            </h2>

            <div className="mt-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-500">
                Total
              </span>

              <span className="text-2xl font-bold text-slate-900">
                {dinheiro(pedido.preco)}
              </span>
            </div>

            {pedido.multa &&
              Number(pedido.multa) > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-red-600">
                    Multa
                  </span>

                  <span className="font-semibold text-red-600">
                    {dinheiro(Number(pedido.multa))}
                  </span>
                </div>
              )}

            {pedido.forma_pagamento && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Forma de pagamento
                </p>

                <p className="mt-1 capitalize text-sm font-medium text-slate-700">
                  {pedido.forma_pagamento}
                </p>
              </div>
            )}
          </section>

          {podeFinalizar && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Finalizar pedido
              </h2>

              {!mostrarPagamento ? (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !pedido.itens ||
                      pedido.itens.length === 0
                    ) {
                      setError(
                        "Adicione pelo menos um item antes de finalizar o pedido."
                      );
                      return;
                    }

                    setMostrarPagamento(true);
                    setError("");
                  }}
                  className="btn-primary mt-4 w-full"
                >
                  <Check size={18} />
                  Finalizar pedido
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <label>
                    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Forma de pagamento
                    </span>

                    <select
                      value={formaPagamento}
                      onChange={(e) =>
                        setFormaPagamento(
                          e.target.value
                        )
                      }
                      className="input w-full"
                    >
                      <option value="">
                        Selecione
                      </option>
                      <option value="pix">Pix</option>
                      <option value="cartao">
                        Cartão
                      </option>
                      <option value="dinheiro">
                        Dinheiro
                      </option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={finalizar}
                    disabled={saving}
                    className="btn-primary w-full"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={18} />
                    )}

                    Confirmar finalização
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarPagamento(false);
                      setFormaPagamento("");
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </section>
          )}

          {!cancelado && (
            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Cancelar pedido
              </h2>

              {finalizado && !passou15Minutos && (
                <p className="mt-2 text-sm text-slate-500">
                  O cancelamento pode ser feito sem multa
                  durante os primeiros 15 minutos após a
                  finalização.
                </p>
              )}

              {finalizado && passou15Minutos && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  O prazo de 15 minutos passou. O
                  cancelamento terá multa de 50% do valor
                  do pedido.
                </div>
              )}

              <button
                type="button"
                onClick={cancelar}
                disabled={saving}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <XCircle size={18} />
                )}

                Cancelar pedido
              </button>
            </section>
          )}

          {mostrarMulta && !cancelado && (
            <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <h2 className="text-lg font-bold text-amber-900">
                Pagamento da multa
              </h2>

              <p className="mt-2 text-sm text-amber-800">
                Já passaram 15 minutos desde a
                finalização. Para cancelar o pedido, é
                necessário pagar uma multa de 50% do valor
                do pedido.
              </p>

              <p className="mt-3 text-lg font-bold text-amber-900">
                Multa: {dinheiro(pedido.preco / 2)}
              </p>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-semibold text-amber-900">
                  Forma de pagamento
                </span>

                <select
                  value={formaPagamentoMulta}
                  onChange={(e) =>
                    setFormaPagamentoMulta(
                      e.target.value
                    )
                  }
                  className="input w-full"
                >
                  <option value="">
                    Selecione
                  </option>
                  <option value="pix">Pix</option>
                  <option value="cartao">
                    Cartão
                  </option>
                  <option value="dinheiro">
                    Dinheiro
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={pagarMulta}
                disabled={saving}
                className="mt-4 btn-primary w-full"
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={18} />
                )}

                Pagar multa e cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarMulta(false);
                  setFormaPagamentoMulta("");
                }}
                className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Voltar
              </button>
            </section>
          )}

          {finalizado &&
            !passou15Minutos &&
            pedido.data_finalizacao && (
              <p className="text-center text-xs text-slate-400">
                O cancelamento sem multa está disponível
                por 15 minutos após a finalização.
              </p>
            )}
        </aside>
      </div>
    </div>
  );
}