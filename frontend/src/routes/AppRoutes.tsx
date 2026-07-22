import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { AddVehiclePage } from "../pages/admin/AddVehiclePage";
import { EditVehiclePage } from "../pages/admin/EditVehiclePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute, GuestRoute, AdminRoute } from "../components/common/ProtectedRoute";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Guest Routes (Only accessible when NOT logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected User Routes (Accessible when logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>

          {/* Protected Admin Routes (Accessible ONLY when user.role === 'admin') */}
          <Route element={<AdminRoute />}>
            <Route path="admin/vehicles/new" element={<AddVehiclePage />} />
            <Route path="admin/vehicles/edit/:id" element={<EditVehiclePage />} />
          </Route>

          {/* 404 Page Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
