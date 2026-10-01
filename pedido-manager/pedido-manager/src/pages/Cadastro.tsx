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

    const telefoneNumerico = Number(
      form.telefone.replace(/\D/g, "")
    );

    if (!telefoneNumerico) {
      setError("Digite um telefone válido.");
      return;
    }

    try {
      await signup({
        nome: form.nome.trim(),
        telefone: telefoneNumerico,
        adm: false,
        ativo: true,
      });

      nav("/dashboard");
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
          <h1 className="text-2xl font-bold">
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
                  value={form.nome}
                  onChange={(e) =>
                    handleChange(
                      "nome",
                      e.target.value
                    )
                  }
                  placeholder="Seu nome"
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
                  inputMode="numeric"
                  required
                  value={form.telefone}
                  onChange={(e) =>
                    handleChange(
                      "telefone",
                      e.target.value
                    )
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
            </label>

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
                  Criar conta
                  <ArrowRight size={17} />
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