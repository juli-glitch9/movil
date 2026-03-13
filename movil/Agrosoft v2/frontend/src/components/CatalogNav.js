import React from "react";
import "./CatalogNav.css";

const CatalogNav = ({ selectedCategory, onCategoryChange }) => {
  const categories = ["Todos", "Carnes", "Pollo", "Verduras", "Frutas", "Lácteos"];

  return (
    <div className="catalog-nav">
      <ul className="catalog-nav-list">
        {categories.map(category => (
          <li
            key={category}
            className={`catalog-nav-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CatalogNav;
