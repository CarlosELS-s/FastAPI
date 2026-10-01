import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

function formatarDinheiro(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroValor, setFiltroValor] = useState("TODOS");
  const [filtroMulta, setFiltroMulta] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  async function carregarPedidos() {
    setLoading(true);

    try {
      const resultado = await api.todosPedidos();

      setPedidos(resultado);
      setErro("");
    } catch (e: any) {
      setErro(
        e.message || "Não foi possível carregar os pedidos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function cancelarPedido(pedido: Pedido) {
    const confirmar = window.confirm(
      `Tem certeza que deseja cancelar o pedido #${pedido.id}?\n\n` +
        `ID do usuário: ${pedido.usuario ?? "Não informado"}\n` +
        `Valor: ${formatarDinheiro(pedido.preco)}\n\n` +
        `O administrador não paga multa pelo cancelamento.`
    );

    if (!confirmar) {
      return;
    }

    setCancelando(pedido.id);
    setErro("");

    try {
      await api.cancelarPedido(pedido.id);
      await carregarPedidos();
    } catch (e: any) {
      setErro(
        e.message || "Não foi possível cancelar o pedido."
      );
    } finally {
      setCancelando(null);
    }
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = busca.toLowerCase();
    const status = String(pedido.status || "").toUpperCase();
    const valor = Number(pedido.preco || 0);
    const multa = Number(pedido.multa || 0);

    const correspondeBusca =
      String(pedido.id).includes(texto) ||
      String(pedido.usuario ?? "").includes(texto) ||
      status.toLowerCase().includes(texto);

    const correspondeStatus =
      filtroStatus === "TODOS" ||
      status === filtroStatus;

    let correspondeValor = true;

    if (filtroValor === "ATE_50") {
      correspondeValor = valor <= 50;
    }

    if (filtroValor === "ACIMA_50") {
      correspondeValor = valor > 50;
    }

    if (filtroValor === "ACIMA_100") {
      correspondeValor = valor > 100;
    }

    let correspondeMulta = true;

    if (filtroMulta === "COM_MULTA") {
      correspondeMulta = multa > 0;
    }

    if (filtroMulta === "SEM_MULTA") {
      correspondeMulta = multa === 0;
    }

    return (
      correspondeBusca &&
      correspondeStatus &&
      correspondeValor &&
      correspondeMulta
    );
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administração
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Todos os pedidos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Consulte e cancele pedidos de qualquer usuário.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={loading}
          className="btn-secondary !px-3"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Atualizar
        </button>
      </div>

      <div className="card mt-7">
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={17}
                  className="absolute left-3.5 top-3.5 text-slate-400"
                />

                <input
                  className="input pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por pedido, usuário ou status..."
                />
              </div>

              <select
                className="input w-full lg:w-48"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="TODOS">
                  Todos os status
                </option>

                <option value="PENDENTE">
                  Pendente
                </option>

                <option value="FINALIZADO">
                  Finalizado
                </option>

                <option value="PRONTO">
                  Pronto
                </option>

                <option value="EM_ENTREGA">
                  Em entrega
                </option>

                <option value="ENTREGUE">
                  Entregue
                </option>

                <option value="CANCELADO">
                  Cancelado
                </option>
              </select>

              <select
                className="input w-full lg:w-48"
                value={filtroValor}
                onChange={(e) => setFiltroValor(e.target.value)}
              >
                <option value="TODOS">
                  Todos os valores
                </option>

                <option value="ATE_50">
                  Até R$ 50,00
                </option>

                <option value="ACIMA_50">
                  Acima de R$ 50,00
                </option>

                <option value="ACIMA_100">
                  Acima de R$ 100,00
                </option>
              </select>

              <select
                className="input w-full lg:w-40"
                value={filtroMulta}
                onChange={(e) => setFiltroMulta(e.target.value)}
              >
                <option value="TODOS">
                  Todas as multas
                </option>

                <option value="COM_MULTA">
                  Com multa
                </option>

                <option value="SEM_MULTA">
                  Sem multa
                </option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {pedidosFiltrados.length} pedido(s)
              </p>

              {(filtroStatus !== "TODOS" ||
                filtroValor !== "TODOS" ||
                filtroMulta !== "TODOS" ||
                busca) && (
                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setFiltroStatus("TODOS");
                    setFiltroValor("TODOS");
                    setFiltroMulta("TODOS");
                  }}
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {erro && (
          <div className="m-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{erro}</span>
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando pedidos...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <Package
              className="mx-auto text-slate-300"
              size={40}
            />

            <p className="mt-3 font-medium">
              Nenhum pedido encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Tente alterar os filtros ou a busca.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidosFiltrados.map((pedido) => {
              const cancelado =
                pedido.status?.toUpperCase() === "CANCELADO";

              return (
                <div
                  key={pedido.id}
                  className="grid gap-4 p-5 md:grid-cols-6 md:items-center"
                >
                  <div>
                    <p className="text-xs text-slate-400">
                      Pedido
                    </p>

                    <p className="mt-1 font-semibold">
                      #{pedido.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      ID do usuário
                    </p>

                    <p className="mt-1 font-medium">
                      {pedido.usuario ?? "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Status
                    </p>

                    <div className="mt-1">
                      <StatusBadge status={pedido.status} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Total
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatarDinheiro(pedido.preco)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Multa
                    </p>

                    <p className="mt-1 font-semibold text-red-600">
                      {formatarDinheiro(pedido.multa || 0)}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <button
                      type="button"
                      disabled={
                        cancelado ||
                        cancelando === pedido.id
                      }
                      onClick={() => cancelarPedido(pedido)}
                      className="btn-secondary !border-red-200 !text-red-600 hover:!bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={17} />

                      {cancelando === pedido.id
                        ? "Cancelando..."
                        : cancelado
                        ? "Cancelado"
                        : "Cancelar"}
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