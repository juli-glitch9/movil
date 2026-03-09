import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaShoppingCart, FaHome, FaShoppingBag,
  FaBlog, FaTag, FaBox, FaCog, FaQuestionCircle, FaUser,
  FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus
} from "react-icons/fa";
import "./Navbar.css";
import { api } from "../config/api";

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const isCliente = user?.id_rol === 1;

  const closeAll = () => {
    setMenuOpen(false);
    setUserOpen(false);
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && closeAll();
    const handleClickOutside = (e) => {
      const userDropdown = document.querySelector(".user-dropdown");
      const mobileMenu = document.querySelector(".mobile-menu");
      if (userDropdown && !userDropdown.contains(e.target) && userOpen) setUserOpen(false);
      if (mobileMenu && !mobileMenu.contains(e.target) && menuOpen && !userDropdown?.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userOpen, menuOpen]);

  useEffect(() => {
    if (!isAuthenticated || !isCliente) {
      setCartCount(0);
      return;
    }
    api.get(`/api/carrito/numero-items/${user.id_usuario}`)
      .then((res) => {
        if (res.data?.success) {
          const value = res.data.data?.total_items ?? res.data.data ?? 0;
          setCartCount(typeof value === 'object' ? (value.total_items ?? 0) : value);
        }
      }).catch(() => {});
  }, [isAuthenticated, isCliente, user]);

  const logout = () => {
    onLogout();
    closeAll();
    navigate("/");
  };

  return (
    <>
      {menuOpen && <div className="nav-overlay" onClick={closeAll} />}

      <nav className={`navbar custom-navbar-productor px-3 ${userOpen ? "dropdown-open" : ""}`}>
        {/* BRAND */}
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeAll}>
          <img src="/img/1.png" alt="Logo" className="nav-logo" />
          <span className="brand-text">Agro<span className="highlight">Soft</span></span>
        </Link>

        {/* DESKTOP NAV (Oculto en móvil) */}
        <ul className="navbar-nav d-none d-lg-flex flex-row nav-links me-auto">
          <NavItem to="/" icon={<FaHome />} text="Home" active={location.pathname === "/"} />
          <NavItem to="/catalogo" icon={<FaShoppingBag />} text="Catálogo" active={location.pathname === "/catalogo"} />
          <NavItem to="/blog" icon={<FaBlog />} text="Blog" active={location.pathname === "/blog"} />
          <NavItem to="/ofertas" icon={<FaTag />} text="Ofertas" active={location.pathname === "/ofertas"} />
        </ul>

        {/* CONTENEDOR DERECHO */}
        <div className="d-flex align-items-center">
          {isAuthenticated && isCliente && (
            <Link to="/carrito" className="cart-btn me-3">
              <FaShoppingCart />
              {cartCount > 0 && <span>{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="user-dropdown">
              <button className="btn user-btn" onClick={(e) => { e.stopPropagation(); setUserOpen(!userOpen); }}>
                {user?.imagen ? <img src={user.imagen} alt="Perfil" className="user-avatar" /> : <FaUserCircle className="user-avatar-icon" size={28} />}
              </button>
              {userOpen && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-header">
                    <p className="dropdown-username">Hola, <strong>{user?.nombre || "Usuario"}</strong></p>
                    <small className="dropdown-email">{user?.email}</small>
                  </div>
                  <div className="dropdown-divider"></div>
                  <DropdownItem to="/perfil" icon={<FaUser />} text="Perfil" onClick={closeAll} />
                  <DropdownItem to="/pedidos" icon={<FaBox />} text="Pedidos" onClick={closeAll} />
                  <DropdownItem to="/configuracion" icon={<FaCog />} text="Configuración" onClick={closeAll} />
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={logout}><FaSignOutAlt className="me-2" /> Cerrar Sesión</button>
                </div>
              )}
            </div>
          ) : (
            /* FIX: Usamos d-none d-lg-flex para que desaparezcan totalmente en móvil */
            <div className="auth-links d-none d-lg-flex align-items-center">
              <Link to="/login" className="nav-link me-3"><FaSignInAlt className="me-2"/> Iniciar Sesión</Link>
              <Link to="/register" className="nav-link register-link"><FaUserPlus className="me-2"/> Registrarse</Link>
            </div>
          )}

          {/* HAMBURGUESA (Siempre visible en móvil) */}
          <button className="hamburger ms-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU (Aquí es donde sí deben aparecer los links de auth en móvil) */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavMobile to="/" text="Home" close={closeAll} />
        <NavMobile to="/catalogo" text="Catálogo" close={closeAll} />
        <NavMobile to="/blog" text="Blog" close={closeAll} />
        <NavMobile to="/ofertas" text="Ofertas" close={closeAll} />
        {!isAuthenticated ? (
          <>
            <div className="dropdown-divider mx-3"></div>
            <NavMobile to="/login" text="Iniciar Sesión" close={closeAll} />
            <NavMobile to="/register" text="Registrarse" close={closeAll} />
          </>
        ) : (
          <>
            <NavMobile to="/pedidos" text="Mis pedidos" close={closeAll} />
            <NavMobile to="/mis-pqrs" text="Mis PQRS" close={closeAll} />
          </>
        )}
      </div>
    </>
  );
};

// Helpers para mantener el código limpio
const NavItem = ({ to, icon, text, active }) => (
  <li className="nav-item">
    <Link className={`nav-link d-flex align-items-center ${active ? "active" : ""}`} to={to}>
      {React.cloneElement(icon, { className: "nav-icon me-2" })} {text}
    </Link>
  </li>
);

const DropdownItem = ({ to, icon, text, onClick }) => (
  <Link to={to} className="dropdown-item d-flex align-items-center" onClick={onClick}>
    {React.cloneElement(icon, { className: "me-2" })} {text}
  </Link>
);

const NavMobile = ({ to, text, close }) => (
  <Link to={to} className="mobile-link" onClick={close}>{text}</Link>
);

export default Navbar;