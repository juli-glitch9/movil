import { useEffect, useState, useCallback } from "react";
import { getComentariosYResenas } from "../services/reseñaService";
import "../style/resenasView.css"; 

const CATEGORIES = [
  { id: null, name: "Todas las Categorías" }, 
  { id: 1, name: "Carnes" },
  { id: 2, name: "Frutas" },
  { id: 5, name: "Lácteos" },
  { id: 7, name: "Verduras" },
];

export default function ReseñasView() {
  const [reseñas, setReseñas] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarReseñas = async () => {
      setLoading(true);
      try {
        const data = await getComentariosYResenas(selectedCategory);
        setReseñas(data);
      } catch (err) {
        console.error("Error al cargar reseñas:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarReseñas();
  }, [selectedCategory]); 

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleEditResena = useCallback((id) => {
    console.log("Editar reseña:", id);
    // Aquí iría la lógica para editar
  }, []);

  const handleDeleteResena = useCallback((id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      console.log("Eliminar reseña:", id);
      // Aquí iría la lógica para eliminar
    }
  }, []);

  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, i) => 
      i < calificacion ? "" : "☆"
    ).join("");
  };

  return (
    <div className="resenas-container">
      <div className="resenas-header">
        <h1> Comentarios y Reseñas de tus Productos</h1>
        <p>Descubre qué opinan nuestros clientes sobre tus productos</p>
      </div>

      <div className="category-filters-wrapper">
        <span className="category-filters-label">Categorías:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id || 'all'} 
            onClick={() => handleCategoryChange(cat.id)}
            className={`category-filter-btn ${cat.id === selectedCategory ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando reseñas...</span>
        </div>
      ) : (
        <>
          {reseñas.length > 0 ? (
            <div className="resenas-grid">
              {reseñas.map((r) => (
                <div key={r.id_comentario} className="resena-card"> 
                  <div className="resena-image-container">
                    <img 
                      src={r.url_imagen} 
                      alt={r.nombre_producto} 
                      className="resena-image"
                    />
                  </div>
                  
                  <div className="resena-content">
                    <h3 className="resena-product-name">{r.nombre_producto}</h3>
                    
                    <div className="resena-rating">
                      <span className="resena-rating-stars">
                        {renderStars(r.calificacion)}
                      </span>
                      <span className="resena-rating-text">
                        {r.calificacion}/5
                      </span>
                    </div>

                    <span className="resena-client-badge">
                        {r.nombre_cliente}
                    </span>

                    <div className="resena-comment">
                      "{r.comentario}"
                    </div>

                    <div className="resena-footer">
                      <span className="resena-date">
                        {new Date(r.fecha_comentario).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="empty-container">
              <div className="empty-icon"></div>
              <p>No tienes reseñas aún para la categoría seleccionada.</p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                Intenta seleccionar otra categoría
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}