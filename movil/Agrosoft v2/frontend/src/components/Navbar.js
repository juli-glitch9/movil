import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaHome,
  FaShoppingBag,
  FaBlog,
  FaTag,
  FaBox,
  FaUser,
  FaUserCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus
} from "react-icons/fa";
import "./Navbar.css";
import "./Navbarproductor.css";
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

  // 🔹 cerrar con ESC
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && closeAll();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  // 🔹 carrito
  useEffect(() => {
    if (!isAuthenticated || !isCliente) {
      setCartCount(0);
      return;
    }

    api
      .get(`/api/carrito/numero-items/${user.id_usuario}`)
      .then((res) => {
        if (res.data?.success) {
          const value = res.data.data?.total_items ?? res.data.data ?? 0;
          setCartCount(typeof value === 'object' ? (value.total_items ?? 0) : value);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, isCliente, user]);

  const logout = () => {
    onLogout();
    closeAll();
    navigate("/");
  };

  return (
    <>
      {/* OVERLAY */}
      {menuOpen && <div className="nav-overlay" onClick={closeAll} />}

      <nav className={"navbar navbar-expand-lg custom-navbar-productor px-0" + (userOpen ? " dropdown-open" : "")}>
        {/* BRAND - estilo Navbarproductor */}
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeAll}>
          <img
            src="/img/1.png"
            alt="AgroSoft Logo"
            style={{ width: "50px", height: "50px", marginRight: "8px" }}
          />
          <span className="brand-text">
            Agro<span className="highlight">Soft</span>
          </span>
        </Link>

        {/* DESKTOP LINKS (estructura como Navbarproductor) */}
        <ul className="navbar-nav me-auto nav-links">
          <li className="nav-item">
            <Link className={`nav-link d-flex align-items-center ${location.pathname === "/" ? "active" : ""}`} to="/">
              <FaHome className="nav-icon me-2" />
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link d-flex align-items-center ${location.pathname === "/catalogo" ? "active" : ""}`} to="/catalogo">
              <FaShoppingBag className="nav-icon me-2" />
              Catálogo
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link d-flex align-items-center ${location.pathname === "/blog" ? "active" : ""}`} to="/blog">
              <FaBlog className="nav-icon me-2" />
              Blog
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link d-flex align-items-center ${location.pathname === "/ofertas" ? "active" : ""}`} to="/ofertas">
              <FaTag className="nav-icon me-2" />
              Ofertas
            </Link>
          </li>
          {isAuthenticated && isCliente && (
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center ${location.pathname === "/pedidos" ? "active" : ""}`} to="/pedidos">
                <FaBox className="nav-icon me-2" />
                Mis pedidos
              </Link>
            </li>
          )}
        </ul>

        {/* RIGHT */}
        <div className="d-flex align-items-center">
          {isAuthenticated && isCliente && (
            <Link to="/carrito" className="cart-btn me-3">
              <FaShoppingCart />
              {cartCount > 0 && <span>{cartCount}</span>}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="user-dropdown">
              <button
                className="btn user-btn d-flex align-items-center"
                onClick={(e) => { e.stopPropagation(); setUserOpen(!userOpen); }}
              >
                {user?.imagen ? (
                  <img src={user.imagen} alt="Perfil" className="user-avatar" />
                ) : (
                  <FaUserCircle className="user-avatar-icon" size={28} />
                )}
              </button>

              {userOpen && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-header">
                    <FaUserCircle
                      size={40}
                      className="mb-2 dropdown-close"
                      role="button"
                      tabIndex={0}
                      onClick={() => setUserOpen(false)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setUserOpen(false); } }}
                      aria-label="Cerrar menú"
                    />
                    <p className="dropdown-username mb-1">
                      Hola, <strong>{user?.nombre || user?.email?.split('@')[0]}</strong>
                    </p>
                    <small className="dropdown-email">{user?.email}</small>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link
                    to="/perfil"
                    className="dropdown-item d-flex align-items-center"
                    onClick={closeAll}
                  >
                    <FaUser className="me-2" />
                    Perfil
                  </Link>

                  <Link
                    to="/pedidos"
                    className="dropdown-item d-flex align-items-center"
                    onClick={closeAll}
                  >
                    <FaBox className="me-2" />
                    Pedidos
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item d-flex align-items-center logout-btn"
                    onClick={logout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links d-flex align-items-center">
              <Link to="/login" className="nav-link d-flex align-items-center me-3"><FaSignInAlt className="me-2"/> Iniciar Sesión</Link>
              <Link to="/register" className="nav-link d-flex align-items-center register-link"><FaUserPlus className="me-2"/> Registrarse</Link>
            </div>
          )}

          {/* HAMBURGUESA */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavMobile to="/" text="Home" close={closeAll} />
        <NavMobile to="/catalogo" text="Catálogo" close={closeAll} />
        <NavMobile to="/blog" text="Blog" close={closeAll} />
        <NavMobile to="/ofertas" text="Ofertas" close={closeAll} />
        {isAuthenticated && isCliente && (
          <NavMobile to="/pedidos" text="Mis pedidos" close={closeAll} />
        )}
        {!isAuthenticated && (
          <>
            <NavMobile to="/login" text="Login" close={closeAll} />
            <NavMobile to="/register" text="Registro" close={closeAll} />
          </>
        )}
      </div>
    </>
  );
};

const NavMobile = ({ to, text, close }) => (
  <Link to={to} className="mobile-link" onClick={close}>
    {text}
  </Link>
);

export default Navbar;
