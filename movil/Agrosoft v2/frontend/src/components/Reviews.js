// src/components/Reviews.jsx
import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import "./Review.css";
import { api } from "../config/api"; // <-- Importamos la API dinámica

const Reviews = ({ productId, userId, initialReviews = [], isAuthenticated = false }) => {
  const [reviews, setReviews] = useState(Array.isArray(initialReviews) ? initialReviews : []);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const cargarReviews = async () => {
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      const uid = userId || parsed?.id_usuario || "";
      const query = uid ? `?id_usuario_simulado=${uid}` : "";

      const res = await api.get(`/api/reviews/product/${productId}${query}`);
      const data = res.data;

      if (data.success) {
        setReviews(data.reviews);
      } else {
        console.error("No se pudieron cargar reseñas:", data.message);
      }
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    }
  };

  useEffect(() => {
    if (productId) cargarReviews();
  }, [productId]);

  const handleAddReview = async () => {
    if (!newReview.trim()) return;

    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    const uid = userId || parsed?.id_usuario;

    if (!uid) {
      alert("Debes iniciar sesión para enviar una reseña.");
      return;
    }

    try {
      const res = await api.post("/api/reviews", {
        id_usuario: uid,
        id_producto: productId,
        calificacion: rating,
        texto_comentario: newReview,
      });

      const data = res.data;

      if (data.success) {
        setNewReview("");
        setRating(5);
        cargarReviews();
      } else {
        alert(data.message || "No se pudo enviar la reseña");
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const renderStars = (calificacion) => {
    const stars = [];
    const fullStars = Math.floor(calificacion);
    const hasHalfStar = calificacion % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-icon full" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-icon half" />);
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-icon empty" />);
    }

    return stars;
  };

  return (
    <div className="reviews">
      <h2>Comentarios y Reseñas</h2>

      {reviews.length > 0 ? (
        reviews.map((r) => (
          <div key={r.id_comentario_resena} className="review">
            <div className="review-left">
              <p>
                <strong>{r.autor || r.nombre_usuario || "Anónimo"}:</strong>{" "}
                {r.texto_comentario}
              </p>
            </div>
            <div className="review-right">
              <div className="stars-container">{renderStars(r.calificacion)}</div>
            </div>
          </div>
        ))
      ) : (
        <p>No hay reseñas todavía. ¡Sé el primero en comentar!</p>
      )}

      <div className="review-form">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Escribe tu comentario..."
        />

        <div className="review-controls">
          <div className="rating-select-container">
            <FaStar className="selector-star-icon" />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} estrella{star !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleAddReview}>Enviar</button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
