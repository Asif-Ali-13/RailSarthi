import React from "react";
import { Navigate } from "react-router-dom";


interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem("adminToken") !== null;

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
} 