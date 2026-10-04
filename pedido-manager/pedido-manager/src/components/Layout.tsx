import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  X,
  CheckCircle2,
  User,
  History,
  Users,
  Package,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function obterFuncao() {
  const token = localStorage.getItem("pedido_token");
  if (!token) return "";

  try {
    const parte = token.split(".")[1];
    if (!parte) return "";
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const preenchido = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(preenchido));
    return String(payload?.funcao || "").toLowerCase();
  } catch {
    return "";
  }
}

const estiloLink = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export default function Layout() {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const funcao = obterFuncao();

  function fecharMenu() {
    setMenuAberto(false);
  }

  function sair() {
    logout();
    navigate("/login");
  }

  const linksBase = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/pedidos",
      label: "Pedidos",
      icon: ClipboardList,
    },
    {
      to: "/historico",
      label: "Histórico",
      icon: History,
    },
  ];

  let linksVisiveis = [...linksBase];

  if (isAdmin) {
    linksVisiveis = [
      ...linksBase,
      {
        to: "/admin/dashboard",
        label: "Dashboard administrativo",
        icon: ShieldCheck,
      },
      {
        to: "/admin/produtos",
        label: "Produtos",
        icon: Package,
      },
      {
        to: "/admin/usuarios",
        label: "Usuários",
        icon: Users,
      },
      {
        to: "/admin/pedidos",
        label: "Todos os pedidos",
        icon: ShieldCheck,
      },
      {
        to: "/admin/cozinha",
        label: "Cozinha",
        icon: CheckCircle2,
      },
      {
        to: "/admin/pedidos-prontos",
        label: "Pedidos prontos",
        icon: CheckCircle2,
      },
      {
        to: "/admin/pedidos-em-entrega",
        label: "Pedidos em entrega",
        icon: Truck,
      },
    ];
  } else if (funcao === "dono") {
    linksVisiveis = [
      ...linksBase,
      {
        to: "/admin/produtos",
        label: "Produtos",
        icon: Package,
      },
      {
        to: "/admin/pedidos",
        label: "Todos os pedidos",
        icon: ShieldCheck,
      },
      {
        to: "/admin/cozinha",
        label: "Cozinha",
        icon: CheckCircle2,
      },
      {
        to: "/admin/pedidos-prontos",
        label: "Pedidos prontos",
        icon: CheckCircle2,
      },
      {
        to: "/admin/pedidos-em-entrega",
        label: "Pedidos em entrega",
        icon: Truck,
      },
    ];
  } else if (funcao === "cozinheiro") {
    linksVisiveis = [
      ...linksBase,
      {
        to: "/admin/cozinha",
        label: "Cozinha",
        icon: CheckCircle2,
      },
    ];
  } else if (funcao === "entregador") {
    linksVisiveis = [
      ...linksBase,
      {
        to: "/admin/pedidos-prontos",
        label: "Pedidos prontos",
        icon: CheckCircle2,
      },
      {
        to: "/admin/pedidos-em-entrega",
        label: "Pedidos em entrega",
        icon: Truck,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="font-bold text-slate-900"
          >
            PedidoManager
          </button>

          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-xl font-black tracking-tight text-slate-900"
            >
              PedidoManager
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {linksVisiveis.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={estiloLink}
                >
                  <Icon size={19} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <User size={19} />
              Meu perfil
            </button>

            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={19} />
              Sair
            </button>
          </div>
        </aside>

        {menuAberto && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
              onClick={fecharMenu}
            />

            <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl lg:hidden">
              <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
                <button
                  type="button"
                  onClick={() => {
                    fecharMenu();
                    navigate("/dashboard");
                  }}
                  className="text-xl font-black tracking-tight text-slate-900"
                >
                  PedidoManager
                </button>

                <button
                  type="button"
                  onClick={fecharMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X size={21} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {linksVisiveis.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={fecharMenu}
                      className={estiloLink}
                    >
                      <Icon size={19} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => {
                    fecharMenu();
                    navigate("/perfil");
                  }}
                  className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  <User size={19} />
                  Meu perfil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fecharMenu();
                    sair();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={19} />
                  Sair
                </button>
              </div>
            </aside>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <header className="hidden h-20 items-center justify-end border-b border-slate-200 bg-white px-8 lg:flex">
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                <User size={18} />
              </div>
              <span>Meu perfil</span>
            </button>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}