import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import { api, Pedido } from "../lib/api";

type DadosPagamento = {
  tipo?: "FINALIZACAO" | "CANCELAMENTO";
  pedidoId?: number;
  valor?: number;
  multa?: number;
};

export default function Pagamento() {
  const { id } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const dados =
    (location.state as DadosPagamento | null) || {};

  const tipo = dados.tipo || "FINALIZACAO";
  const ehCancelamento = tipo === "CANCELAMENTO";

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregandoPedido, setCarregandoPedido] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPedido() {
      if (!id) {
        setErro("ID do pedido não encontrado.");
        setCarregandoPedido(false);
        return;
      }

      const pedidoId = Number(id);

      if (Number.isNaN(pedidoId)) {
        setErro("ID do pedido inválido.");
        setCarregandoPedido(false);
        return;
      }

      try {
        setCarregandoPedido(true);
        setErro("");

        const resposta = await api.visualizarPedido(pedidoId);

        const dadosPedido =
          resposta?.pedido &&
          typeof resposta.pedido === "object"
            ? resposta.pedido
            : resposta;

        setPedido(dadosPedido as Pedido);
      } catch (error: any) {
        setErro(
          error?.message ||
            "Não foi possível carregar o valor do pedido."
        );
      } finally {
        setCarregandoPedido(false);
      }
    }

    carregarPedido();
  }, [id]);

  const valorPagamento = ehCancelamento
    ? Number(dados.multa ?? pedido?.multa ?? 0)
    : Number(pedido?.preco ?? dados.valor ?? 0);

  async function realizarPagamento(formaPagamento: string) {
    if (!id) {
      setErro("ID do pedido não encontrado.");
      return;
    }

    const pedidoId = Number(id);

    if (Number.isNaN(pedidoId)) {
      setErro("ID do pedido inválido.");
      return;
    }

    if (valorPagamento <= 0 && !ehCancelamento) {
      setErro("O valor do pedido não foi carregado corretamente.");
      return;
    }

    try {
      setLoading(true);
      setErro("");

      if (ehCancelamento) {
        await api.pagarMulta(pedidoId, formaPagamento);
      } else {
        await api.finalizarPedido(pedidoId, formaPagamento);
      }

      nav(`/pedido/${id}`);
    } catch (error: any) {
      setErro(
        error?.message ||
          "Não foi possível concluir o pagamento."
      );
    } finally {
      setLoading(false);
    }
  }

  function voltar() {
    nav(`/pedido/${id}`);
  }

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={voltar}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Voltar para o pedido
      </button>

      <div className="card p-6 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {ehCancelamento
              ? "Pagamento da multa"
              : "Forma de pagamento"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {ehCancelamento
              ? "Escolha uma forma de pagamento para concluir o cancelamento."
              : "Escolha uma forma de pagamento para finalizar o pedido."}
          </p>
        </div>

        {carregandoPedido ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Carregando valor do pedido...
          </div>
        ) : (
          <>
            {ehCancelamento && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <AlertTriangle size={21} />
                  </div>

                  <div>
                    <p className="font-bold text-amber-900">
                      Cancelamento com multa
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      O prazo de 15 minutos após a finalização do pedido foi ultrapassado.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">
                    Valor da multa
                  </span>

                  <span className="text-2xl font-black text-slate-900">
                    {formatarValor(valorPagamento)}
                  </span>
                </div>
              </div>
            )}

            {!ehCancelamento && (
              <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
                <span className="text-sm font-medium text-slate-600">
                  Total do pedido
                </span>

                <span className="text-xl font-bold text-slate-900">
                  {formatarValor(valorPagamento)}
                </span>
              </div>
            )}
          </>
        )}

        {erro && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-7">
          <p className="mb-4 text-sm font-semibold text-slate-700">
            {ehCancelamento
              ? "Escolha como deseja pagar a multa:"
              : "Escolha a forma de pagamento:"}
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => realizarPagamento("PIX")}
              disabled={
                loading ||
                carregandoPedido ||
                (!ehCancelamento && valorPagamento <= 0)
              }
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={32}
                  className="animate-spin text-slate-900"
                />
              ) : (
                <QrCode size={32} className="text-slate-900" />
              )}

              <span className="text-lg font-bold text-slate-900">
                PIX
              </span>

              <span className="text-sm text-slate-500">
                {ehCancelamento
                  ? "Pagar multa com PIX"
                  : "Finalizar com PIX"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => realizarPagamento("CARTAO")}
              disabled={
                loading ||
                carregandoPedido ||
                (!ehCancelamento && valorPagamento <= 0)
              }
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={32}
                  className="animate-spin text-slate-900"
                />
              ) : (
                <CreditCard size={32} className="text-slate-900" />
              )}

              <span className="text-lg font-bold text-slate-900">
                Cartão
              </span>

              <span className="text-sm text-slate-500">
                {ehCancelamento
                  ? "Pagar multa com cartão"
                  : "Finalizar com cartão"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => realizarPagamento("DINHEIRO")}
              disabled={
                loading ||
                carregandoPedido ||
                (!ehCancelamento && valorPagamento <= 0)
              }
              className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={32}
                  className="animate-spin text-slate-900"
                />
              ) : (
                <Banknote size={32} className="text-slate-900" />
              )}

              <span className="text-lg font-bold text-slate-900">
                Dinheiro
              </span>

              <span className="text-sm text-slate-500">
                {ehCancelamento
                  ? "Pagar multa em dinheiro"
                  : "Finalizar com dinheiro"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          {ehCancelamento
            ? "Após o pagamento da multa, o pedido será cancelado."
            : "A forma de pagamento escolhida será salva no pedido."}
        </div>
      </div>
    </div>
  );
}