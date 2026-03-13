// src/App.js (VERSIÓN DEFINITIVA)
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CarritoProvider } from './context/CarritoContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import ForgotPassword from "./components/ForgotPassword";

import Catalogo from "./pages/Catalogo.js";
import Home from "./pages/Home.js";
import Blog from "./pages/Blog.js";
import ProductPage from "./pages/ProductPage.js";
import Ofertas from "./pages/Ofertas.jsx";
import Carrito from "./pages/Carrito.js";
import Pedidos from "./pages/Pedidos.js";
import ConfiguracionCliente from "./pages/ConfiguracionCliente.jsx";
import Perfil from "./pages/Perfil";
import MisPqrs from "./pages/MisPqrs.jsx";
import MisResenas from "./pages/MisResenas.jsx";
import ProductorApp from "./productorApp.jsx";
import AdminApp from "./AdminApp.jsx";

import "./App.css";

const AppRoutes = ({ Layout, ProtectedRoute, ProducerGuard }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalogo" element={<ProducerGuard element={<Layout><Catalogo /></Layout>} />} />
        <Route path="/producto/:id" element={<ProducerGuard element={<Layout><ProductPage /></Layout>} />} />
        <Route path="/blog" element={<ProducerGuard element={<Layout><Blog /></Layout>} />} />
        <Route path="/ofertas" element={<ProducerGuard element={<Layout><Ofertas /></Layout>} />} />

        <Route path="/configuracion" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><ConfiguracionCliente /></Layout>} />
          } />
        } />

        <Route path="/perfil" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><Perfil /></Layout>} />
          } />
        } />

        <Route path="/carrito" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><Carrito /></Layout>} />
          } />
        } />

        <Route path="/pedidos" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><Pedidos /></Layout>} />
          } />
        } />

        <Route path="/mis-pqrs" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><MisPqrs /></Layout>} />
          } />
        } />

        <Route path="/mis-resenas" element={
          <ProducerGuard element={
            <ProtectedRoute element={<Layout><MisResenas /></Layout>} />
          } />
        } />

        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />
        } />

        <Route path="/login" element={
          isAuthenticated && user?.role === "productor"
            ? <Navigate to="/AdminView" replace />
            : (isAuthenticated && user?.role === "administrador"
              ? <Navigate to="/admin" replace />
              : (isAuthenticated ? <Navigate to="/" /> : <Login onLogin={() => {}} />))
        } />

        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" /> : <Register onLogin={() => {}} />
        } />

        <Route path="/AdminView/*" element={
          isAuthenticated && user?.role === "productor" ? (
            <ProductorApp
              isAuthenticated={isAuthenticated}
              user={user}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/admin/*" element={
          isAuthenticated && user?.role === "administrador" ? (
            <AdminApp user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const Layout = ({ children }) => (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        showOfertasLink={true}
      />
      <div className="page-content">{children}</div>
      <Footer />
    </>
  );

  const ProtectedRoute = ({ element }) =>
    isAuthenticated ? element : <Navigate to="/login" replace />;

  const ProducerGuard = ({ element }) => {
    if (isAuthenticated && user?.role === "productor") {
      return <Navigate to="/AdminView" replace />;
    }
    return element;
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <CarritoProvider>
        <Router>
          <AppRoutes 
            Layout={Layout}
            ProtectedRoute={ProtectedRoute}
            ProducerGuard={ProducerGuard}
          />
        </Router>
      </CarritoProvider>
    </NotificationProvider>
  );
}

export default App;