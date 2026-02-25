// src/pages/Catalogo.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import Slideshow2 from "../components/Slideshow2";
import ProductCard from "../components/ProductCard";
import CatalogNav from "../components/CatalogNav";
import SearchBar from "../components/SearchBar";
import { useCarrito } from "../context/CarritoContext";
import { useNotification } from "../context/NotificationContext";
import { api } from "../config/api"; // <-- Usamos la instancia api
import "../style/Catalogo.css";

const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("user");
  const user = isAuthenticated ? JSON.parse(localStorage.getItem("user")) : null;

  const { agregarAlCarrito } = useCarrito();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products"); // <-- URL relativa
        // Detectar la estructura de datos
        const dataArray =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data.products) ? res.data.products :
          Array.isArray(res.data.data) ? res.data.data :
          Array.isArray(res.data.result) ? res.data.result : [];
        setProducts(dataArray);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated || !user) {
      addNotification('Por favor inicia sesión para agregar productos al carrito', 'warning');
      navigate("/login");
      return;
    }

    if (user.id_rol !== 1) {
      addNotification('Solo los clientes pueden agregar productos al carrito', 'warning');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      await agregarAlCarrito(productId, 1);
      const product = products.find(p => p.id_producto === productId);
      addNotification(`¡${product?.nombre_producto} agregado al carrito correctamente!`, 'success');
    } catch (error) {
      console.error("Error agregando al carrito:", error);
      const errorMessage = error.response?.data?.error || error.message || "Error inesperado al agregar al carrito";
      addNotification(errorMessage, 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/producto/${productId}`);
  };

  const filteredProducts = products.filter(product =>
    product.nombre_producto?.toLowerCase().includes(search.toLowerCase()) ||
    product.descripcion_producto?.toLowerCase().includes(search.toLowerCase()) ||
    product.nombre_categoria?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Slideshow2 />
        <div className="catalogo-section-title">
          <h2 className="catalogo-title-animated">Catálogo de productos</h2>
        </div>
        <CatalogNav />
        <SearchBar onSearch={setSearch} />
        <main className="catalogo-container">
          <div className="catalogo-loading">
            <FaShoppingCart className="loading-icon" />
            <p>Cargando productos...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Slideshow2 />
      <div className="catalogo-section-title">
        <h2 className="catalogo-title-animated">Catálogo de productos</h2>
        {isAuthenticated && user?.id_rol === 1 && (
          <p className="catalogo-subtitle">
            Descubre nuestros productos frescos y agrega tus favoritos al carrito
          </p>
        )}
      </div>
      <CatalogNav />
      <SearchBar onSearch={setSearch} />
      <main className="catalogo-container">
        <div className="catalogo-info-bar">
          <span className="catalogo-product-count">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </span>
          {search && <span className="catalogo-search-term">Búsqueda: "{search}"</span>}
        </div>
        <div className="catalogo-products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id_producto}
                id={product.id_producto}
                image={product.url_imagen}
                title={product.nombre_producto}
                description={product.descripcion_producto || "Sin descripción disponible"}
                producer={product.productor || product.nombre_usuario || "Agrosoft"}
                price={product.precio_unitario}
                stock={product.estado_producto === "Activo" && product.cantidad > 0 ? "Disponible" : "Agotado"}
                available={product.cantidad || 0}
                isAuthenticated={isAuthenticated}
                onAddToCart={() => handleAddToCart(product.id_producto)}
                onWriteReview={() => handleViewProduct(product.id_producto)}
                unidad_medida={product.unidad_medida}
                addingToCart={addingToCart[product.id_producto]}
              />
            ))
          ) : (
            <div className="catalogo-no-products">
              <FaShoppingCart size={48} className="no-products-icon" />
              <h3>No se encontraron productos</h3>
              <p>
                {search ? `No hay productos que coincidan con "${search}"` : "No hay productos disponibles en este momento"}
              </p>
              {search && (
                <button className="catalogo-clear-search" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>

        {isAuthenticated && user?.id_rol === 1 && filteredProducts.length > 0 && (
          <div className="catalogo-cart-cta">
            <button className="catalogo-go-to-cart-btn" onClick={() => navigate("/carrito")}>
              <FaShoppingCart />
              Ver mi carrito
            </button>
          </div>
        )}

        <section className="catalogo-volver-container">
          <button className="catalogo-volver-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ marginRight: "8px" }} />
            Volver
          </button>
        </section>
      </main>
    </>
  );
};

export default Catalogo;
