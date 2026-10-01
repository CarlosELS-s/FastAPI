import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { api } from "../lib/api";

type ProdutoTamanho = {
  id: number;
  tamanho: string;
  preco: number;
  estoque: number;
};

type Produto = {
  id: number;
  nome: string;
  categoria: string;
  descricao?: string | null;
  imagem?: string | null;
  disponivel: boolean;
  tamanhos: ProdutoTamanho[];
};

type NovoTamanho = {
  tamanho: string;
  preco: string;
  estoque: string;
};

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoPreco, setSalvandoPreco] = useState<number | null>(null);
  const [salvandoEstoque, setSalvandoEstoque] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [criando, setCriando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [disponivel, setDisponivel] = useState(true);

  const [tamanhos, setTamanhos] = useState<NovoTamanho[]>([
    {
      tamanho: "",
      preco: "",
      estoque: "",
    },
  ]);

  const [precos, setPrecos] = useState<Record<number, string>>({});
  const [estoques, setEstoques] = useState<Record<number, string>>({});

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await api.listarTodosProdutos();

      setProdutos(resposta);

      const novosPrecos: Record<number, string> = {};
      const novosEstoques: Record<number, string> = {};

      resposta.forEach((produto: Produto) => {
        produto.tamanhos.forEach((tamanho) => {
          novosPrecos[tamanho.id] = String(tamanho.preco);
          novosEstoques[tamanho.id] = String(tamanho.estoque);
        });
      });

      setPrecos(novosPrecos);
      setEstoques(novosEstoques);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar os produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function abrirFormulario() {
    setErro("");
    setMensagem("");
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setNome("");
    setCategoria("");
    setDescricao("");
    setDisponivel(true);
    setTamanhos([
      {
        tamanho: "",
        preco: "",
        estoque: "",
      },
    ]);
  }

  function adicionarTamanho() {
    setTamanhos([
      ...tamanhos,
      {
        tamanho: "",
        preco: "",
        estoque: "",
      },
    ]);
  }

  function removerTamanho(index: number) {
    if (tamanhos.length === 1) {
      return;
    }

    setTamanhos(
      tamanhos.filter(
        (_, indice) => indice !== index
      )
    );
  }

  function alterarTamanho(index: number, campo: keyof NovoTamanho, valor: string) {
    setTamanhos(
      tamanhos.map((item, indice) =>
        indice === index
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  async function criarNovoProduto() {
    setErro("");
    setMensagem("");

    if (!nome.trim()) {
      setErro("Digite o nome do produto.");
      return;
    }

    if (!categoria.trim()) {
      setErro("Digite a categoria do produto.");
      return;
    }

    for (const tamanho of tamanhos) {
      if (!tamanho.tamanho.trim()) {
        setErro("Preencha o nome de todos os tamanhos.");
        return;
      }

      const preco = Number(
        tamanho.preco.replace(",", ".")
      );

      const estoque = Number(tamanho.estoque);

      if (Number.isNaN(preco) || preco < 0) {
        setErro("Digite preços válidos.");
        return;
      }

      if (!Number.isInteger(estoque) || estoque < 0) {
        setErro("Digite estoques válidos.");
        return;
      }
    }

    try {
      setCriando(true);

      await api.criarProduto({
        nome: nome.trim(),
        categoria: categoria.trim(),
        descricao: descricao.trim() || null,
        imagem: null,
        disponivel,
        tamanhos: tamanhos.map((item) => ({
          tamanho: item.tamanho.trim(),
          preco: Number(
            item.preco.replace(",", ".")
          ),
          estoque: Number(item.estoque),
        })),
      });

      fecharFormulario();
      setMensagem("Produto criado com sucesso.");
      await carregarProdutos();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar o produto.");
    } finally {
      setCriando(false);
    }
  }

  function atualizarPreco(id: number, valor: string) {
    setPrecos((estado) => ({
      ...estado,
      [id]: valor,
    }));
  }

  function atualizarEstoque(id: number, valor: string) {
    setEstoques((estado) => ({
      ...estado,
      [id]: valor,
    }));
  }

  async function salvarPreco(tamanho: ProdutoTamanho) {
    const valor = Number(
      String(precos[tamanho.id] ?? "").replace(",", ".")
    );

    if (Number.isNaN(valor)) {
      setErro("Digite um preço válido.");
      return;
    }

    if (valor < 0) {
      setErro("O preço não pode ser negativo.");
      return;
    }

    try {
      setSalvandoPreco(tamanho.id);
      setErro("");
      setMensagem("");

      await api.alterarPrecoProduto(
        tamanho.id,
        valor
      );

      setProdutos(
        produtos.map((produto) => ({
          ...produto,
          tamanhos: produto.tamanhos.map(
            (item) =>
              item.id === tamanho.id
                ? {
                    ...item,
                    preco: valor,
                  }
                : item
          ),
        }))
      );

      setMensagem("Preço alterado com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível alterar o preço.");
    } finally {
      setSalvandoPreco(null);
    }
  }

  async function salvarEstoque(tamanho: ProdutoTamanho) {
    const valor = Number(
      estoques[tamanho.id] ?? ""
    );

    if (!Number.isInteger(valor)) {
      setErro("Digite um estoque válido.");
      return;
    }

    if (valor < 0) {
      setErro("O estoque não pode ser negativo.");
      return;
    }

    try {
      setSalvandoEstoque(tamanho.id);
      setErro("");
      setMensagem("");

      await api.alterarEstoqueProduto(
        tamanho.id,
        valor
      );

      setProdutos(
        produtos.map((produto) => ({
          ...produto,
          tamanhos: produto.tamanhos.map(
            (item) =>
              item.id === tamanho.id
                ? {
                    ...item,
                    estoque: valor,
                  }
                : item
          ),
        }))
      );

      setMensagem("Estoque alterado com sucesso.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível alterar o estoque.");
    } finally {
      setSalvandoEstoque(null);
    }
  }

  async function alterarDisponibilidade(produto: Produto) {
    try {
      setErro("");
      setMensagem("");

      await api.alterarDisponibilidadeProduto(
        produto.id
      );

      setProdutos(
        produtos.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                disponivel:
                  !item.disponivel,
              }
            : item
        )
      );

      setMensagem(
        produto.disponivel
          ? `${produto.nome} ficou indisponível.`
          : `${produto.nome} ficou disponível.`
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível alterar a disponibilidade.");
    }
  }

  async function removerProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Tem certeza que deseja remover "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setRemovendo(produto.id);
      setErro("");
      setMensagem("");

      await api.removerProduto(produto.id);

      setProdutos(
        produtos.filter(
          (item) => item.id !== produto.id
        )
      );

      setMensagem(
        `${produto.nome} foi removido com sucesso.`
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível remover o produto.");
    } finally {
      setRemovendo(null);
    }
  }

  function formatarValor(valor: number) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={21}
              className="text-slate-600"
            />

            <p className="text-sm font-medium text-slate-500">
              Administração
            </p>
          </div>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Produtos
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie produtos, preços, estoque e disponibilidade.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirFormulario}
            className="btn-primary"
          >
            <Plus size={17} />
            Adicionar produto
          </button>

          <button
            type="button"
            onClick={carregarProdutos}
            disabled={carregando}
            className="btn-secondary"
          >
            <RefreshCw
              size={17}
              className={
                carregando
                  ? "animate-spin"
                  : ""
              }
            />
            Atualizar
          </button>
        </div>
      </div>

      {erro && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {mensagem}
        </div>
      )}

      {mostrarFormulario && (
        <div className="card mt-7 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Novo produto
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre o produto e seus tamanhos.
              </p>
            </div>

            <button
              type="button"
              onClick={fecharFormulario}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nome
              </span>

              <input
                className="input"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Ex.: Calabresa"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Categoria
              </span>

              <input
                className="input"
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                placeholder="Ex.: Pizza"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Descrição
              </span>

              <input
                className="input"
                value={descricao}
                onChange={(e) =>
                  setDescricao(e.target.value)
                }
                placeholder="Descrição do produto"
              />
            </label>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Tamanhos
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Informe preço e estoque de cada tamanho.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={adicionarTamanho}
                  className="btn-secondary !px-3 !py-2"
                >
                  <Plus size={16} />
                  Tamanho
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {tamanhos.map(
                  (tamanho, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <input
                        className="input"
                        value={tamanho.tamanho}
                        onChange={(e) =>
                          alterarTamanho(
                            index,
                            "tamanho",
                            e.target.value
                          )
                        }
                        placeholder="Tamanho"
                      />

                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tamanho.preco}
                        onChange={(e) =>
                          alterarTamanho(
                            index,
                            "preco",
                            e.target.value
                          )
                        }
                        placeholder="Preço"
                      />

                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        value={tamanho.estoque}
                        onChange={(e) =>
                          alterarTamanho(
                            index,
                            "estoque",
                            e.target.value
                          )
                        }
                        placeholder="Estoque"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removerTamanho(
                            index
                          )
                        }
                        disabled={
                          tamanhos.length === 1
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={disponivel}
                onChange={(e) =>
                  setDisponivel(
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Produto disponível para venda
              </span>
            </label>

            <div className="flex justify-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={fecharFormulario}
                className="btn-secondary"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={criarNovoProduto}
                disabled={criando}
                className="btn-primary"
              >
                {criando ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={17} />
                )}

                {criando
                  ? "Criando..."
                  : "Criar produto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {carregando ? (
        <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm text-slate-500">
          <Loader2
            size={24}
            className="animate-spin"
          />
          Carregando produtos...
        </div>
      ) : produtos.length === 0 ? (
        <div className="card mt-7 p-10 text-center">
          <Package
            size={40}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 font-medium text-slate-800">
            Nenhum produto cadastrado
          </p>

          <button
            type="button"
            onClick={abrirFormulario}
            className="btn-primary mx-auto mt-4"
          >
            <Plus size={17} />
            Adicionar primeiro produto
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-5">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="card overflow-hidden"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {produto.nome}
                    </h2>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {produto.categoria}
                    </span>

                    {produto.disponivel ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={14} />
                        Disponível
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        <XCircle size={14} />
                        Indisponível
                      </span>
                    )}
                  </div>

                  {produto.descricao && (
                    <p className="mt-1 text-sm text-slate-500">
                      {produto.descricao}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      alterarDisponibilidade(
                        produto
                      )
                    }
                    className={
                      produto.disponivel
                        ? "btn-secondary"
                        : "btn-primary"
                    }
                  >
                    {produto.disponivel
                      ? "Desativar"
                      : "Ativar"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removerProduto(
                        produto
                      )
                    }
                    disabled={
                      removendo ===
                      produto.id
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removendo ===
                    produto.id ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}

                    Remover
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {produto.tamanhos.map(
                  (tamanho) => (
                    <div
                      key={tamanho.id}
                      className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr_1fr]"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {tamanho.tamanho}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Preço atual:{" "}
                          {formatarValor(
                            tamanho.preco
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Alterar preço
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              precos[
                                tamanho.id
                              ] ?? ""
                            }
                            onChange={(e) =>
                              atualizarPreco(
                                tamanho.id,
                                e.target.value
                              )
                            }
                            className="input"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              salvarPreco(
                                tamanho
                              )
                            }
                            disabled={
                              salvandoPreco ===
                              tamanho.id
                            }
                            className="btn-primary"
                          >
                            {salvandoPreco ===
                            tamanho.id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={17} />
                            )}

                            Salvar
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Alterar estoque
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              estoques[
                                tamanho.id
                              ] ?? ""
                            }
                            onChange={(e) =>
                              atualizarEstoque(
                                tamanho.id,
                                e.target.value
                              )
                            }
                            className="input"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              salvarEstoque(
                                tamanho
                              )
                            }
                            disabled={
                              salvandoEstoque ===
                              tamanho.id
                            }
                            className="btn-primary"
                          >
                            {salvandoEstoque ===
                            tamanho.id ? (
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={17} />
                            )}

                            Salvar
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Estoque atual:{" "}
                          {tamanho.estoque}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}