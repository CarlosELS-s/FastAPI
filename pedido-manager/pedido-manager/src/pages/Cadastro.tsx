import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Phone,
  UserRound,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Cadastro() {
  const { signup, loading } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
  });

  const [error, setError] = useState("");

  function handleChange(
    campo: "nome" | "telefone",
    valor: string
  ) {
    setForm({
      ...form,
      [campo]: valor,
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const nome = form.nome.trim();

    if (!nome) {
      setError("Digite seu nome.");
      return;
    }

    const telefoneNumerico = Number(
      form.telefone.replace(/\D/g, "")
    );

    if (!telefoneNumerico) {
      setError("Digite um telefone válido.");
      return;
    }

    try {
      const resposta = await signup({
        nome,
        telefone: telefoneNumerico,
        adm: false,
        ativo: true,
      });

      const usuarioId =
        resposta?.id ??
        resposta?.usuario?.id;

      if (!usuarioId) {
        throw new Error(
          "A API não retornou o ID do usuário."
        );
      }

      nav("/verificar-telefone", {
        state: {
          usuarioId,
          telefone: telefoneNumerico,
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
            Informe seu nome e telefone para começar.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
                  value={form.nome}
                  onChange={(e) =>
                    handleChange(
                      "nome",
                      e.target.value
                    )
                  }
                  placeholder="Digite seu nome"
                  className="input w-full pl-11"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                  value={form.telefone}
                  onChange={(e) =>
                    handleChange(
                      "telefone",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11)
                    )
                  }
                  placeholder="Digite seu telefone"
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