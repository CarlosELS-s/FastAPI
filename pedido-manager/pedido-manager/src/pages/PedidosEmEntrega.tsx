import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Loader2,
  RefreshCw,
  Truck,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

type UsuarioInfo = {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: number | null;
  ativo?: boolean | null;
};

export default function PedidosEmEntrega() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nomesClientes, setNomesClientes] = useState<Record<number, string>>({});
  const [codigos, setCodigos] = useState<Record<number, string>>({});
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");
      setMensagem("");

      const todosPedidos = await api.todosPedidos();

      const pedidosEmEntrega = todosPedidos
        .filter((pedido) => String(pedido.status).toUpperCase() === "EM_ENTREGA")
        .sort((a, b) => a.id - b.id);

      const pedidosComDetalhes = await Promise.all(
        pedidosEmEntrega.map(async (pedido) => {
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

      setPedidos(pedidosComDetalhes);

      const idsUsuarios = [
        ...new Set(
          pedidosComDetalhes
            .map((pedido) => pedido.usuario)
            .filter((id): id is number => typeof id === "number")
        ),
      ];

      const resultadosUsuarios = await Promise.all(
        idsUsuarios.map(async (id) => {
          try {
            const usuario = (await api.informacaoUsuario(id)) as UsuarioInfo;

            return {
              id,
              nome: usuario?.nome || `Cliente #${id}`,
            };
          } catch {
            return {
              id,
              nome: `Cliente #${id}`,
            };
          }
        })
      );

      const mapaNomes: Record<number, string> = {};

      resultadosUsuarios.forEach((usuario) => {
        mapaNomes[usuario.id] = usuario.nome;
      });

      setNomesClientes(mapaNomes);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos em entrega."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function nomeCliente(pedido: Pedido) {
    if (typeof pedido.usuario !== "number") {
      return "Cliente não informado";
    }

    return nomesClientes[pedido.usuario] || "Carregando cliente...";
  }

  function alterarCodigo(id: number, codigo: string) {
    setCodigos((estado) => ({
      ...estado,
      [id]: codigo.replace(/\D/g, "").slice(0, 6),
    }));

    setErro("");
    setMensagem("");
  }

  async function confirmarEntrega(pedido: Pedido) {
    const codigo = codigos[pedido.id] || "";

    if (codigo.length !== 6) {
      setErro("Digite o código de entrega com 6 dígitos.");
      return;
    }

    try {
      setConfirmando(pedido.id);
      setErro("");
      setMensagem("");

      await api.entregue(pedido.id, codigo);

      setPedidos((estado) => estado.filter((item) => item.id !== pedido.id));

      setCodigos((estado) => {
        const novoEstado = { ...estado };
        delete novoEstado[pedido.id];
        return novoEstado;
      });

      setMensagem(`Pedido #${pedido.id} entregue com sucesso.`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar a entrega."
      );
    } finally {
      setConfirmando(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Truck size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Pedidos em entrega
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Confirme a entrega usando o código informado pelo cliente.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {mensagem && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={20} />
          <span>{mensagem}</span>
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
          <Loader2 size={24} className="animate-spin" />
          Carregando pedidos em entrega...
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Truck size={27} />
          </div>

          <p className="mt-4 font-semibold text-slate-700">
            Nenhum pedido em entrega.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Os pedidos aparecerão aqui quando forem retirados para entrega.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      Pedido #{pedido.id}
                    </h2>

                    <StatusBadge status={pedido.status} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <User size={17} className="shrink-0 text-slate-500" />

                    <span>
                      <strong className="text-slate-800">
                        Cliente:
                      </strong>{" "}
                      {nomeCliente(pedido)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Itens:
                      </span>{" "}
                      {pedido.itens?.length || 0}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">
                        Total:
                      </span>{" "}
                      <span className="font-bold text-slate-900">
                        {formatarValor(pedido.preco)}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">
                        Pagamento:
                      </span>{" "}
                      {pedido.forma_pagamento ||
                        pedido.pagamento ||
                        "Não informado"}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <KeyRound size={18} className="text-slate-600" />

                      <p className="text-sm font-semibold text-slate-800">
                        Código informado pelo cliente
                      </p>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={codigos[pedido.id] || ""}
                        onChange={(e) =>
                          alterarCodigo(
                            pedido.id,
                            e.target.value
                          )
                        }
                        placeholder="Digite os 6 dígitos"
                        className="input"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          confirmarEntrega(pedido)
                        }
                        disabled={
                          confirmando === pedido.id
                        }
                        className="btn-primary"
                      >
                        {confirmando === pedido.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={17} />
                        )}

                        Confirmar entrega
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/pedidos-em-entrega/${pedido.id}`
                    )
                  }
                  className="flex shrink-0 items-center justify-end text-slate-400 transition hover:text-slate-700"
                >
                  <span className="mr-2 text-sm font-semibold">
                    Ver pedido
                  </span>

                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}