// src/pages/ConfiguracionCliente.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import "./ConfiguracionCliente.css";

// Iconos
import {
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiGift,
  FiStar,
  FiShoppingBag,
  FiClock,
  FiTruck,
  FiMessageSquare,
  FiRotateCcw,
  FiHeart,
  FiEye,
  FiBell,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiSettings,
  FiShield,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiAward
} from "react-icons/fi";

const ConfiguracionCliente = () => {
  const { user, logout } = useContext(AuthContext);
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [stats, setStats] = useState({
    cupones: 0,
    puntos: 0,
    cartera: 0,
    pedidosRecientes: []
  });
  const [loading, setLoading] = useState(false);

  // Cargar estadísticas del usuario
  useEffect(() => {
    if (user?.id_usuario) {
      cargarEstadisticas();
    }
  }, [user]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      // Simulación - reemplazar con tu API real
      // const response = await api.get(`/api/usuarios/${user.id_usuario}/estadisticas`);
      
      // Datos de ejemplo mientras tanto
      setStats({
        cupones: user?.cupones || 3,
        puntos: user?.puntos || 250,
        cartera: user?.cartera || 50000,
        pedidosRecientes: []
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addNotification("Sesión cerrada correctamente", "success");
      navigate("/login");
    } catch (error) {
      addNotification("Error al cerrar sesión", "error");
    }
  };

  const menuItems = [
    {
      titulo: "Mi Cuenta",
      icono: FiUser,
      items: [
        { to: "/perfil", label: "Mi Perfil", icon: FiUser },
        { to: "/direcciones", label: "Direcciones", icon: FiMapPin },
        { to: "/metodos-pago", label: "Métodos de Pago", icon: FiCreditCard }
      ]
    },
    {
      titulo: "Mis Beneficios",
      icono: FiAward,
      items: [
        { to: "/cupones", label: "Mis Cupones", icon: FiGift, valor: stats.cupones },
        { to: "/puntos", label: "Mis Puntos", icon: FiStar, valor: stats.puntos },
        { to: "/cartera", label: "Mi Cartera", icon: FiGift, valor: `$${stats.cartera.toLocaleString()}` }
      ]
    },
    {
      titulo: "Mis Pedidos",
      icono: FiPackage,
      items: [
        { to: "/pedidos/todos", label: "Todos los Pedidos", icon: FiShoppingBag },
        { to: "/pedidos/proceso", label: "En Proceso", icon: FiClock },
        { to: "/pedidos/enviados", label: "Enviados", icon: FiTruck },
        { to: "/pedidos/completados", label: "Completados", icon: FiRotateCcw }
      ]
    },
    {
      titulo: "Soporte",
      icono: FiHelpCircle,
      items: [
        { to: "/pqrs", label: "Mis PQRS", icon: FiFileText },
        { to: "/notificaciones", label: "Notificaciones", icon: FiBell },
        { to: "/ayuda", label: "Centro de Ayuda", icon: FiHelpCircle }
      ]
    }
  ];

  const userImage = user?.foto_perfil || user?.foto || user?.avatarUrl;
  const iniciales = (user?.nombre || user?.nombre_usuario || "U")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="config-container">
      {/* Header */}
      <div className="config-header">
        <button className="config-back-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Configuración de Cuenta</h1>
      </div>

      <div className="config-grid">
        {/* Sidebar - Perfil */}
        <aside className="config-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {userImage ? (
                <img src={userImage} alt={user?.nombre} />
              ) : (
                <div className="avatar-iniciales">{iniciales}</div>
              )}
            </div>
            <h3>{user?.nombre || user?.nombre_usuario}</h3>
            <p className="profile-email">{user?.email || user?.correo_electronico}</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <FiGift />
                <div>
                  <span className="stat-value">{stats.cupones}</span>
                  <span className="stat-label">Cupones</span>
                </div>
              </div>
              <div className="stat-item">
                <FiStar />
                <div>
                  <span className="stat-value">{stats.puntos}</span>
                  <span className="stat-label">Puntos</span>
                </div>
              </div>
              <div className="stat-item">
                <FiGift />
                <div>
                  <span className="stat-value">${stats.cartera.toLocaleString()}</span>
                  <span className="stat-label">Cartera</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-editar-perfil"
              onClick={() => navigate("/perfil/editar")}
            >
              <FiSettings /> Editar Perfil
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="config-nav">
            {menuItems.map((seccion, idx) => (
              <div key={idx} className="nav-seccion">
                <h4 className="seccion-titulo">
                  <seccion.icono /> {seccion.titulo}
                </h4>
                <ul className="seccion-links">
                  {seccion.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.to}
                        className={`nav-link ${currentPath === item.to ? "active" : ""}`}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                        {item.valor && <span className="link-badge">{item.valor}</span>}
                        <FiChevronRight className="link-arrow" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut /> Cerrar Sesión
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="config-main">
          <div className="welcome-card">
            <h2>¡Hola, {user?.nombre || user?.nombre_usuario}!</h2>
            <p>Bienvenido a tu centro de configuración. Aquí puedes administrar todos los aspectos de tu cuenta.</p>
          </div>

          <div className="quick-actions">
            <h3>Acciones Rápidas</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={() => navigate("/pedidos/nuevo")}>
                <FiShoppingBag />
                <span>Nuevo Pedido</span>
              </button>
              <button className="action-card" onClick={() => navigate("/pqrs/nuevo")}>
                <FiFileText />
                <span>Crear PQRS</span>
              </button>
              <button className="action-card" onClick={() => navigate("/recargar")}>
                <FiCreditCard />
                <span>Recargar Cartera</span>
              </button>
              <button className="action-card" onClick={() => navigate("/cupones/canjear")}>
                <FiGift />
                <span>Canjear Cupón</span>
              </button>
            </div>
          </div>

          {/* Pedidos recientes */}
          <div className="recent-orders">
            <div className="section-header">
              <h3>Pedidos Recientes</h3>
              <Link to="/pedidos/todos" className="ver-todos">Ver todos →</Link>
            </div>

            {stats.pedidosRecientes.length > 0 ? (
              <div className="orders-list">
                {stats.pedidosRecientes.map((pedido, idx) => (
                  <div key={idx} className="order-item">
                    {/* Renderizar pedidos */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiPackage size={48} />
                <p>No tienes pedidos recientes</p>
                <button className="btn-primary" onClick={() => navigate("/catalogo")}>
                  Explorar Productos
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Panel lateral derecho */}
        <aside className="config-rightbar">
          <div className="info-card">
            <h4>Soporte Rápido</h4>
            <p>¿Necesitas ayuda? Estamos aquí para ti</p>
            <button className="btn-soporte" onClick={() => navigate("/ayuda")}>
              <FiHelpCircle /> Centro de Ayuda
            </button>
            <button className="btn-soporte" onClick={() => navigate("/pqrs/nuevo")}>
              <FiFileText /> Crear PQRS
            </button>
          </div>

          <div className="info-card">
            <h4>Próximos Vencimientos</h4>
            <div className="vencimiento-item">
              <span>Cupón BIENVENIDA10</span>
              <span className="vencimiento-badge">Expira en 5 días</span>
            </div>
            <div className="vencimiento-item">
              <span>Puntos por vencer</span>
              <span className="vencimiento-badge">150 puntos</span>
            </div>
          </div>

          <div className="info-card">
            <h4>Recomendado para ti</h4>
            <p>Productos que podrían interesarte basados en tus compras</p>
            <Link to="/catalogo" className="btn-outline">Ver Catálogo</Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ConfiguracionCliente;