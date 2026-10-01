import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function Pedidos() {
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
      setOrders(pedidos);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os pedidos."
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
      order.status?.toLowerCase().includes(textoBusca)
    );
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Operação
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Pedidos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulte e gerencie seus pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/novo-pedido")}
          className="btn-primary"
        >
          <Plus size={18} />
          Novo pedido
        </button>
      </div>

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
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por ID ou status..."
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
              className={loading ? "animate-spin" : ""}
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
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              className="mx-auto text-slate-300"
              size={36}
            />

            <p className="mt-3 font-medium">
              Nenhum pedido encontrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/pedido/${order.id}`)}
                className="grid w-full grid-cols-2 gap-3 p-5 text-left transition hover:bg-slate-50 sm:grid-cols-4 sm:items-center"
              >
                <div>
                  <p className="text-xs text-slate-400">
                    Pedido
                  </p>

                  <p className="mt-1 font-semibold">
                    #{order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Itens
                  </p>

                  <p className="mt-1 font-medium">
                    {order.itens?.length || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                  <span className="font-semibold">
                    {Number(order.preco || 0).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
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