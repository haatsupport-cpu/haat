import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import { adminRoutes, fallbackRoute, protectedRoutes, publicRoutes } from "./route-groups.jsx";

const renderRoute = (route) => (
  <Route
    key={route.path || "index"}
    index={route.index}
    path={route.path}
    element={route.element}
  />
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route element={<RootLayout />}>
            {publicRoutes.map(renderRoute)}
            {protectedRoutes.map(renderRoute)}
            {adminRoutes.map(renderRoute)}
            {renderRoute(fallbackRoute)}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
