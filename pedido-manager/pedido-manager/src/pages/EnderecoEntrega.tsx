import { FormEvent, useState } from "react";
import { ArrowLeft, Home, Loader2, MapPin, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

type ViaCEPResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export default function EnderecoEntrega() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [avisoCep, setAvisoCep] = useState("");

  async function buscarCep(valor: string) {
    const cepNumeros = valor.replace(/\D/g, "");
    if (cepNumeros.length !== 8) return;

    try {
      setBuscandoCep(true);
      setErro("");
      setAvisoCep("");

      const resposta = await fetch(`https://viacep.com.br/ws/${cepNumeros}/json/`);
      if (!resposta.ok) throw new Error("Não foi possível consultar o CEP agora.");

      const dados: ViaCEPResponse = await resposta.json();

      if (dados.erro) {
        setRua("");
        setBairro("");
        setCidade("");
        setUf("");
        setAvisoCep("CEP não encontrado. Confira os números digitados.");
        return;
      }

      setRua(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidade(dados.localidade || "");
      setUf(dados.uf || "");

      if (!dados.logradouro || !dados.bairro) {
        setAvisoCep("CEP encontrado, mas alguns campos não foram informados. Você pode preenchê-los manualmente.");
      }
    } catch (error) {
      setAvisoCep(error instanceof Error ? error.message : "Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function alterarCep(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);
    const formatado = numeros.length > 5
      ? `${numeros.slice(0, 5)}-${numeros.slice(5)}`
      : numeros;

    setCep(formatado);
    setAvisoCep("");

    if (numeros.length === 8) void buscarCep(numeros);
  }

  async function salvarEndereco(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!id) {
      setErro("Pedido não encontrado.");
      return;
    }
    if (cep.replace(/\D/g, "").length !== 8) {
      setErro("Digite um CEP válido com 8 números.");
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
      setErro(error instanceof Error ? error.message : "Não foi possível salvar o endereço.");
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Endereço de entrega</h1>
        <p className="mt-2 text-sm text-slate-500">Informe onde o pedido deve ser entregue.</p>
      </div>

      {erro && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}
      {avisoCep && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {avisoCep}
        </div>
      )}

      <div className="card p-6 md:p-8">
        <form onSubmit={salvarEndereco} className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">CEP</span>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10 pr-10"
                type="text"
                inputMode="numeric"
                maxLength={9}
                required
                value={cep}
                onChange={(e) => alterarCep(e.target.value)}
                placeholder="00000-000"
              />
              {buscandoCep && (
                <Loader2 size={18} className="absolute right-3.5 top-3.5 animate-spin text-slate-400" aria-label="Consultando CEP" />
              )}
            </div>
            <span className="mt-1 block text-xs text-slate-500">
              A rua e o bairro serão preenchidos quando o CEP for encontrado.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">Rua</span>
            <input className="input" type="text" required value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Nome da rua" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">Número</span>
            <input className="input" type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">Bairro</span>
            <input className="input" type="text" required value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">Cidade</span>
            <input className="input" type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" readOnly={Boolean(cidade)} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">Estado (UF)</span>
            <input className="input" type="text" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} placeholder="UF" readOnly={Boolean(uf)} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-900">
              Complemento
              <span className="ml-1 text-xs font-normal text-slate-400">(opcional)</span>
            </span>
            <input className="input" type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apartamento, casa, referência..." />
          </label>

          <button type="submit" disabled={salvando || buscandoCep} className="btn-primary w-full">
            {salvando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
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
