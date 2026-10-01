import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  RefreshCw,
  Truck,
} from "lucide-react";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function PedidosProntos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoEntrega, setCarregandoEntrega] = useState<number | null>(
    null
  );
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");

      const todosPedidos = await api.todosPedidos();

      const pedidosProntos = todosPedidos.filter(
        (pedido) =>
          String(pedido.status).toUpperCase() === "PRONTO"
      );

      const pedidosComDetalhes = await Promise.all(
        pedidosProntos.map(async (pedido) => {
          try {
            const detalhes = await api.visualizarPedido(pedido.id);

            return {
              ...pedido,
              ...detalhes,
            };
          } catch {
            return pedido;
          }
        })
      );

      setPedidos(
        pedidosComDetalhes.sort(
          (a, b) => a.id - b.id
        )
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos prontos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  function alternarPedido(id: number) {
    setPedidoAberto((atual) =>
      atual === id ? null : id
    );
  }

  async function pegarParaEntrega(id: number) {
    try {
      setErro("");
      setSucesso("");
      setCarregandoEntrega(id);

      await api.emEntrega(id);

      setPedidos((atuais) =>
        atuais.filter((pedido) => pedido.id !== id)
      );

      setPedidoAberto((atual) =>
        atual === id ? null : atual
      );

      setSucesso(
        `Pedido #${id} foi colocado em entrega com sucesso.`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível colocar o pedido em entrega."
      );
    } finally {
      setCarregandoEntrega(null);
    }
  }

  function formatarPagamento(pedido: Pedido) {
    const pagamento =
      pedido.forma_pagamento ||
      pedido.pagamento;

    if (!pagamento) {
      return "Não informado";
    }

    const valor = String(pagamento).toUpperCase();

    if (valor === "PIX") {
      return "PIX";
    }

    if (
      valor === "CARTAO" ||
      valor === "CARTÃO"
    ) {
      return "Cartão";
    }

    if (valor === "DINHEIRO") {
      return "Dinheiro";
    }

    return String(pagamento);
  }

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function temEndereco(pedido: Pedido) {
    return Boolean(
      pedido.cep ||
        pedido.rua ||
        pedido.numero ||
        pedido.bairro ||
        pedido.complemento
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* CABEÇALHO */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Pedidos prontos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Pedidos prontos para entrega pelo motoboy.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              carregando ? "animate-spin" : ""
            }
          />

          Atualizar
        </button>
      </div>

      {/* SUCESSO */}
      {sucesso && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} />

          <span>{sucesso}</span>
        </div>
      )}

      {/* ERRO */}
      {erro && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} />

          <span>{erro}</span>
        </div>
      )}

      {/* CARREGANDO */}
      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Carregando pedidos prontos...
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            Nenhum pedido pronto.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Os pedidos aparecerão aqui quando a cozinha marcar como prontos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const aberto =
              pedidoAberto === pedido.id;

            const entregando =
              carregandoEntrega === pedido.id;

            return (
              <div
                key={pedido.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* RESUMO DO PEDIDO */}
                <button
                  type="button"
                  onClick={() =>
                    alternarPedido(pedido.id)
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        Pedido #{pedido.id}
                      </h2>

                      <StatusBadge
                        status={pedido.status}
                      />
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Usuário:{" "}
                      {pedido.usuario ??
                        "Não informado"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {pedido.itens?.length || 0}{" "}
                      item(ns) no pedido
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">
                        Forma de pagamento:
                      </span>{" "}
                      {formatarPagamento(pedido)}
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-semibold">
                        Total:
                      </span>{" "}
                      <span className="font-bold">
                        {formatarValor(
                          pedido.preco
                        )}
                      </span>
                    </p>
                  </div>

                  {aberto ? (
                    <ChevronUp
                      size={24}
                      className="shrink-0 text-slate-500"
                    />
                  ) : (
                    <ChevronDown
                      size={24}
                      className="shrink-0 text-slate-500"
                    />
                  )}
                </button>

                {/* DETALHES */}
                {aberto && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5">
                    {/* BOTÃO DE ENTREGA */}
                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                            <Truck size={21} />
                          </div>

                          <div>
                            <h3 className="font-semibold text-emerald-900">
                              Pedido pronto para entrega
                            </h3>

                            <p className="mt-1 text-sm text-emerald-700">
                              O motoboy pode pegar este pedido para iniciar a entrega.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            pegarParaEntrega(
                              pedido.id
                            )
                          }
                          disabled={entregando}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {entregando ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                              Colocando em entrega...
                            </>
                          ) : (
                            <>
                              <Truck size={18} />
                              Pegar para entrega
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ENDEREÇO */}
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={21}
                          className="text-slate-800"
                        />

                        <h3 className="font-semibold text-slate-900">
                          Endereço de entrega
                        </h3>
                      </div>

                      {temEndereco(pedido) ? (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {/* CEP */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              CEP
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                              {pedido.cep ||
                                "Não informado"}
                            </p>
                          </div>

                          {/* RUA */}
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Rua
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                              {pedido.rua ||
                                "Não informado"}
                            </p>
                          </div>

                          {/* NÚMERO */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Número
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                              {pedido.numero ||
                                "Não informado"}
                            </p>
                          </div>

                          {/* BAIRRO */}
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Bairro
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                              {pedido.bairro ||
                                "Não informado"}
                            </p>
                          </div>

                          {/* COMPLEMENTO */}
                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Complemento
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                              {pedido.complemento ||
                                "Nenhum"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                          Endereço de entrega não informado.
                        </div>
                      )}
                    </div>

                    {/* PAGAMENTO */}
                    <div className="mb-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Forma de pagamento
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatarPagamento(
                            pedido
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatarValor(
                            pedido.preco
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ITENS */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h3 className="mb-4 font-semibold text-slate-900">
                        Itens do pedido
                      </h3>

                      {pedido.itens &&
                      pedido.itens.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="px-4 py-3 font-semibold text-slate-500">
                                  Quantidade
                                </th>

                                <th className="px-4 py-3 font-semibold text-slate-500">
                                  Produto
                                </th>

                                <th className="px-4 py-3 font-semibold text-slate-500">
                                  Tamanho
                                </th>

                                <th className="px-4 py-3 font-semibold text-slate-500">
                                  Preço
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {pedido.itens.map(
                                (item, index) => (
                                  <tr
                                    key={`${pedido.id}-${index}`}
                                    className="border-b border-slate-100 last:border-0"
                                  >
                                    <td className="px-4 py-4">
                                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-slate-900 px-3 py-1 font-bold text-white">
                                        {item.quantidade}
                                      </span>
                                    </td>

                                    <td className="px-4 py-4 font-semibold text-slate-900">
                                      {item.sabor}
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                      {item.tamanho}
                                    </td>

                                    <td className="px-4 py-4 font-medium text-slate-900">
                                      {formatarValor(
                                        item.preco_unitario
                                      )}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Este pedido não possui itens.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}