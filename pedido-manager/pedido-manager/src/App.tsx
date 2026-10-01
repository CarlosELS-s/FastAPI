import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import PedidosProntos from "./pages/PedidosProntos";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import NovoPedido from "./pages/NovoPedido";
import PedidoDetalhe from "./pages/PedidoDetalhe";
import AdminPedidos from "./pages/AdminPedidos";
import Cozinha from "./pages/Cozinha";
import Pagamento from "./pages/Pagamento";
import Perfil from "./pages/Perfil";
import AdicionarEmail from "./pages/AdicionarEmail";
import EnderecoEntrega from "./pages/EnderecoEntrega";
import PedidosEmEntrega from "./pages/PedidosEmEntrega";
import PedidoEmEntregaDetalhe from "./pages/PedidoEmEntregaDetalhe";
import HistoricoPedidos from "./pages/HistoricoPedidos";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProdutos from "./pages/AdminProdutos";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminUsuarioDetalhe from "./pages/AdminUsuarioDetalhe";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Páginas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard */}
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route
              path="/admin/usuarios"
              element={<AdminUsuarios />}
            />

            <Route
              path="/admin/usuarios/:id"
              element={<AdminUsuarioDetalhe />}
            />
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
              />
              <Route
                path="/admin/produtos"
                element={<AdminProdutos />}
              />
              <Route
                  path="/historico"
                  element={<HistoricoPedidos />}
                />
              <Route
                path="/admin/pedidos-em-entrega"
                element={<PedidosEmEntrega />}
              />

              <Route
                path="/admin/pedidos-em-entrega/:id"
                element={<PedidoEmEntregaDetalhe />}
              />
              <Route
              path="/perfil/adicionar-email"
              element={<AdicionarEmail />}
            />
            <Route
            path="/pedido/:id/endereco"
            element={<EnderecoEntrega />}
          />
              <Route
                path="/admin/pedidos-prontos"
                element={<PedidosProntos />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              {/* Pedidos */}
              <Route
                path="/pedidos"
                element={<Pedidos />}
              />

              <Route
                path="/pedidos/novo"
                element={<NovoPedido />}
              />

              {/* Rota alternativa antiga */}
              <Route
                path="/novo-pedido"
                element={<NovoPedido />}
              />

              {/* Detalhes do pedido */}
              <Route
                path="/pedido/:id"
                element={<PedidoDetalhe />}
              />

              {/* Compatibilidade com links usando /pedidos */}
              <Route
                path="/pedidos/:id"
                element={<PedidoDetalhe />}
              />

              {/* Pagamento */}
              <Route
                path="/pedido/:id/pagamento"
                element={<Pagamento />}
              />

              {/* Perfil */}
              <Route
                path="/perfil"
                element={<Perfil />}
              />

              {/* Área administrativa */}
              <Route
                path="/admin/pedidos"
                element={<AdminPedidos />}
              />

              <Route
                path="/admin/cozinha"
                element={<Cozinha />}
              />
            </Route>
          </Route>

          {/* Qualquer endereço inválido volta para o login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}