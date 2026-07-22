import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/auth.service";

export const ProtectedRoute: React.FC = () => {
  const token = authService.getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const GuestRoute: React.FC = () => {
  const token = authService.getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const AdminRoute: React.FC = () => {
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
