import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaBox,
  FaStar,
  FaUserPlus,
  FaSignInAlt,
  FaUserCircle,
  FaChartLine,
  FaGift,
  FaShoppingBag
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbarproductor.css";

function Navbarproductor({ isAuthenticated, user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Si estamos en AdminView pero isAuthenticated es false, significa que hay user pero props no se pasó correctamente
  // En ese caso, verificamos el localStorage
  const effectiveAuth = isAuthenticated || !!user;

  useEffect(() => {
    // Debug: confirmar montaje y props
    // Abre la consola del navegador para ver este mensaje cuando cargues /AdminView
    console.log(" Navbarproductor mounted", { 
      isAuthenticated, 
      effectiveAuth,
      user, 
      userRole: user?.role,
      userName: user?.nombre,
      pathname: location.pathname
    });
  }, [isAuthenticated, user, location.pathname, effectiveAuth]);

  const userImage = user?.imagen || "/images/user.jpg";

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  return (
    <nav className={"navbar navbar-expand-lg custom-navbar-productor px-3" + (showDropdown ? " dropdown-open" : "")}>
      <Link className="navbar-brand d-flex align-items-center" to="/">
        <img
          src="/img/1.png"
          alt="AgroSoft Logo"
          style={{ width: "50px", height: "50px", marginRight: "8px" }}
        />
        <span className="brand-text">
          Agro<span className="highlight">Soft</span>
        </span>
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto nav-links">
          <li className="nav-item">
            <Link
              className={`nav-link d-flex align-items-center ${location.pathname === "/AdminView" ? "active" : ""}`}
              to="/AdminView"
            >
              <FaBox className="nav-icon me-2" />
              Productos
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link d-flex align-items-center ${location.pathname === "/AdminView/ordenes" ? "active" : ""}`}
              to="/AdminView/ordenes"
            >
              <FaShoppingBag className="nav-icon me-2" />
              Órdenes
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link d-flex align-items-center ${location.pathname === "/AdminView/finanza" ? "active" : ""}`}
              to="/AdminView/finanza"
            >
              <FaChartLine className="nav-icon me-2" />
              Finanzas
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link d-flex align-items-center ${location.pathname === "/AdminView/ofertas" ? "active" : ""}`}
              to="/AdminView/ofertas"
            >
              <FaGift className="nav-icon me-2" />
              Ofertas
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className={`nav-link d-flex align-items-center ${location.pathname === "/AdminView/resenas" ? "active" : ""}`}
              to="/AdminView/resenas"
            >
              <FaStar className="nav-icon me-2" />
              Reseñas
            </Link>
          </li>
        </ul>

        <div className="d-flex align-items-center">
          {effectiveAuth ? (
            <div className="user-dropdown">
              <button
                className="btn user-btn d-flex align-items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                {user?.imagen ? (
                  <img
                    src={userImage}
                    alt="Perfil"
                    className="user-avatar"
                  />
                ) : (
                  <FaUserCircle className="user-avatar-icon" size={28} />
                )}
              </button>

              {showDropdown && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-header">
                    <FaUserCircle size={40} className="mb-2" />
                    <p className="dropdown-username mb-1">
                      Hola, <strong>{user?.nombre || user?.email?.split('@')[0]}</strong>
                    </p>
                    <small className="dropdown-email">{user?.email}</small>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link
                    to="/"
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUser className="me-2" />
                    Mi Perfil
                  </Link>

                  <Link
                    to="/AdminView"
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaBox className="me-2" />
                    Mi Tienda
                  </Link>


                  <Link
                    to="/configuracion"
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaCog className="me-2" />
                    Configuración
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item d-flex align-items-center logout-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons d-flex align-items-center">
              <Link
                to="/login"
                className="nav-link d-flex align-items-center me-3 login-link"
              >
                <FaSignInAlt className="me-2" />
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="nav-link d-flex align-items-center register-link"
              >
                <FaUserPlus className="me-2" />
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbarproductor;
