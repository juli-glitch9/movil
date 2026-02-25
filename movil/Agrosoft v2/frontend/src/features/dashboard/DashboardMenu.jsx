import React from 'react';
import { Link } from 'react-router-dom';
import '../../style/DashboardMenu.css';

export default function DashboardMenu() {
  const menuItems = [
    { title: 'Usuarios', path: 'user', icon: '👥' },
    { title: 'Categorías', path: 'categorias', icon: '🏷️' },
    { title: 'Productos', path: 'productos', icon: '📦' },
    { title: 'Descuentos', path: 'descuentos', icon: '💰' },
    { title: 'Pedidos', path: 'pedidos', icon: '🛒' },
    { title: 'PQRS', path: 'pqrs', icon: '📩' },
    { title: 'Tipos de PQRS', path: 'tipoPqrs', icon: '📋' },
    { title: 'Inventarios', path: 'inventarios', icon: '📊' },
    { title: 'Roles', path: 'roles', icon: '🔐' },
    { title: 'Reportes', path: 'reportes', icon: '📈' },
  ];

  return (
    <div className="dashboard-menu-container">
      <h1>Panel de Administración</h1>
      <div className="dashboard-grid">
        {menuItems.map((item, index) => (
          <Link to={item.path} key={index} className="dashboard-card">
            <div className="card-icon">{item.icon}</div>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
