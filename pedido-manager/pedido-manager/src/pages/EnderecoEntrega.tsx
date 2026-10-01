import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Home,
  Loader2,
  MapPin,
  Save,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function EnderecoEntrega() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvarEndereco(e: FormEvent) {
    e.preventDefault();

    setErro("");

    if (!id) {
      setErro("Pedido não encontrado.");
      return;
    }

    if (!cep.trim()) {
      setErro("Digite o CEP.");
      return;
    }

    if (!rua.trim()) {
      setErro("Digite a rua.");
      return;
    }

    if (!numero.trim()) {
      setErro("Digite o número.");
      return;
    }

    if (!bairro.trim()) {
      setErro("Digite o bairro.");
      return;
    }

    try {
      setSalvando(true);

      await api.adicionarEndereco(Number(id), {
        cep: cep.trim(),
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        complemento: complemento.trim(),
      });

      navigate(`/pedido/${id}/pagamento`);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o endereço."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate(`/pedido/${id}`)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Voltar para o pedido
      </button>

      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
          <Home size={24} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Endereço de entrega
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Informe onde o pedido deve ser entregue.
        </p>
      </div>

      {erro && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="card p-6 md:p-8">
        <form
          onSubmit={salvarEndereco}
          className="space-y-5"
        >
          {/* CEP */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              CEP
            </span>

            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                className="input pl-10"
                type="text"
                inputMode="numeric"
                maxLength={9}
                required
                value={cep}
                onChange={(e) =>
                  setCep(e.target.value)
                }
                placeholder="00000-000"
              />
            </div>
          </label>

          {/* RUA */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              Rua
            </span>

            <input
              className="input"
              type="text"
              required
              value={rua}
              onChange={(e) =>
                setRua(e.target.value)
              }
              placeholder="Nome da rua"
            />
          </label>

          {/* NÚMERO */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              Número
            </span>

            <input
              className="input"
              type="text"
              required
              value={numero}
              onChange={(e) =>
                setNumero(e.target.value)
              }
              placeholder="Número"
            />
          </label>

          {/* BAIRRO */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              Bairro
            </span>

            <input
              className="input"
              type="text"
              required
              value={bairro}
              onChange={(e) =>
                setBairro(e.target.value)
              }
              placeholder="Bairro"
            />
          </label>

          {/* COMPLEMENTO */}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              Complemento
              <span className="ml-1 text-xs font-normal text-slate-400">
                (opcional)
              </span>
            </span>

            <input
              className="input"
              type="text"
              value={complemento}
              onChange={(e) =>
                setComplemento(e.target.value)
              }
              placeholder="Apartamento, casa, referência..."
            />
          </label>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={salvando}
            className="btn-primary w-full"
          >
            {salvando ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Salvando endereço...
              </>
            ) : (
              <>
                <Save size={18} />
                Confirmar endereço
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}