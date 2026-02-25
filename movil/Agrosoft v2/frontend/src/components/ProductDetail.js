import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaLeaf, 
  FaShippingFast, 
  FaAward,
  FaShoppingCart,
  FaCheck,
  FaSpinner,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard
} from "react-icons/fa";
import { useCarrito } from "../context/CarritoContext";
import { useNotification } from "../context/NotificationContext";
import "./ProductDetail.css";

const ProductDetail = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();

  const { agregarAlCarrito } = useCarrito();
  const { addNotification } = useNotification();

  if (!product) return <p>No hay datos del producto.</p>;

  const images =
    product.imagenes && product.imagenes.length > 0
      ? product.imagenes
      : [product.url_imagen];

  
  const getProducerInfo = () => {
    console.log('🔍 Datos completos del productor:', {
      producer_name: product.producer_name,
      producer_email: product.producer_email,
      producer_document: product.producer_document,
      producer_location: product.producer_location,
      
    });

    return {
      name: product.producer_name || "Productor no disponible",
      email: product.producer_email || "No disponible",
      document: product.producer_document || "No disponible",
      location: product.producer_location || "Ubicación no especificada",
      
    };
  };

  const producerInfo = getProducerInfo();

  const handlePrev = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleComprar = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      addNotification('Por favor inicia sesión para comprar productos', 'warning');
      navigate("/login");
      return;
    }

    if (user.id_rol !== 1) {
      addNotification('Solo los clientes pueden comprar productos', 'warning');
      return;
    }

    if (product.estado_producto !== "Activo" || (product.cantidad ?? 0) <= 0) {
      addNotification('Este producto no está disponible en este momento', 'warning');
      return;
    }

    setAddingToCart(true);

    try {
      await agregarAlCarrito(product.id_producto, 1);
      setAddedToCart(true);
      addNotification(`¡${product.nombre_producto} agregado al carrito!`, 'success');
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);

    } catch (error) {
      console.error("Error agregando producto al carrito:", error);
      addNotification('Error al agregar el producto al carrito', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIrAlCarrito = () => {
    navigate("/carrito");
  };

  const handleComprarYIrAlCarrito = async () => {
    await handleComprar();
    if (!addingToCart) {
      setTimeout(() => {
        navigate("/carrito");
      }, 1000);
    }
  };

  const isProductAvailable = product.estado_producto === "Activo" && (product.cantidad ?? 0) > 0;

  return (
    <div className="product-details">
      
      <div className="product-details-left">
        <div className="carousel-wrapper">
          {images.length > 1 && (
            <button className="carousel-btn" onClick={handlePrev}>
              <FaChevronLeft />
            </button>
          )}

          <div className="product-carousel">
            <img
              src={images[currentImage]}
              alt={`${product.nombre_producto} ${currentImage + 1}`}
              className="product-detail-image"
            />
          </div>

          {images.length > 1 && (
            <button className="carousel-btn" onClick={handleNext}>
              <FaChevronRight />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="product-thumbnails">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Miniatura ${index + 1}`}
                className={`thumbnail ${currentImage === index ? "active" : ""}`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        )}

        <div className="product-additional-info">
          <div className="quality-features">
            <div className="feature-card">
              <FaLeaf className="feature-icon organic" />
              <h4>Orgánico Certificado</h4>
              <p>100% natural sin químicos</p>
            </div>
            <div className="feature-card">
              <FaShippingFast className="feature-icon shipping" />
              <h4>Envío Rápido</h4>
              <p>Entrega en 24-48h</p>
            </div>
            <div className="feature-card">
              <FaAward className="feature-icon premium" />
              <h4>Calidad Premium</h4>
              <p>Selección especial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="product-details-right">
        <h1>{product.nombre_producto}</h1>
        <p className="product-details-price">
          ${product.precio_unitario?.toLocaleString()} COP / {product.unidad_medida}
        </p>
        <p className="product-details-description">
          {product.descripcion_producto}
        </p>

        <div className="product-meta">
          <p>
            <strong>Estado:</strong>{" "}
            <span className={isProductAvailable ? "text-success" : "text-danger"}>
              {isProductAvailable ? "Disponible" : "Agotado"}
            </span>
          </p>
          <p>
            <strong>Cantidad disponible:</strong> {product.cantidad ?? 0}
          </p>
        </div>

     
        <div className="producer-info">
          <h2>
            <FaUser className="me-2" />
            Información del Productor
          </h2>
          <div className="producer-details">
            <p>
              <FaUser className="me-2" />
              <strong>Nombre:</strong> {producerInfo.name}
            </p>
            <p>
              <FaEnvelope className="me-2" />
              <strong>Email:</strong> {producerInfo.email}
            </p>
            <p>
              <FaMapMarkerAlt className="me-2" />
              <strong>Ubicación:</strong> {producerInfo.location}
            </p>
          </div>
        </div>

        <div className="product-action-buttons">
          <button 
            className={`product-btn-cart ${addedToCart ? 'added' : ''}`}
            onClick={handleComprar}
            disabled={!isProductAvailable || addingToCart}
          >
            {addingToCart ? (
              <>
                <FaSpinner className="spinner" />
                Agregando...
              </>
            ) : addedToCart ? (
              <>
                <FaCheck />
                ¡Agregado!
              </>
            ) : (
              <>
                <FaShoppingCart />
                Agregar al Carrito
              </>
            )}
          </button>
        </div>

        <div className="view-cart-section">
          <button 
            className="btn-view-cart"
            onClick={handleIrAlCarrito}
          >
            <FaShoppingCart />
            Ver Mi Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;