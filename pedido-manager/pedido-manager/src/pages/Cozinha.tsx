import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

type PedidoComPagamento = Pedido & {
  forma_pagamento?: string | null;
  pagamento?: string | null;
};

function Cozinha() {
  const [pedidos, setPedidos] = useState<PedidoComPagamento[]>([]);
  const [pedidoAberto, setPedidoAberto] = useState<number | null>(null);
  const [pedidoEnviando, setPedidoEnviando] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarPedidos() {
    try {
      setCarregando(true);
      setErro("");

      const todosPedidos = await api.todosPedidos();

      const pedidosFinalizados = todosPedidos.filter(
        (pedido) => pedido.status.toUpperCase() === "FINALIZADO"
      );

      const pedidosComDetalhes = await Promise.all(
        pedidosFinalizados.map(async (pedido) => {
          try {
            const detalhes = await api.visualizarPedido(pedido.id);

            return detalhes as PedidoComPagamento;
          } catch {
            return pedido as PedidoComPagamento;
          }
        })
      );

      setPedidos(
        pedidosComDetalhes.sort((a, b) => a.id - b.id)
      );
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

  function alternarPedido(id: number) {
    setPedidoAberto((atual) => {
      if (atual === id) {
        return null;
      }

      return id;
    });
  }

  async function marcarComoPronto(id: number) {
    try {
      setPedidoEnviando(id);
      setErro("");
      setMensagem("");

      await api.marcarPedidoPronto(id);

      setPedidos((pedidosAtuais) =>
        pedidosAtuais.filter((pedido) => pedido.id !== id)
      );

      setPedidoAberto(null);
      setMensagem(`Pedido #${id} marcado como pronto.`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível marcar o pedido como pronto."
      );
    } finally {
      setPedidoEnviando(null);
    }
  }

  function formatarPagamento(pedido: PedidoComPagamento) {
    const pagamento =
      pedido.forma_pagamento || pedido.pagamento;

    if (!pagamento) {
      return "Não informado";
    }

    const valor = pagamento.toUpperCase();

    if (valor === "PIX") {
      return "PIX";
    }

    if (valor === "CARTAO" || valor === "CARTÃO") {
      return "Cartão";
    }

    if (valor === "DINHEIRO") {
      return "Dinheiro";
    }

    return pagamento;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Painel da cozinha
          </h1>

          <p className="text-sm text-gray-600">
            Clique no pedido para ver os itens e marcar como pronto.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <span>{erro}</span>
        </div>
      )}

      {mensagem && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-600">
          <Loader2 size={24} className="animate-spin" />
          Carregando pedidos finalizados...
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Nenhum pedido finalizado aguardando preparo.
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const aberto = pedidoAberto === pedido.id;
            const enviando = pedidoEnviando === pedido.id;

            return (
              <div
                key={pedido.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => alternarPedido(pedido.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-gray-50"
                >
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Pedido #{pedido.id}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Usuário: {pedido.usuario ?? "Não informado"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {pedido.itens?.length || 0} item(ns) no pedido
                    </p>

                    <p className="mt-2 text-sm font-semibold text-gray-700">
                      Forma de pagamento:{" "}
                      <span className="font-normal">
                        {formatarPagamento(pedido)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={pedido.status} />

                    {aberto ? (
                      <ChevronUp size={22} className="text-gray-600" />
                    ) : (
                      <ChevronDown size={22} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {aberto && (
                  <div className="border-t bg-gray-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                      Itens do pedido
                    </h3>

                    {pedido.itens?.length === 0 ? (
                      <p className="rounded-lg bg-white p-4 text-sm text-gray-500">
                        Este pedido não possui itens.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg bg-white">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b text-gray-500">
                              <th className="px-4 py-3 font-medium">
                                Quantidade
                              </th>

                              <th className="px-4 py-3 font-medium">
                                Sabor
                              </th>

                              <th className="px-4 py-3 font-medium">
                                Tamanho
                              </th>

                              <th className="px-4 py-3 font-medium">
                                Preço unitário
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {pedido.itens?.map((item, index) => (
                              <tr
                                key={`${pedido.id}-${index}`}
                                className="border-b last:border-b-0"
                              >
                                <td className="px-4 py-4">
                                  <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-gray-900 px-3 py-1 font-bold text-white">
                                    {item.quantidade}
                                  </span>
                                </td>

                                <td className="px-4 py-4 font-semibold text-gray-900">
                                  {item.sabor}
                                </td>

                                <td className="px-4 py-4 text-gray-700">
                                  {item.tamanho}
                                </td>

                                <td className="px-4 py-4 text-gray-700">
                                  R${" "}
                                  {Number(item.preco_unitario).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">
                        Forma de pagamento
                      </p>

                      <p className="mt-1 text-sm text-blue-800">
                        {formatarPagamento(pedido)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-gray-600">
                        Total do pedido
                      </span>

                      <div className="flex flex-wrap items-center gap-4">
                        <strong className="text-xl text-gray-900">
                          R$ {Number(pedido.preco).toFixed(2)}
                        </strong>

                        <button
                          type="button"
                          onClick={() => marcarComoPronto(pedido.id)}
                          disabled={enviando}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {enviando ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Check size={18} />
                              Pedido pronto
                            </>
                          )}
                        </button>
                      </div>
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

export default Cozinha;