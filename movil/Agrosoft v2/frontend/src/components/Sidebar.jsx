import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../style/Sidebar.css";
import "../style/global.css";

export default function Sidebar({ onToggle }) {
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => {
    const newState = !open;
    setOpen(newState);
    if (onToggle) onToggle(newState); // avisamos al padre
  };

  return (
    <>
      <button className="hamburger-btn" onClick={toggleSidebar}>
        ☰
      </button>

      <aside className={`sidebar ${open ? "open" : "collapsed"}`}>
        <h2 className="sidebar-title">Admin</h2>

        <div className="logo">
          <img src="/resources/logo.jpg" alt="logo" />
        </div>

        <nav>
          <ul>
            <li><NavLink to="/admin/user">Usuarios</NavLink></li>
            <li><NavLink to="/admin/categorias">Categorías</NavLink></li>
            <li><NavLink to="/admin/productos">Productos</NavLink></li>
            <li><NavLink to="/admin/descuentos">Descuentos</NavLink></li>
            <li><NavLink to="/admin/pedidos">Pedidos</NavLink></li>
            <li><NavLink to="/admin/pqrs">PQRS</NavLink></li>
            <li><NavLink to="/admin/tipoPqrs">Tipos de PQRS</NavLink></li>
            <li><NavLink to="/admin/inventarios">Inventarios</NavLink></li>
            <li><NavLink to="/admin/roles">Roles</NavLink></li>
            <li><NavLink to="/admin/reportes">Reportes</NavLink></li>
          </ul>
        </nav>

        <br />
        <br /><br /><br /><br /><br />
      </aside>
    </>
  );
}
