import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AdicionarEmail() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  const [codigoEnviado, setCodigoEnviado] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [verificando, setVerificando] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] =
    useState("");

  function pegarIdUsuarioDoToken() {
    const token =
      localStorage.getItem(
        "pedido_token"
      );

    if (!token) {
      throw new Error(
        "Usuário não autenticado."
      );
    }

    try {
      const partes = token.split(".");

      const payload = JSON.parse(
        atob(
          partes[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      const id =
        payload.id ??
        payload.user_id ??
        payload.usuario_id ??
        payload.sub;

      if (!id) {
        throw new Error(
          "Não foi possível identificar o usuário."
        );
      }

      return Number(id);
    } catch {
      throw new Error(
        "Token inválido. Faça login novamente."
      );
    }
  }

  async function salvarEmail(e: FormEvent) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!email.trim()) {
      setErro(
        "Digite um e-mail."
      );
      return;
    }

    try {
      setSalvando(true);

      const idUsuario =
        pegarIdUsuarioDoToken();

      await api.adicionarEmail(
        idUsuario,
        email.trim().toLowerCase()
      );

      setCodigoEnviado(true);

      setMensagem(
        "E-mail salvo! Enviamos um código de verificação para seu endereço."
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o e-mail."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function verificarEmail(e: FormEvent) {
    e.preventDefault();

    setErro("");
    setMensagem("");

    const codigoLimpo =
      codigo.replace(/\D/g, "");

    if (codigoLimpo.length !== 6) {
      setErro(
        "Digite os 6 dígitos do código recebido por e-mail."
      );
      return;
    }

    try {
      setVerificando(true);

      const idUsuario =
        pegarIdUsuarioDoToken();

      await api.verificarEmail(
        idUsuario,
        codigoLimpo
      );

      setMensagem(
        "E-mail verificado com sucesso!"
      );

      setTimeout(() => {
        navigate("/perfil");
      }, 1000);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível verificar o e-mail."
      );
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* VOLTAR */}
      <button
        type="button"
        onClick={() =>
          navigate("/perfil")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Voltar ao perfil
      </button>

      {/* CABEÇALHO */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          Conta
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {codigoEnviado
            ? "Verificar e-mail"
            : "Adicionar e-mail"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {codigoEnviado
            ? `Digite o código enviado para ${email}.`
            : "Cadastre seu e-mail para receber notificações e confirmar sua conta."}
        </p>
      </div>

      <div className="card p-6 md:p-8">
        {/* MENSAGEM */}
        {mensagem && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>{mensagem}</span>
          </div>
        )}

        {/* ERRO */}
        {erro && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {!codigoEnviado ? (
          /* ========================= */
          /* CADASTRAR E-MAIL */
          /* ========================= */
          <form
            onSubmit={salvarEmail}
            className="space-y-5"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-900">
                E-mail
              </span>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-3.5 text-slate-400"
                />

                <input
                  className="input pl-10"
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="voce@email.com"
                  disabled={salvando}
                />
              </div>
            </label>

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
                  Enviando código...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar e enviar código
                </>
              )}
            </button>
          </form>
        ) : (
          /* ========================= */
          /* VERIFICAR CÓDIGO */
          /* ========================= */
          <form
            onSubmit={verificarEmail}
            className="space-y-5"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck size={30} />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">
                Código de verificação
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enviamos um código de 6 dígitos para:
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {email}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-900">
                Código
              </span>

              <input
                className="input h-14 text-center text-2xl font-bold tracking-[0.4em]"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={codigo}
                onChange={(e) => {
                  const valor =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                  setCodigo(valor);
                  setErro("");
                  setMensagem("");
                }}
                placeholder="000000"
                disabled={verificando}
              />
            </label>

            <button
              type="submit"
              disabled={
                verificando ||
                codigo.length !== 6
              }
              className="btn-primary w-full"
            >
              {verificando ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={18}
                  />
                  Verificar e-mail
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCodigoEnviado(false);
                setCodigo("");
                setErro("");
                setMensagem("");
              }}
              disabled={verificando}
              className="w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Alterar e-mail
            </button>

            <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
              O código é válido por 10 minutos.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}