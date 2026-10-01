import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  LockKeyhole,
  Phone,
  UserRound,
  Mail,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

type ModoLogin =
  | "telefone"
  | "email";

export default function Login() {
  const { login, loading } =
    useAuth();

  const nav = useNavigate();
  const location = useLocation();

  const [modo, setModo] =
    useState<ModoLogin>("telefone");

  const [nome, setNome] =
    useState("");

  const [telefone, setTelefone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [pedirSenha, setPedirSenha] =
    useState(false);

  const [showSenha, setShowSenha] =
    useState(false);

  const [error, setError] =
    useState("");

  function trocarModo(
    novoModo: ModoLogin
  ) {
    setModo(novoModo);

    setNome("");
    setTelefone("");
    setEmail("");
    setSenha("");

    setPedirSenha(false);
    setShowSenha(false);
    setError("");
  }

  async function submit(
    e: FormEvent
  ) {
    e.preventDefault();

    setError("");

    try {
      if (modo === "email") {
        if (!email.trim()) {
          setError(
            "Digite seu e-mail."
          );
          return;
        }

        const resultado =
          await login({
            email: email
              .trim()
              .toLowerCase(),
            senha: pedirSenha
              ? senha
              : undefined,
          });

        if (
          resultado?.senha_obrigatoria
        ) {
          setPedirSenha(true);
          return;
        }

        nav(
          (location.state as any)
            ?.from || "/dashboard"
        );

        return;
      }

      if (!nome.trim()) {
        setError(
          "Digite seu nome."
        );
        return;
      }

      const telefoneNumerico =
        Number(
          telefone.replace(
            /\D/g,
            ""
          )
        );

      if (!telefoneNumerico) {
        setError(
          "Digite seu telefone."
        );
        return;
      }

      const resultado =
        await login({
          nome: nome.trim(),
          telefone:
            telefoneNumerico,
          senha: pedirSenha
            ? senha
            : undefined,
        });

      if (
        resultado?.senha_obrigatoria
      ) {
        setPedirSenha(true);
        return;
      }

      nav(
        (location.state as any)
          ?.from || "/dashboard"
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível entrar."
      );
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LADO ESQUERDO */}
      <div className="hidden bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo dark />

        <div className="max-w-md text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Gestão simples
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Todos os seus pedidos em um só lugar.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Acompanhe pedidos, itens e status com uma interface rápida e objetiva.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          PedidoManager
        </p>
      </div>

      {/* LADO DIREITO */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* LOGO MOBILE */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <p className="text-sm font-semibold text-slate-500">
            Bem-vindo
          </p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Entrar
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Escolha como deseja entrar na sua conta.
          </p>

          {/* MODO DE LOGIN */}
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                trocarModo("telefone")
              }
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                modo === "telefone"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Phone size={16} />
                Telefone
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                trocarModo("email")
              }
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                modo === "email"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Mail size={16} />
                E-mail
              </span>
            </button>
          </div>

          {/* ERRO */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-7 space-y-4"
          >
            {/* ========================= */}
            {/* LOGIN POR TELEFONE */}
            {/* ========================= */}

            {modo === "telefone" && (
              <>
                {/* NOME */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    Nome
                  </span>

                  <div className="relative">
                    <UserRound
                      className="absolute left-3.5 top-3.5 text-slate-400"
                      size={17}
                    />

                    <input
                      className="input pl-10"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) =>
                        setNome(
                          e.target.value
                        )
                      }
                      placeholder="Seu nome"
                      disabled={loading}
                    />
                  </div>
                </label>

                {/* TELEFONE */}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    Telefone
                  </span>

                  <div className="relative">
                    <Phone
                      className="absolute left-3.5 top-3.5 text-slate-400"
                      size={17}
                    />

                    <input
                      className="input pl-10"
                      type="tel"
                      required
                      value={telefone}
                      onChange={(e) =>
                        setTelefone(
                          e.target.value
                        )
                      }
                      placeholder="Digite seu telefone"
                      disabled={loading}
                    />
                  </div>
                </label>
              </>
            )}

            {/* ========================= */}
            {/* LOGIN POR E-MAIL */}
            {/* ========================= */}

            {modo === "email" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  E-mail
                </span>

                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-3.5 text-slate-400"
                    size={17}
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
                    disabled={loading}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  O e-mail precisa estar verificado.
                </p>
              </label>
            )}

            {/* ========================= */}
            {/* SENHA ADMIN */}
            {/* ========================= */}

            {pedirSenha && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Senha do administrador
                </span>

                <div className="relative">
                  <LockKeyhole
                    className="absolute left-3.5 top-3.5 text-slate-400"
                    size={17}
                  />

                  <input
                    className="input pl-10 pr-10"
                    type={
                      showSenha
                        ? "text"
                        : "password"
                    }
                    required
                    value={senha}
                    onChange={(e) =>
                      setSenha(
                        e.target.value
                      )
                    }
                    placeholder="Digite a senha"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSenha(
                        !showSenha
                      )
                    }
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-400 transition hover:text-slate-900"
                  >
                    {showSenha ? (
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

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <>
                  {pedirSenha
                    ? "Entrar"
                    : "Continuar"}

                  <ArrowRight
                    size={17}
                  />
                </>
              )}
            </button>
          </form>

          {/* CADASTRO */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Ainda não possui conta?{" "}
            <Link
              className="font-semibold text-slate-900 hover:underline"
              to="/cadastro"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}