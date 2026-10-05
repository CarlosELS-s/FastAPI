import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

type ModoLogin = "telefone" | "email";

type ResultadoLogin = {
  senha_obrigatoria?: boolean;
  verificacao_necessaria?: boolean;
  usuario_id?: number;
  email?: string | null;
  telefone?: string;
};

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [modo, setModo] = useState<ModoLogin>("telefone");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [pedirSenha, setPedirSenha] = useState(false);
  const [error, setError] = useState("");

  function trocarModo(novoModo: ModoLogin) {
    setModo(novoModo);
    setError("");
    setSenha("");
    setPedirSenha(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (modo === "email") {
        const emailLimpo = email.trim().toLowerCase();

        if (!emailLimpo) {
          setError("Digite seu e-mail.");
          return;
        }

        const resultado = (await login({
          email: emailLimpo,
          senha: pedirSenha ? senha : undefined,
        })) as ResultadoLogin;

        if (resultado?.senha_obrigatoria && !pedirSenha) {
          setPedirSenha(true);
          return;
        }

        if (resultado?.verificacao_necessaria) {
          nav("/verificar-telefone", {
            state: {
              usuarioId: resultado.usuario_id,
              email: resultado.email || emailLimpo,
              modo: "login-email",
            },
          });
          return;
        }
      } else {
        // Telefone deve ser enviado como STRING
        const telefoneLimpo = telefone.replace(/\D/g, "");

        if (!nome.trim()) {
          setError("Digite seu nome.");
          return;
        }

        if (!telefoneLimpo) {
          setError("Digite seu telefone.");
          return;
        }

        const resultado = (await login({
          nome: nome.trim(),
          telefone: telefoneLimpo,
          senha: pedirSenha ? senha : undefined,
        })) as ResultadoLogin;

        if (resultado?.senha_obrigatoria && !pedirSenha) {
          setPedirSenha(true);
          return;
        }

        if (resultado?.verificacao_necessaria) {
          nav("/verificar-telefone", {
            state: {
              usuarioId: resultado.usuario_id,
              telefone: resultado.telefone || telefoneLimpo,
              modo: "login",
            },
          });
          return;
        }
      }

      nav((location.state as any)?.from || "/dashboard");
    } catch (err: any) {
      setError(err?.message || "Não foi possível entrar na sua conta.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-slate-950 lg:flex">
          <div className="flex w-full flex-col justify-between p-12 xl:p-16">
            <Logo />

            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Gestão simples
              </p>

              <h2 className="mt-5 text-5xl font-bold leading-tight text-white">
                Todos os seus
                <br />
                pedidos em um só
                <br />
                lugar.
              </h2>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Acompanhe pedidos, itens e status com uma interface rápida e
                objetiva.
              </p>
            </div>

            <p className="text-sm text-slate-500">PedidoManager</p>
          </div>
        </div>

        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Bem-vindo
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Entrar
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Escolha como deseja entrar na sua conta.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => trocarModo("telefone")}
                className={[
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition",
                  modo === "telefone"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
              >
                <Phone size={17} />
                Telefone
              </button>

              <button
                type="button"
                onClick={() => trocarModo("email")}
                className={[
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition",
                  modo === "email"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900",
                ].join(" ")}
              >
                <Mail size={17} />
                E-mail
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-5">
              {modo === "telefone" ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-900">
                      Nome
                    </span>

                    <div className="relative">
                      <UserRound
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Digite seu nome"
                        className="input w-full pl-11"
                        required
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-900">
                      Telefone
                    </span>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        inputMode="numeric"
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(
                            e.target.value.replace(/\D/g, "").slice(0, 11)
                          )
                        }
                        placeholder="Digite seu telefone"
                        className="input w-full pl-11"
                        required
                      />
                    </div>
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-900">
                    E-mail
                  </span>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input w-full pl-11"
                      required
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    O código de acesso será enviado para seu e-mail.
                  </p>
                </label>
              )}

              {pedirSenha && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-900">
                    Senha do administrador
                  </span>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Digite sua senha"
                      className="input w-full pl-11 pr-11"
                      autoFocus
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setMostrarSenha((atual) => !atual)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {mostrarSenha ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Este usuário possui acesso de administrador.
                  </p>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  "Entrando..."
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Ainda não possui conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-slate-900 hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}