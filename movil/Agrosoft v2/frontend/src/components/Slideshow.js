import React, { useState, useEffect } from "react";
import "./Slideshow.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import grapesImg from "../assets/grapes-8306833_1280.jpg";
import carrotImg from "../assets/carrot-1565597_1280.jpg";
import applesImg from "../assets/apples-1872997_1280.jpg";

const featuredProducts = [
  { nombre: "Uvas Campesinas", img: grapesImg, productor: "Juan Pérez", precio: "$25.900 x libra" },
  { nombre: "Zanahoria Orgánica", img: carrotImg, productor: "Luis Mendoza", precio: "$3.500 x libra" },
  { nombre: "Manzanas Rojas", img: applesImg, productor: "Carlos Rojas", precio: "$7.999 x kilo" },
];

const Slideshow = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [quantity, setQuantity] = useState(1); 

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) =>
        prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 
    return () => clearInterval(interval);
  }, [currentProductIndex]);

  const prevSlide = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex === 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentProductIndex((prevIndex) =>
      prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleAdd = () => setQuantity((prev) => prev + 1);
  const handleRemove = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const currentProduct = featuredProducts[currentProductIndex];

  return (
    <div className="slideshow-container">
      <div className="slideshow-item">
        <img src={currentProduct.img} alt={currentProduct.nombre} className="slideshow-image" />
        <div className="slideshow-info">
          <h3 className="slideshow-title">{currentProduct.nombre}</h3>
          <p className="slideshow-producer">Productor: {currentProduct.productor}</p>
          <p className="slideshow-price">{currentProduct.precio}</p>
          <div className="slideshow-actions">
            <button className="slideshow-btn-add" onClick={handleAdd}>+</button>
            <span className="slideshow-quantity">{quantity}</span>
            <button className="slideshow-btn-remove" onClick={handleRemove}>-</button>
            <button className="slideshow-btn-cart">Añadir al carrito</button>
          </div>
        </div>
      </div>

      <button className="slideshow-control-prev" onClick={prevSlide}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button className="slideshow-control-next" onClick={nextSlide}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default Slideshow;
