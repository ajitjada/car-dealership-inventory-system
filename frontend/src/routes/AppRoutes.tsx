import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<div className="text-gray-600">Initial Setup Ready</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
