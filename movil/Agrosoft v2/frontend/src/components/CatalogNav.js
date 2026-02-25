import React from "react";
import "./CatalogNav.css";

const CatalogNav = () => {
  return (
    <div className="catalog-nav">
      <ul className="catalog-nav-list">
        <li className="catalog-nav-item active">Todos</li>
        <li className="catalog-nav-item">Carnes</li>
        <li className="catalog-nav-item">Pollo</li>
        <li className="catalog-nav-item">Verduras</li>
        <li className="catalog-nav-item">Frutas</li>
        <li className="catalog-nav-item">Lácteos</li>
      </ul>
    </div>
  );
};

export default CatalogNav;
