import React, { useState } from "react";
import { FaShoppingCart, FaStar, FaLock, FaCheck, FaSpinner, FaUser, FaEnvelope } from "react-icons/fa";
import "./ProductCard.css";

const ProductCard = ({
  id,
  image,
  title,
  description,
  producer_name,
  producer_email,
  price,
  stock,
  available,
  isAuthenticated,
  onAddToCart,
  onWriteReview,
  unidad_medida
}) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated || stock !== "Disponible") return;

    setAddingToCart(true);

    try {
      await onAddToCart(id);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error agregando al carrito:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const isAvailable = stock === "Disponible" && available > 0;

  return (
    <div className="product-card compact">
      <img src={image} alt={title} className="product-card-image" />

      <div className="product-card-info">
        <h3 className="product-card-title">{title}</h3>
        <p className="product-card-description">{description}</p>

        {/* Información del productor - CORREGIDO */}
        {producer_name && producer_name !== 'Productor no disponible' && (
          <div className="product-producer-info">
            <div className="producer-detail">
              <FaUser className="producer-icon" />
              <span className="producer-text">{producer_name}</span>
            </div>
            {producer_email && producer_email !== 'No disponible' && (
              <div className="producer-detail">
                <FaEnvelope className="producer-icon" />
                <span className="producer-text">{producer_email}</span>
              </div>
            )}
          </div>
        )}

        <p className="product-card-price">
          ${typeof price === 'number' ? price.toLocaleString() : price}
          {unidad_medida && <span> / {unidad_medida}</span>}
        </p>

        <div className="stock-info">
          <p className={`product-card-stock ${isAvailable ? "in-stock" : "out-of-stock"}`}>
            {isAvailable ? "Disponible" : "No disponible"}
          </p>
          <p className="product-card-available">
            {isAvailable ? `Disponibles: ${available}` : "Agotado"}
          </p>
        </div>

        <div className="product-card-actions compact">
          {isAuthenticated ? (
            <button
              className={`btn-add-to-cart ${addedToCart ? 'added' : ''} ${!isAvailable ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!isAvailable || addingToCart}
            >
              {addingToCart ? (
                <>
                  <FaSpinner className="icon spinner" />
                  Agregando...
                </>
              ) : addedToCart ? (
                <>
                  <FaCheck className="icon" />
                  ¡Agregado!
                </>
              ) : (
                <>
                  <FaShoppingCart className="icon" />
                  Agregar al Carrito
                </>
              )}
            </button>
          ) : (
            <button
              className="btn-add-to-cart-disabled"
              disabled
              title="Inicia sesión para comprar"
            >
              <FaLock className="icon" />
              Inicia sesión para comprar
            </button>
          )}

          <button
            className={`btn-review ${isAuthenticated ? '' : 'disabled'}`}
            onClick={onWriteReview}
            disabled={!isAuthenticated}
          >
            <FaStar className="icon" />
            {isAuthenticated ? 'Ver producto' : 'Inicia sesión para reseñar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;