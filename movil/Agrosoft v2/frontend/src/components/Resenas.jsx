import { useState, useEffect } from "react";
import { obtenerResenas } from "../services/resenaService.js"; 
import "../style/resena.css";

export default function Resenas() {
  const [reseñas, setResenas] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await obtenerResenas();
      setResenas(data);
    }
    fetchData();
  }, []);

  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, i) => (i < calificacion ? "⭐" : "☆")).join("");
  };

  return (
    <div className="contenedorProductos">
      <h2>Reseñas de Clientes</h2>
      <div className="mostrarProductos">
        {reseñas.map((r) => (
          <div key={r.id} className="card p-3 text-center">
            <div className="informacion">
              <p><b>Cliente:</b> {r.cliente}</p>
              <p><b>Producto:</b> {r.producto}</p>
              <p><b>Calificación:</b> {renderStars(r.calificacion)}</p>
              <p><b>Comentario:</b> "{r.comentario}"</p>
              <p><b>Fecha:</b> {r.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}