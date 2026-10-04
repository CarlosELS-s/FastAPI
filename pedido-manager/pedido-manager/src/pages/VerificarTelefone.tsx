import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type LocationState = {
  usuarioId?: number;
  telefone?: number;
  email?: string;
  modo?: "cadastro" | "login" | "login-email";
};

export default function VerificarTelefone() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const ehLoginEmail = state.modo === "login-email";
  const ehLoginTelefone = state.modo === "login";

  async function verificar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!state.usuarioId) {
      setErro("Usuário não identificado.");
      return;
    }

    if (codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos.");
      return;
    }

    setLoading(true);

    try {
      if (ehLoginEmail) {
        const resposta = await api.verificarLoginEmail(state.usuarioId, codigo);
        const token = resposta?.access_token ?? resposta?.accessToken ?? resposta?.token;

        if (!token) {
          throw new Error("A API não retornou o token de acesso.");
        }

        localStorage.setItem("pedido_token", token);
        setMensagem("Código do e-mail confirmado. Entrando...");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);

        return;
      }

      if (ehLoginTelefone) {
        const resposta = await api.verificarLogin(state.usuarioId, codigo);
        const token = resposta?.access_token ?? resposta?.accessToken ?? resposta?.token;

        if (!token) {
          throw new Error("A API não retornou o token de acesso.");
        }

        localStorage.setItem("pedido_token", token);
        setMensagem("Telefone verificado. Entrando...");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);

        return;
      }

      await api.verificarTelefone(state.usuarioId, codigo);
      setMensagem("Telefone verificado com sucesso.");

      setTimeout(() => {
        nav("/login");
      }, 1000);
    } catch (e: any) {
      setErro(e?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function reenviar() {
    setErro("");
    setMensagem("");

    if (!state.usuarioId) {
      setErro("Usuário não identificado.");
      return;
    }

    setReenviando(true);

    try {
      if (ehLoginEmail) {
        await api.reenviarCodigoLoginEmail(state.usuarioId);
        setMensagem("Um novo código foi enviado para seu e-mail.");
        return;
      }

      await api.reenviarCodigoTelefone(state.usuarioId);
      setMensagem("Um novo código foi gerado. Confira o terminal do FastAPI.");
    } catch (e: any) {
      setErro(e?.message || "Não foi possível gerar outro código.");
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-md pt-10 md:pt-20">
        <div className="card p-6 md:p-8">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Smartphone size={28} />
            </div>
          </div>

          <h1 className="mt-5 text-center text-2xl font-bold text-slate-900">
            {ehLoginEmail ? "Verifique seu e-mail" : "Verifique seu telefone"}
          </h1>

          <p className="mt-2 text-center text-sm text-slate-500">
            {ehLoginEmail
              ? "Digite o código de 6 dígitos enviado para seu e-mail."
              : "Digite o código de 6 dígitos mostrado no terminal do FastAPI."}
          </p>

          {ehLoginEmail ? (
            state.email && (
              <p className="mt-2 text-center text-sm font-semibold text-slate-700">
                E-mail: {state.email}
              </p>
            )
          ) : (
            state.telefone && (
              <p className="mt-2 text-center text-sm font-semibold text-slate-700">
                Telefone: {state.telefone}
              </p>
            )
          )}

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 size={18} />
              {mensagem}
            </div>
          )}

          <form onSubmit={verificar} className="mt-6 space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Digite o código"
              className="input h-14 w-full text-center text-2xl font-bold tracking-[0.4em]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : ehLoginEmail ? (
                "Confirmar código"
              ) : (
                "Verificar telefone"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={reenviar}
            disabled={reenviando || !state.usuarioId}
            className="mt-4 w-full text-sm font-semibold text-slate-700 hover:underline disabled:opacity-50"
          >
            {reenviando
              ? "Enviando..."
              : ehLoginEmail
              ? "Enviar novo código por e-mail"
              : "Gerar novo código"}
          </button>

          <button
            type="button"
            onClick={() => nav("/login")}
            className="mt-4 w-full text-sm text-slate-500 hover:text-slate-900"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}