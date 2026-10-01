import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Package,
  RefreshCw,
  Truck,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] =
    useState(true);
  const [erro, setErro] = useState("");

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");

      const resultado =
        await api.todosPedidos();

      setPedidos(resultado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const estatisticas = useMemo(() => {
    const normalizar = (status: string) =>
      String(status || "").toUpperCase();

    const pendentes = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "PENDENTE"
    ).length;

    const finalizados = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "FINALIZADO"
    ).length;

    const prontos = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "PRONTO"
    ).length;

    const emEntrega = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "EM_ENTREGA"
    ).length;

    const entregues = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "ENTREGUE"
    ).length;

    const cancelados = pedidos.filter(
      (pedido) =>
        normalizar(pedido.status) ===
        "CANCELADO"
    ).length;

    const valorTotal = pedidos
      .filter(
        (pedido) =>
          normalizar(pedido.status) !==
          "CANCELADO"
      )
      .reduce(
        (total, pedido) =>
          total +
          Number(pedido.preco || 0),
        0
      );

    return {
      total: pedidos.length,
      pendentes,
      finalizados,
      prontos,
      emEntrega,
      entregues,
      cancelados,
      valorTotal,
    };
  }, [pedidos]);

  const pedidosRecentes = useMemo(() => {
    return [...pedidos]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8);
  }, [pedidos]);

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
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={21}
              className="text-slate-600"
            />

            <p className="text-sm font-medium text-slate-500">
              Administração
            </p>
          </div>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard administrativo
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a operação completa da pizzaria.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={carregando}
          className="btn-secondary"
        >
          <RefreshCw
            size={17}
            className={
              carregando
                ? "animate-spin"
                : ""
            }
          />
          Atualizar
        </button>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
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

            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Package size={19} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {estatisticas.total}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Todos os pedidos cadastrados
          </p>
        </div>

        {/* PENDENTES */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Pendentes
            </span>

            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
              <Clock3 size={19} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-amber-700">
            {estatisticas.pendentes}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Aguardando finalização
          </p>
        </div>

        {/* EM ENTREGA */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Em entrega
            </span>

            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
              <Truck size={19} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-blue-700">
            {estatisticas.emEntrega}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pedidos em rota
          </p>
        </div>

        {/* ENTREGUES */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Entregues
            </span>

            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <CheckCircle2 size={19} />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold text-emerald-700">
            {estatisticas.entregues}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Pedidos concluídos
          </p>
        </div>
      </div>

      {/* SEGUNDA LINHA */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* FINALIZADOS */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Finalizados
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {estatisticas.finalizados}
              </p>
            </div>
          </div>
        </div>

        {/* PRONTOS */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2.5 text-green-700">
              <Package size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Prontos
              </p>

              <p className="text-2xl font-bold text-green-700">
                {estatisticas.prontos}
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
                {estatisticas.cancelados}
              </p>
            </div>
          </div>
        </div>

        {/* VALOR */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <Package size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Valor dos pedidos
              </p>

              <p className="text-xl font-bold text-slate-900">
                {formatarValor(
                  estatisticas.valorTotal
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ATALHOS */}
      <div className="mt-7">
        <h2 className="text-lg font-bold text-slate-900">
          Ações rápidas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Acesse rapidamente as áreas administrativas.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/pedidos")
            }
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Package size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300 group-hover:text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Todos os pedidos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Veja todos os pedidos dos clientes.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/cozinha")
            }
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-green-100 p-3 text-green-700">
                <Package size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300 group-hover:text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Cozinha
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Gerencie os pedidos na produção.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pedidos-prontos"
              )
            }
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300 group-hover:text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Pedidos prontos
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Veja os pedidos aguardando entrega.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pedidos-em-entrega"
              )
            }
            className="card group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Truck size={20} />
              </div>

              <ArrowUpRight
                size={18}
                className="text-slate-300 group-hover:text-slate-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Em entrega
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Acompanhe os pedidos em rota.
            </p>
          </button>
        </div>
      </div>

      {/* PEDIDOS RECENTES */}
      <div className="card mt-7 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Pedidos recentes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Últimos pedidos registrados no sistema
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/pedidos")
            }
            className="btn-secondary !px-3 !py-2 text-xs"
          >
            Ver todos
          </button>
        </div>

        {carregando ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando pedidos...
          </div>
        ) : pedidosRecentes.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              Nenhum pedido cadastrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidosRecentes.map(
              (pedido) => (
                <button
                  key={pedido.id}
                  type="button"
                  onClick={() =>
                    navigate(
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
                        status={
                          pedido.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Cliente ID:{" "}
                      {pedido.usuario ??
                        "Não informado"}
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
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}