import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { api, Usuario } from "../lib/api";

export default function AdminUsuarioDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const usuarioId = Number(id);

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [alterando, setAlterando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function carregarUsuario() {
    try {
      setLoading(true);
      setErro("");

      const resultado =
        await api.informacaoUsuarioAdmin(
          usuarioId
        );

      setUsuario(resultado);
    } catch (error: any) {
      setErro(
        error?.message ||
          "Não foi possível carregar o perfil."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(usuarioId)) {
      carregarUsuario();
    }
  }, [usuarioId]);

  async function alterarStatus() {
    if (!usuario) {
      return;
    }

    const acao = usuario.ativo
      ? "desativar"
      : "ativar";

    const confirmar = window.confirm(
      `Tem certeza que deseja ${acao} a conta de ${usuario.nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setAlterando(true);
      setErro("");

      const atualizado =
        await api.alterarStatusUsuario(
          usuario.id!
        );

      setUsuario(atualizado);
    } catch (error: any) {
      setErro(
        error?.message ||
          "Não foi possível alterar o status da conta."
      );
    } finally {
      setAlterando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2
          size={24}
          className="animate-spin"
        />

        Carregando perfil...
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/usuarios")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Voltar para usuários
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {erro || "Usuário não encontrado."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() =>
          navigate("/admin/usuarios")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Usuários
      </button>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
                <User size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {usuario.nome}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Usuário #{usuario.id}
                </p>
              </div>
            </div>

            <span
              className={
                usuario.ativo
                  ? "rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                  : "rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
              }
            >
              {usuario.ativo
                ? "Conta ativa"
                : "Conta desativada"}
            </span>
          </div>
        </div>

        {erro && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <User size={18} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                Nome
              </span>
            </div>

            <p className="mt-2 font-semibold text-slate-900">
              {usuario.nome}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Phone size={18} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                Telefone
              </span>
            </div>

            <p className="mt-2 font-semibold text-slate-900">
              {usuario.telefone}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail size={18} />

              <span className="text-xs font-semibold uppercase tracking-wide">
                E-mail
              </span>
            </div>

            <p className="mt-2 font-semibold text-slate-900">
              {usuario.email ||
                "Não informado"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo de conta
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              {usuario.admin
                ? "Administrador"
                : "Usuário"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>

            <p
              className={
                usuario.ativo
                  ? "mt-2 font-semibold text-emerald-600"
                  : "mt-2 font-semibold text-red-600"
              }
            >
              {usuario.ativo
                ? "Ativo"
                : "Inativo"}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 p-6">
          {!usuario.admin && (
            <button
              type="button"
              onClick={alterarStatus}
              disabled={alterando}
              className={
                usuario.ativo
                  ? "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  : "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {alterando ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : usuario.ativo ? (
                <XCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}

              {usuario.ativo
                ? "Desativar conta"
                : "Ativar conta"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}