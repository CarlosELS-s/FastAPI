import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  History,
  MapPin,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function HistoricoPedidos() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Pedido[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const pedidos = await api.listarPedidos();

      const historicoBase = pedidos.filter((pedido) => {
        const status = String(
          pedido.status || ""
        ).toUpperCase();

        return (
          status === "ENTREGUE" ||
          status === "CANCELADO"
        );
      });

      const pedidosDetalhados = await Promise.all(
        historicoBase.map(async (pedido) => {
          try {
            return await api.visualizarPedido(
              pedido.id
            );
          } catch {
            return pedido;
          }
        })
      );

      setOrders(
        pedidosDetalhados.sort(
          (a, b) => b.id - a.id
        )
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar o histórico."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = orders.filter((order) => {
    const textoBusca = q.toLowerCase();

    return (
      String(order.id).includes(q) ||
      String(order.status || "")
        .toLowerCase()
        .includes(textoBusca) ||
      String(order.pagamento || "")
        .toLowerCase()
        .includes(textoBusca)
    );
  });

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function formatarData(
    data: string | null | undefined
  ) {
    if (!data) {
      return "Data não informada";
    }

    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return "Data não informada";
    }

    return dataObj.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  function formatarPagamento(
    pedido: Pedido
  ) {
    const pagamento =
      pedido.forma_pagamento ||
      pedido.pagamento;

    if (!pagamento) {
      return "Não informado";
    }

    const valor = String(
      pagamento
    ).toUpperCase();

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

  return (
    <div className="mx-auto max-w-7xl">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <History
              size={22}
              className="text-slate-500"
            />

            <p className="text-sm font-medium text-slate-500">
              Registro
            </p>
          </div>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Histórico de pedidos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulte seus pedidos já entregues ou cancelados.
          </p>
        </div>
      </div>

      {/* BUSCA E ATUALIZAÇÃO */}
      <div className="card mt-7">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              type="text"
              className="input pl-10"
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Buscar por ID, status ou pagamento..."
            />
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="btn-secondary !px-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Atualizar
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando histórico...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              className="mx-auto text-slate-300"
              size={40}
            />

            <p className="mt-3 font-medium text-slate-800">
              Nenhum pedido no histórico
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Pedidos entregues ou cancelados aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const status = String(
                order.status || ""
              ).toUpperCase();

              const entregue =
                status === "ENTREGUE";

              return (
                <div
                  key={order.id}
                  className="p-5 transition hover:bg-slate-50"
                >
                  {/* TOPO */}
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/pedido/${order.id}`
                        )
                      }
                      className="text-left"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-bold text-slate-900">
                          Pedido #{order.id}
                        </span>

                        <StatusBadge
                          status={
                            order.status
                          }
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays
                            size={14}
                          />

                          {formatarData(
                            order.data_finalizacao
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Package
                            size={14}
                          />

                          {order.itens
                            ?.length ||
                            0}{" "}
                          item(ns)
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard
                            size={14}
                          />

                          {formatarPagamento(
                            order
                          )}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-400">
                          Total
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                          {formatarValor(
                            order.preco
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/pedido/${order.id}`
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Ver pedido"
                      >
                        <ArrowUpRight
                          size={18}
                        />
                      </button>
                    </div>
                  </div>

                  {/* RESUMO */}
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    {/* SITUAÇÃO */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Situação
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        {entregue ? (
                          <>
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600"
                            />

                            <span className="font-semibold text-emerald-700">
                              Pedido entregue
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle
                              size={18}
                              className="text-red-600"
                            />

                            <span className="font-semibold text-red-700">
                              Pedido cancelado
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* PAGAMENTO */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Pagamento
                      </p>

                      <p className="mt-2 font-semibold text-slate-900">
                        {formatarPagamento(
                          order
                        )}
                      </p>
                    </div>

                    {/* ENDEREÇO */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Endereço
                      </p>

                      <div className="mt-2 flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <p className="text-sm text-slate-700">
                          {order.rua
                            ? `${order.rua}, ${
                                order.numero ||
                                "s/n"
                              }`
                            : "Endereço não informado"}

                          {order.bairro && (
                            <span className="block text-xs text-slate-500">
                              {order.bairro}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ITENS */}
                  {order.itens &&
                    order.itens.length >
                      0 && (
                      <div className="mt-4 rounded-xl border border-slate-100">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-700">
                            Itens
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {order.itens.map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`${order.id}-${index}`}
                                className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"
                              >
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {
                                      item.sabor
                                    }
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {
                                      item.tamanho
                                    }{" "}
                                    ·{" "}
                                    {
                                      item.quantidade
                                    }{" "}
                                    unidade(s)
                                  </p>
                                </div>

                                <p className="font-semibold text-slate-800">
                                  {formatarValor(
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
                      </div>
                    )}

                  {/* BOTÃO */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/pedido/${order.id}`
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                    >
                      Ver detalhes
                      <ArrowUpRight
                        size={16}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}