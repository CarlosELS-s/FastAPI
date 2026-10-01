import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  History,
  Package,
  Plus,
  RefreshCw,
  Truck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function Dashboard() {
  const nav = useNavigate();

  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const pedidos = await api.listarPedidos();
      setOrders(pedidos);
    } catch (e: any) {
      setError(
        e.message ||
          "Não foi possível carregar os pedidos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;

    const pendentes = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "PENDENTE"
    ).length;

    const finalizados = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "FINALIZADO"
    ).length;

    const prontos = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "PRONTO"
    ).length;

    const emEntrega = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "EM_ENTREGA"
    ).length;

    const entregues = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "ENTREGUE"
    ).length;

    const cancelados = orders.filter(
      (o) =>
        String(o.status || "").toUpperCase() ===
        "CANCELADO"
    ).length;

    const totalGasto = orders
      .filter(
        (o) =>
          String(o.status || "").toUpperCase() !==
          "CANCELADO"
      )
      .reduce(
        (total, pedido) =>
          total + Number(pedido.preco || 0),
        0
      );

    return {
      total,
      pendentes,
      finalizados,
      prontos,
      emEntrega,
      entregues,
      cancelados,
      totalGasto,
    };
  }, [orders]);

  const pedidosRecentes = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6);
  }, [orders]);

  const pedidoPendente = useMemo(() => {
    return (
      [...orders]
        .filter(
          (pedido) =>
            String(
              pedido.status || ""
            ).toUpperCase() === "PENDENTE"
        )
        .sort((a, b) => b.id - a.id)[0] ||
      null
    );
  }, [orders]);

  const pedidoPronto = useMemo(() => {
    return (
      [...orders]
        .filter(
          (pedido) =>
            String(
              pedido.status || ""
            ).toUpperCase() === "PRONTO"
        )
        .sort((a, b) => b.id - a.id)[0] ||
      null
    );
  }, [orders]);

  const pedidoEmEntrega = useMemo(() => {
    return (
      [...orders]
        .filter(
          (pedido) =>
            String(
              pedido.status || ""
            ).toUpperCase() ===
            "EM_ENTREGA"
        )
        .sort((a, b) => b.id - a.id)[0] ||
      null
    );
  }, [orders]);

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Visão geral
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe seus pedidos e seu histórico.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              nav("/historico")
            }
            className="btn-secondary"
          >
            <History size={18} />
            Histórico
          </button>

          <button
            type="button"
            onClick={() =>
              nav("/novo-pedido")
            }
            className="btn-primary"
          >
            <Plus size={18} />
            Criar pedido
          </button>
        </div>
      </div>

      {/* ERRO */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CARDS PRINCIPAIS */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total de pedidos
            </span>

            <div className="rounded-xl bg-slate-100 p-2.5">
              <Package size={18} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold">
            {stats.total}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Todos os pedidos da sua conta
          </p>
        </div>

        {/* EM ANDAMENTO */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Em andamento
            </span>

            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <Clock3 size={18} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-amber-700">
            {stats.pendentes +
              stats.finalizados +
              stats.prontos +
              stats.emEntrega}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pedidos ainda não entregues
          </p>
        </div>

        {/* ENTREGUES */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Entregues
            </span>

            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-emerald-700">
            {stats.entregues}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pedidos concluídos
          </p>
        </div>

        {/* TOTAL GASTO */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total gasto
            </span>

            <div className="rounded-xl bg-slate-100 p-2.5">
              <ShoppingBag size={18} />
            </div>
          </div>

          <p className="mt-4 text-2xl font-bold">
            {formatarValor(
              stats.totalGasto
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pedidos não cancelados
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* PENDENTES */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <Clock3 size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Pendentes
              </p>

              <p className="text-2xl font-bold">
                {stats.pendentes}
              </p>
            </div>
          </div>
        </div>

        {/* PRONTOS */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2.5 text-green-700">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Prontos
              </p>

              <p className="text-2xl font-bold text-green-700">
                {stats.prontos}
              </p>
            </div>
          </div>
        </div>

        {/* EM ENTREGA */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
              <Truck size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Em entrega
              </p>

              <p className="text-2xl font-bold text-blue-700">
                {stats.emEntrega}
              </p>
            </div>
          </div>
        </div>

        {/* CANCELADOS */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2.5 text-red-700">
              <XCircle size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Cancelados
              </p>

              <p className="text-2xl font-bold text-red-700">
                {stats.cancelados}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="mt-7">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Ações rápidas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acesse rapidamente o que você precisa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* NOVO PEDIDO */}
          <button
            type="button"
            onClick={() =>
              nav("/novo-pedido")
            }
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Plus size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300 transition group-hover:text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Novo pedido
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Faça um novo pedido.
            </p>
          </button>

          {/* PEDIDO PENDENTE */}
          <button
            type="button"
            disabled={!pedidoPendente}
            onClick={() => {
              if (pedidoPendente) {
                nav(
                  `/pedido/${pedidoPendente.id}`
                );
              }
            }}
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <Clock3 size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {pedidoPendente
                ? `Continuar pedido #${pedidoPendente.id}`
                : "Nenhum pedido pendente"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {pedidoPendente
                ? "Continue montando seu pedido."
                : "Você não possui pedidos pendentes."}
            </p>
          </button>

          {/* PEDIDO PRONTO */}
          <button
            type="button"
            disabled={!pedidoPronto}
            onClick={() => {
              if (pedidoPronto) {
                nav(
                  `/pedido/${pedidoPronto.id}`
                );
              }
            }}
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-green-100 p-3 text-green-700">
                <CheckCircle2 size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {pedidoPronto
                ? `Pedido #${pedidoPronto.id} pronto`
                : "Nenhum pedido pronto"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {pedidoPronto
                ? "Acompanhe o pedido."
                : "Não há pedidos prontos."}
            </p>
          </button>

          {/* EM ENTREGA */}
          <button
            type="button"
            disabled={!pedidoEmEntrega}
            onClick={() => {
              if (pedidoEmEntrega) {
                nav(
                  `/pedido/${pedidoEmEntrega.id}`
                );
              }
            }}
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-default disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Truck size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {pedidoEmEntrega
                ? `Acompanhar pedido #${pedidoEmEntrega.id}`
                : "Nenhum pedido em entrega"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {pedidoEmEntrega
                ? "Veja o código e os detalhes da entrega."
                : "Não há pedidos em entrega."}
            </p>
          </button>
        </div>
      </div>

      {/* PEDIDOS RECENTES */}
      <div className="card mt-7 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold">
              Pedidos recentes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Seus últimos pedidos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                nav("/pedidos")
              }
              className="btn-secondary !px-3 !py-2 text-xs"
            >
              Ver todos
            </button>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="btn-secondary !px-3 !py-2"
              title="Atualizar"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando pedidos...
          </div>
        ) : pedidosRecentes.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              className="mx-auto text-slate-300"
              size={40}
            />

            <p className="mt-3 font-medium">
              Nenhum pedido ainda
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Crie seu primeiro pedido para começar.
            </p>

            <button
              type="button"
              onClick={() =>
                nav("/novo-pedido")
              }
              className="mt-4 btn-primary"
            >
              <Plus size={17} />
              Criar primeiro pedido
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidosRecentes.map((pedido) => (
              <button
                key={pedido.id}
                type="button"
                onClick={() =>
                  nav(
                    `/pedido/${pedido.id}`
                  )
                }
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      Pedido #{pedido.id}
                    </span>

                    <StatusBadge
                      status={pedido.status}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {pedido.itens?.length ||
                      0}{" "}
                    item(ns)
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-semibold text-slate-900">
                    {formatarValor(
                      pedido.preco
                    )}
                  </span>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-400"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}