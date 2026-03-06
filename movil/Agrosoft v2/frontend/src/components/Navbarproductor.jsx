import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser, FaSignOutAlt, FaCog, FaBox, FaStar, FaUserPlus,
  FaSignInAlt, FaUserCircle, FaChartLine, FaGift, FaShoppingBag, FaBars, FaTimes
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbarproductor.css";

function Navbarproductor({ isAuthenticated, user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const effectiveAuth = isAuthenticated || !!user;
  const userImage = user?.imagen || "/images/user.jpg";

  // Cerrar menús al navegar o hacer clic fuera
  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className={`agro-navbar ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="agro-container">
        {/* LOGO */}
        <Link className="agro-brand" to="/">
          <div className="logo-wrapper">
            <img src="/img/1.png" alt="AgroSoft Logo" />
          </div>
          <span className="brand-text">
            Agro<span className="highlight">Soft</span>
          </span>
        </Link>

        {/* HAMBURGER BUTTON (REACT CONTROLLED) */}
        <button 
          className="agro-toggler" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* NAV LINKS & AUTH */}
        <div className={`agro-collapse ${isMenuOpen ? "show" : ""}`}>
          <ul className="agro-nav">
            <li className="agro-item">
              <Link className={`agro-link ${location.pathname === "/AdminView" ? "active" : ""}`} to="/AdminView">
                <FaBox className="link-icon" /> Productos
              </Link>
            </li>
            <li className="agro-item">
              <Link className={`agro-link ${location.pathname === "/AdminView/ordenes" ? "active" : ""}`} to="/AdminView/ordenes">
                <FaShoppingBag className="link-icon" /> Pedidos
              </Link>
            </li>
            <li className="agro-item">
              <Link className={`agro-link ${location.pathname === "/AdminView/finanza" ? "active" : ""}`} to="/AdminView/finanza">
                <FaChartLine className="link-icon" /> Finanzas
              </Link>
            </li>
            <li className="agro-item">
              <Link className={`agro-link ${location.pathname === "/AdminView/ofertas" ? "active" : ""}`} to="/AdminView/ofertas">
                <FaGift className="link-icon" /> Ofertas
              </Link>
            </li>
            <li className="agro-item">
              <Link className={`agro-link ${location.pathname === "/AdminView/resenas" ? "active" : ""}`} to="/AdminView/resenas">
                <FaStar className="link-icon" /> Reseñas
              </Link>
            </li>
          </ul>

          <div className="agro-auth-section">
            {effectiveAuth ? (
              <div className="user-profile-dropdown">
                <button 
                  className="profile-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                >
                  <span className="user-name-desktop">{user?.nombre || "Productor"}</span>
                  {user?.imagen ? (
                    <img src={userImage} alt="Perfil" className="avatar-img" />
                  ) : (
                    <FaUserCircle className="avatar-icon" />
                  )}
                </button>

                {showDropdown && (
                  <div className="agro-dropdown-menu">
                    <div className="dropdown-info">
                      <strong>{user?.nombre}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <hr />
                    <Link className="dropdown-opt" to="/perfil"><FaUser /> Mi Perfil</Link>
                    <Link className="dropdown-opt" to="/configuracion"><FaCog /> Ajustes</Link>
                    <button className="dropdown-opt logout" onClick={handleLogout}>
                      <FaSignOutAlt /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn-login">Ingresar</Link>
                <Link to="/register" className="btn-register">Empezar</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbarproductor;