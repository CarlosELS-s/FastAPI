import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

type ResultadoCadastro = {
  id?: number;
  usuario?: {
    id?: number;
  };
};

export default function Cadastro() {
  const { signup, loading } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
  });

  const [error, setError] = useState("");

  function handleChange(
    campo: "nome" | "email",
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();

    if (!nome) {
      setError("Digite seu nome.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    try {
      const resposta = (await signup({
        nome,
        email,
        adm: false,
        ativo: true,
      })) as ResultadoCadastro;

      const usuarioId =
        resposta?.id ??
        resposta?.usuario?.id;

      if (!usuarioId) {
        throw new Error(
          "A API não retornou o ID do usuário."
        );
      }

      nav("/verificar-email", {
        state: {
          usuarioId,
          email,
          modo: "cadastro",
        },
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Não foi possível criar sua conta."
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-md pt-8 md:pt-16">
        <Logo />

        <div className="card mt-8 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Criar sua conta
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Informe seu nome e e-mail para começar.
          </p>

          {error && (
            <div
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome
              </span>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  autoComplete="name"
                  value={form.nome}
                  onChange={(e) =>
                    handleChange("nome", e.target.value)
                  }
                  placeholder="Digite seu nome"
                  className="input w-full pl-11"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                E-mail
              </span>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                  placeholder="Digite seu e-mail"
                  className="input w-full pl-11"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já possui conta?{" "}
            <Link
              className="font-semibold text-slate-900 hover:underline"
              to="/login"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}