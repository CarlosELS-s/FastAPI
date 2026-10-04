import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  api,
  Login,
  Usuario,
} from "../lib/api";

type CadastroResponse = {
  message?: string;
  id?: number;
  nome?: string;
  email?: string | null;
  telefone?: number;
  admin?: boolean;
  telefone_verificado?: boolean;
};

type LoginResponse = {
  senha_obrigatoria?: boolean;
  verificacao_necessaria?: boolean;
  usuario_id?: number;
  telefone?: number;
};

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  isAdmin: boolean;

  login: (
    data: Login
  ) => Promise<LoginResponse>;

  signup: (
    data: Usuario
  ) => Promise<CadastroResponse>;

  logout: () => void;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

function extractToken(
  data: any
): string | null {
  return (
    data?.access_token ??
    data?.token ??
    data?.accessToken ??
    null
  );
}

function verificarAdmin(
  token: string | null
): boolean {
  if (!token) {
    return false;
  }

  try {
    const partes = token.split(".");

    if (partes.length !== 3) {
      return false;
    }

    const payload = JSON.parse(
      atob(
        partes[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    return (
      payload.admin === true ||
      payload.admin === "true"
    );
  } catch {
    return false;
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        "pedido_token"
      )
    );

  const [loading, setLoading] =
    useState(false);

  const isAdmin =
    verificarAdmin(token);

  async function login(
    data: Login
  ): Promise<LoginResponse> {
    setLoading(true);

    try {
      const resultado =
        await api.login(data);

      if (
        resultado?.senha_obrigatoria &&
        !resultado?.access_token
      ) {
        return {
          senha_obrigatoria: true,
        };
      }

      if (
        resultado?.verificacao_necessaria
      ) {
        return {
          verificacao_necessaria: true,
          usuario_id:
            resultado.usuario_id,
          telefone:
            resultado.telefone,
        };
      }

      const novoToken =
        extractToken(resultado);

      if (!novoToken) {
        throw new Error(
          "A API não retornou o access_token."
        );
      }

      localStorage.setItem(
        "pedido_token",
        novoToken
      );

      setToken(novoToken);

      return {};
    } finally {
      setLoading(false);
    }
  }

  async function signup(
    data: Usuario
  ): Promise<CadastroResponse> {
    setLoading(true);

    try {
      const resposta =
        await api.criarConta(data);

      if (data.senha) {
        await login({
          nome: data.nome,
          telefone: data.telefone,
          senha: data.senha,
        });
      }

      return resposta;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "pedido_token"
    );

    setToken(null);
  }

  const value =
    useMemo(
      () => ({
        token,
        loading,
        isAdmin,
        login,
        signup,
        logout,
      }),
      [
        token,
        loading,
        isAdmin,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto =
    useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider"
    );
  }

  return contexto;
}