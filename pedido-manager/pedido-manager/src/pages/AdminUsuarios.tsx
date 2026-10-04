import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, Usuario } from "../lib/api";

const funcoes = [
  { valor: "cliente", nome: "Cliente" },
  { valor: "atendente", nome: "Atendente" },
  { valor: "cozinheiro", nome: "Cozinheiro" },
  { valor: "entregador", nome: "Entregador" },
  { valor: "dono", nome: "Dono" },
];

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [alterando, setAlterando] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    try {
      setLoading(true);
      setErro("");
      const resultado = await api.listarUsuarios();
      setUsuarios(resultado);
    } catch (error: any) {
      setErro(error?.message || "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function alterarStatus(id: number) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario || usuario.admin) return;

    const acao = usuario.ativo ? "desativar" : "ativar";

    if (!window.confirm(`Tem certeza que deseja ${acao} a conta de ${usuario.nome}?`)) {
      return;
    }

    try {
      setAlterando(id);
      setErro("");
      setMensagem("");

      const atualizado = await api.alterarStatusUsuario(id);

      setUsuarios((estado) =>
        estado.map((item) =>
          item.id === id ? { ...item, ...atualizado } : item
        )
      );

      setMensagem(
        `Conta de ${usuario.nome} ${
          atualizado.ativo ? "ativada" : "desativada"
        } com sucesso.`
      );
    } catch (error: any) {
      setErro(error?.message || "Não foi possível alterar o status da conta.");
    } finally {
      setAlterando(null);
    }
  }

  async function salvarUsuario(usuario: Usuario) {
    if (!usuario.id) return;

    try {
      setAlterando(usuario.id);
      setErro("");
      setMensagem("");

      const atualizado = await api.alterarFuncaoUsuario(
        usuario.id,
        usuario.funcao || "cliente",
        Boolean(usuario.admin)
      );

      setUsuarios((estado) =>
        estado.map((item) =>
          item.id === usuario.id ? { ...item, ...atualizado } : item
        )
      );

      setMensagem(`Usuário ${usuario.nome} atualizado com sucesso.`);
    } catch (error: any) {
      setErro(error?.message || "Não foi possível atualizar o usuário.");
    } finally {
      setAlterando(null);
    }
  }

  function alterarUsuarioLocal(
    id: number,
    campo: "funcao" | "admin",
    valor: string | boolean
  ) {
    setUsuarios((estado) =>
      estado.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    );
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busca.toLowerCase();

    return (
      String(usuario.id).includes(texto) ||
      usuario.nome?.toLowerCase().includes(texto) ||
      String(usuario.telefone).includes(texto) ||
      usuario.email?.toLowerCase().includes(texto) ||
      usuario.funcao?.toLowerCase().includes(texto)
    );
  });

  function nomeFuncao(funcao?: string | null) {
    return funcoes.find((item) => item.valor === funcao)?.nome || "Cliente";
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administração
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Usuários
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie funções e administradores do sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarUsuarios}
          disabled={loading}
          className="btn-secondary !px-3"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {mensagem && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{mensagem}</span>
        </div>
      )}

      <div className="card mt-7 overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />

            <input
              className="input pl-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar usuário..."
            />
          </div>

          <p className="mt-3 text-sm text-slate-500">
            {usuariosFiltrados.length} usuário(s)
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
            <Loader2 size={22} className="animate-spin" />
            Carregando usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <User size={40} className="mx-auto text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              Nenhum usuário encontrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {usuariosFiltrados.map((usuario) => {
              const id = Number(usuario.id);
              const ativo = Boolean(usuario.ativo);
              const admin = Boolean(usuario.admin);

              return (
                <div key={id} className="p-5">
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-bold text-slate-900">
                          {usuario.nome}
                        </h2>

                        <span
                          className={
                            ativo
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                          }
                        >
                          {ativo ? "Ativo" : "Inativo"}
                        </span>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {nomeFuncao(usuario.funcao)}
                        </span>

                        {admin && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                            Administrador do sistema
                          </span>
                        )}
                      </div>

                      <div className="mt-2 grid gap-1 text-sm text-slate-500 md:grid-cols-3">
                        <span>ID: {usuario.id}</span>
                        <span>Telefone: {usuario.telefone}</span>
                        <span className="truncate">
                          E-mail: {usuario.email || "Não informado"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Função
                        </label>

                        <select
                          className="input disabled:cursor-not-allowed disabled:opacity-50"
                          value={usuario.funcao || "cliente"}
                          disabled={admin}
                          onChange={(e) =>
                            alterarUsuarioLocal(
                              id,
                              "funcao",
                              e.target.value
                            )
                          }
                        >
                          {funcoes.map((funcao) => (
                            <option
                              key={funcao.valor}
                              value={funcao.valor}
                            >
                              {funcao.nome}
                            </option>
                          ))}
                        </select>

                        {admin && (
                          <p className="mt-1 text-xs text-slate-400">
                            Administrador do sistema.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Administrador do sistema
                        </label>

                        <select
                          className="input"
                          value={admin ? "sim" : "nao"}
                          onChange={(e) =>
                            alterarUsuarioLocal(
                              id,
                              "admin",
                              e.target.value === "sim"
                            )
                          }
                        >
                          <option value="nao">Não</option>
                          <option value="sim">Sim</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-end gap-2">
                        <button
                          type="button"
                          onClick={() => salvarUsuario(usuario)}
                          disabled={alterando === id}
                          className="btn-primary"
                        >
                          {alterando === id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                          Salvar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/usuarios/${id}`)
                          }
                          className="btn-secondary"
                        >
                          <Eye size={17} />
                          Perfil
                        </button>

                        <button
                          type="button"
                          onClick={() => alterarStatus(id)}
                          disabled={alterando === id || admin}
                          className={
                            ativo
                              ? "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              : "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          }
                        >
                          {alterando === id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : ativo ? (
                            <XCircle size={17} />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}

                          {ativo ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}