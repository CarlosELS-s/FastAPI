import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api, Pedido } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function PedidoEmEntregaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [codigoDigitado, setCodigoDigitado] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarPedido() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.visualizarPedido(pedidoId);

      const dados =
        resposta?.pedido &&
        typeof resposta.pedido === "object"
          ? resposta.pedido
          : resposta;

      setPedido(dados as Pedido);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o pedido."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(pedidoId)) {
      carregarPedido();
    } else {
      setErro("ID do pedido inválido.");
      setCarregando(false);
    }
  }, [pedidoId]);

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarPagamento(pedido: Pedido) {
    const pagamento = pedido.forma_pagamento || pedido.pagamento;

    if (!pagamento) {
      return "Não informado";
    }

    const valor = String(pagamento).toUpperCase();

    if (valor === "PIX") {
      return "PIX";
    }

    if (valor === "CARTAO" || valor === "CARTÃO") {
      return "Cartão";
    }

    if (valor === "DINHEIRO") {
      return "Dinheiro";
    }

    return String(pagamento);
  }

  async function confirmarEntrega() {
    if (!pedido) {
      return;
    }

    const codigo = codigoDigitado
      .replace(/\D/g, "")
      .slice(0, 6);

    if (codigo.length !== 6) {
      setErro("Digite exatamente os 6 dígitos do código de entrega.");
      return;
    }

    try {
      setFinalizando(true);
      setErro("");
      setMensagem("");

      await api.entregue(pedido.id, codigo);

      setPedido({
        ...pedido,
        status: "ENTREGUE",
      });

      setCodigoDigitado("");

      setMensagem(
        `Pedido #${pedido.id} marcado como entregue com sucesso.`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Código inválido ou não foi possível confirmar a entrega."
      );
    } finally {
      setFinalizando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-3 text-sm text-slate-500">
        <Loader2 size={24} className="animate-spin" />
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/admin/pedidos-em-entrega")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Voltar
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} />

            <span>
              {erro || "Pedido não encontrado."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const status = String(pedido.status || "").toUpperCase();
  const entregue = status === "ENTREGUE";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/pedidos-em-entrega")}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Pedidos em entrega
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Pedido #{pedido.id}
              </h1>

              <StatusBadge status={pedido.status} />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Detalhes completos do pedido em rota de entrega.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Truck size={28} />
          </div>
        </div>
      </div>

      {mensagem && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <span>{mensagem}</span>
        </div>
      )}

      {erro && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle size={20} className="mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {!entregue && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={22} className="text-slate-700" />

            <h2 className="text-xl font-bold text-slate-900">
              Confirmar entrega
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Peça o código ao cliente e digite abaixo para confirmar a entrega.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigoDigitado}
              onChange={(e) => {
                const valor = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setCodigoDigitado(valor);
                setMensagem("");
                setErro("");
              }}
              placeholder="Digite os 6 dígitos"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-center text-lg font-bold tracking-[0.3em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:max-w-xs"
            />

            <button
              type="button"
              onClick={confirmarEntrega}
              disabled={codigoDigitado.length !== 6 || finalizando}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finalizando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirmar entrega
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {entregue && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 size={25} />

            <div>
              <p className="font-bold">
                Pedido entregue
              </p>

              <p className="text-sm">
                A entrega deste pedido já foi concluída.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <User size={21} className="text-slate-700" />

          <h2 className="text-xl font-bold text-slate-900">
            Cliente
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              ID do usuário
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.usuario ?? "Não informado"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <MapPin size={21} className="text-slate-700" />

          <h2 className="text-xl font-bold text-slate-900">
            Endereço de entrega
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CEP
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.cep || "Não informado"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rua
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.rua || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Número
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.numero || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bairro
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.bairro || "Não informado"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Complemento
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {pedido.complemento || "Nenhum"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Forma de pagamento
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatarPagamento(pedido)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total do pedido
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatarValor(pedido.preco)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <Package size={21} className="text-slate-700" />

            <h2 className="text-xl font-bold text-slate-900">
              Itens do pedido
            </h2>
          </div>
        </div>

        {pedido.itens && pedido.itens.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pedido.itens.map((item, index) => (
              <div
                key={`${pedido.id}-${index}`}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.sabor}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Tamanho: {item.tamanho}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Quantidade: {item.quantidade}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-500">
                    Valor unitário
                  </p>

                  <p className="font-bold text-slate-900">
                    {formatarValor(item.preco_unitario)}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Subtotal:{" "}
                    {formatarValor(
                      Number(item.quantidade) *
                        Number(item.preco_unitario)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            Este pedido não possui itens.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-6">
          <span className="font-semibold text-slate-600">
            Total
          </span>

          <span className="text-2xl font-black text-slate-900">
            {formatarValor(pedido.preco)}
          </span>
        </div>
      </div>
    </div>
  );
}