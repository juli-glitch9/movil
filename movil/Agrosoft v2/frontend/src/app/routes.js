import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import DashboardMenu from "../features/dashboard/DashboardMenu";
import "../style/AdminHeader.css";
import PageUser from "../features/dashboard/user/pages/PageUser";
import PageCategoria from "../features/dashboard/categorias/pages/PageCategoria";
import PageProductos from "../features/dashboard/productos/pages/PageProductos";
import PagePqrs from "../features/dashboard/pqrs/pages/pagePqrs";
import PageTipoPqrs from "../features/dashboard/tipoPqrs/pages/pageTipoPqrs";
import PageRoles from "../features/dashboard/roles/pages/PageRoles";
import PageInventarios from "../features/dashboard/inventarios/pages/PageInventarios";
import PagePedido from "../features/dashboard/pedidos/pages/PagePedido";
import PageReportes from "../features/dashboard/reportes/pages/PageReportes";
import PageDescuentos from "../features/dashboard/descuentos/pages/PageDescuentos";

export default function AppRoutes({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="admin-wrapper" style={{ display: "flex" }}>
      <Sidebar onToggle={setSidebarOpen} />

      {/* Ajusta el margen dinámicamente */}
      <main className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="admin-top-bar">
          <div className="admin-header-title">
            <img 
              src="/resources/admin_logo_new.png" 
              alt="AgroSoft Admin" 
              className="admin-logo-img"
            />
          </div>
          <div className="admin-header-actions" ref={menuRef}>
            <button 
              className="admin-profile-icon-btn" 
              onClick={() => setMenuOpen(!menuOpen)}
              title="Opciones de usuario"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>

            {menuOpen && (
              <div className="admin-dropdown-menu">
                <Link to="/admin" className="admin-dropdown-item" onClick={() => setMenuOpen(false)}>
                  <span>🏠</span> Menú Principal
                </Link>
                <button onClick={() => { setMenuOpen(false); onLogout(); }} className="admin-dropdown-item logout-item">
                  <span>🚪</span> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        <Routes>
          {/* Rutas relativas; el contenedor decide el prefijo (p.ej., /admin/*) */}
          <Route index element={<DashboardMenu />} />
          <Route path="user" element={<PageUser />} />
          <Route path="categorias" element={<PageCategoria />} />
          <Route path="productos" element={<PageProductos />} />
          <Route path="pqrs" element={<PagePqrs />} />
          <Route path="tipoPqrs" element={<PageTipoPqrs />} />
          <Route path="inventarios" element={<PageInventarios />} />
          <Route path="pedidos" element={<PagePedido />} />
          <Route path="reportes" element={<PageReportes />} />
          <Route path="roles" element={<PageRoles />} />
          <Route path="descuentos" element={<PageDescuentos />} />

          {/* Catch-all dentro del dashboard admin */}
          <Route path="*" element={<Navigate to="user" replace />} />
        </Routes>
      </main>
    </div>
  );
}
