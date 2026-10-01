import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Hash,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Phone,
  Plus,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

type UsuarioPerfil = {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: number | null;
  ativo?: boolean | null;
  email_verificado?: boolean | null;
  telefone_verificado?: boolean | null;
};

export default function Perfil() {
  const navigate = useNavigate();

  const [usuario, setUsuario] =
    useState<UsuarioPerfil | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  function pegarIdUsuarioDoToken() {
    const token =
      localStorage.getItem("pedido_token");

    if (!token) {
      throw new Error(
        "Usuário não autenticado."
      );
    }

    try {
      const partes = token.split(".");

      if (partes.length !== 3) {
        throw new Error("Token inválido.");
      }

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
          "Não foi possível identificar o usuário logado."
        );
      }

      return Number(id);
    } catch {
      throw new Error(
        "Token inválido. Faça login novamente."
      );
    }
  }

  async function carregarPerfil() {
    try {
      setCarregando(true);
      setErro("");

      const idUsuario =
        pegarIdUsuarioDoToken();

      const resposta =
        await api.informacaoUsuario(
          idUsuario
        );

      const dados =
        Array.isArray(resposta)
          ? resposta[0]
          : resposta.usuario ?? resposta;

      setUsuario({
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        ativo: dados.ativo,
        email_verificado:
          dados.email_verificado,
        telefone_verificado:
          dados.telefone_verificado,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
        <Loader2
          size={24}
          className="animate-spin"
        />
        Carregando perfil...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {erro}
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="py-20 text-center text-slate-500">
        Usuário não encontrado.
      </div>
    );
  }

  const contaAtiva =
    usuario.ativo !== false;

  const emailReal =
    !!usuario.email &&
    !usuario.email.endsWith(
      "@usuario.local"
    );

  const emailVerificado =
    usuario.email_verificado === true;

  const telefoneVerificado =
    usuario.telefone_verificado === true;

  return (
    <div className="mx-auto max-w-3xl">
      {/* VOLTAR */}
      <button
        type="button"
        onClick={() =>
          navigate("/dashboard")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Voltar ao dashboard
      </button>

      {/* CABEÇALHO */}
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          Conta
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Meu perfil
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consulte e altere suas informações pessoais.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* PERFIL */}
        <div className="flex flex-col items-center gap-4 border-b border-slate-100 bg-slate-50 p-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-white">
            <UserRound size={46} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {usuario.nome}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {emailReal
                ? usuario.email
                : "E-mail não cadastrado"}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* ID */}
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Hash size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                ID do usuário
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {usuario.id}
              </p>
            </div>
          </div>

          {/* TELEFONE */}
          <div className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Phone size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Telefone
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {usuario.telefone ??
                  "Não informado"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {telefoneVerificado ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <ShieldCheck size={15} />
                    Telefone verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                    <XCircle size={15} />
                    Telefone não verificado
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/perfil/alterar-telefone"
                  )
                }
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={15} />
                Alterar telefone
              </button>
            </div>
          </div>

          {/* E-MAIL */}
          <div className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Mail size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                E-mail
              </p>

              {emailReal ? (
                <>
                  <p className="mt-1 break-all font-semibold text-slate-900">
                    {usuario.email}
                  </p>

                  <div className="mt-2">
                    {emailVerificado ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle
                          size={15}
                        />
                        E-mail verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                        <XCircle size={15} />
                        E-mail não verificado
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/perfil/adicionar-email"
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Alterar e-mail
                    </button>

                    {!emailVerificado && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/perfil/adicionar-email"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        <ShieldCheck
                          size={15}
                        />
                        Verificar e-mail
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/perfil/adicionar-email"
                    )
                  }
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <Plus size={16} />
                  Adicionar e-mail
                </button>
              )}
            </div>
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              {contaAtiva ? (
                <CheckCircle size={21} />
              ) : (
                <XCircle size={21} />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status da conta
              </p>

              <p
                className={`mt-1 font-semibold ${
                  contaAtiva
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {contaAtiva
                  ? "Ativa"
                  : "Inativa"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}