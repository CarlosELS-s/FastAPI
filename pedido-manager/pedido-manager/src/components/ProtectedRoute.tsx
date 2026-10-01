import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("pedido_token");

  if (!token || token.trim() === "") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}