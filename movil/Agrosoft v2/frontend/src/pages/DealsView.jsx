import { useState, useEffect, useCallback, useRef } from "react";
import {
  getDeals,
  createNewOferta,
  deletePromocion,
  updatePromocion,
  getProducerProductsApi,
} from "../services/dealService";
import "../style/ofertasPro.css";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const DEFAULT_IMAGE = "https://via.placeholder.com/150/f0f0f0?text=Producto";

// Normalizador de estados robusto: Elimina espacios, normaliza mayúsculas/minúsculas
const normalizeStatus = (status) => {
  if (!status) return "Pendiente";
  const s = String(status).trim();
  if (s.length === 0) return "Pendiente";
  // Capitalizar la primera letra y el resto minúscula (Ej: "APROBADO" -> "Aprobado")
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const getStatusStyle = (s) => {
  const status = normalizeStatus(s);
  switch (status) {
    case "Aprobado": return "status-Aprobado";
    case "Pendiente": return "status-Pendiente";
    case "Rechazado": return "status-Rechazado";
    case "Eliminada": return "status-Eliminada";
    default: return "status-Pendiente";
  }
};

const getLoggedUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    return u?.id_usuario ?? u?.id ?? null;
  } catch {
    return null;
  }
};


// ... OfferEditModal y OfferCreationForm (sin cambios) ...

function OfferEditModal({ deal, products, onClose, onUpdated }) {
    const isDiscount = deal.tipo_deal === "Descuento";
    const [formData, setFormData] = useState({
      idProducto: deal.id_producto || products[0]?.id_producto || "",
      nombre: deal.nombre || "",
      descripcion: deal.descripcion || "",
      porcentaje: deal.porcentaje_descuento || (isDiscount ? 10 : 0),
      fechaInicio: deal.fecha_inicio || getTodayDate(),
      fechaFin: deal.fecha_fin || getTodayDate(),
      estado: deal.estado || "Pendiente",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);
  
    useEffect(() => {
      setFormData({
        idProducto: deal.id_producto || products[0]?.id_producto || "",
        nombre: deal.nombre || "",
        descripcion: deal.descripcion || "",
        porcentaje: deal.porcentaje_descuento || (isDiscount ? 10 : 0),
        fechaInicio: deal.fecha_inicio || getTodayDate(),
        fechaFin: deal.fecha_fin || getTodayDate(),
        estado: deal.estado || "Pendiente",
      });
    }, [deal, products, isDiscount]);
  
    const handleChange = (e) =>
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setMsg(null);
      setIsLoading(true);
      const payload = {
        ...formData,
        nombre: isDiscount ? `Descuento ${formData.porcentaje}%` : formData.nombre,
        porcentaje: isDiscount ? parseFloat(formData.porcentaje) : undefined,
        idPromocion: deal.id_promocion,
        tipo: deal.tipo_deal,
      };
  
      try {
        await updatePromocion(payload);
        setMsg(" Promoción actualizada correctamente");
        onUpdated();
        setTimeout(onClose, 1000);
      } catch (err) {
        setMsg(` ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>
            Editar {deal.tipo_deal}: {deal.producto}
          </h3>
          <form className="edit-form form-grid" onSubmit={handleSubmit}>
            <div className="form-input-group">
              <label>Producto</label>
              <select className="form-select" name="idProducto" value={formData.idProducto} disabled>
                {products.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre_producto}
                  </option>
                ))}
              </select>
            </div>
  
            {isDiscount ? (
              <div className="form-input-group">
                <label>% Descuento</label>
                <input
                  className="form-input"
                  name="porcentaje"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.porcentaje}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <div className="form-input-group">
                <label>Nombre oferta</label>
                <input
                  className="form-input"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
            )}
  
            <div className="form-input-group full-width">
              <label>Descripción</label>
              <textarea
                className="form-input"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>
  
            <div className="form-input-group">
              <label>Fecha inicio</label>
              <input
                className="form-input"
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
              />
            </div>
  
            <div className="form-input-group">
              <label>Fecha fin</label>
              <input
                className="form-input"
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
              />
            </div>
  
            <div className="form-input-group">
              <label>Estado</label>
              <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
  
            {msg && <p className="form-info full-width">{msg}</p>}
  
            <div className="modal-actions full-width">
              <button type="button" className="btn btn-ghost btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  
function OfferCreationForm({ products, onOfferCreated }) {
    const [formData, setFormData] = useState({
      idProducto: products[0]?.id_producto || "",
      porcentaje: 10,
      fechaInicio: getTodayDate(),
      fechaFin: getTodayDate(),
    });
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!formData.idProducto && products.length > 0) {
        setFormData((prev) => ({ ...prev, idProducto: products[0].id_producto }));
      }
    }, [products, formData.idProducto]);
  
    const handleChange = (e) =>
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setMsg(null);
      setLoading(true);
      try {
        await createNewOferta(formData);
        setMsg(" Promoción enviada correctamente (Pendiente)");
        onOfferCreated();
      } catch (err) {
        setMsg(` ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    if (products.length === 0)
      return <p>No tienes productos para crear promociones.</p>;
  
    return (
      <div className="creation-form">
        <h3>Crear Promoción</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-input-group">
            <label>Producto</label>
            <select
              className="form-select"
              name="idProducto"
              value={formData.idProducto}
              onChange={handleChange}
            >
            {products.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre_producto} (${p.precio_unitario})
              </option>
            ))}
          </select>
          </div>
  
          <div className="form-input-group">
            <label>% Descuento</label>
            <input
              className="form-input"
              type="number"
              name="porcentaje"
              min="1"
              max="99"
              value={formData.porcentaje}
              onChange={handleChange}
            />
          </div>
  
          <div className="form-input-group">
            <label>Fecha inicio</label>
            <input
              className="form-input"
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
            />
          </div>
  
          <div className="form-input-group">
            <label>Fecha fin</label>
            <input
              className="form-input"
              type="date"
              name="fechaFin"
              min={formData.fechaInicio}
              value={formData.fechaFin}
              onChange={handleChange}
            />
          </div>
  
          <div className="form-submit-group full-width">
            <button type="submit" className="btn btn-primary btn-create" disabled={loading}>
              {loading ? "Enviando..." : "Crear promoción"}
            </button>
          </div>
          {msg && <p className="form-info">{msg}</p>}
        </form>
      </div>
    );
  }

export default function DealsView() {
  const [deals, setDeals] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dealToEdit, setDealToEdit] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});
  const initialDefaultsSetRef = useRef(false);
  

  const idProductor = getLoggedUserId();

  const cargarProductos = useCallback(async () => {
    try {
      const data = await getProducerProductsApi(idProductor);
      setProductos(data);
    } catch {
      setMensaje("Error cargando productos del productor.");
    }
  }, [idProductor]);

  const cargarDeals = useCallback(async () => {
    try {
      // Traer todas las promociones (incluyendo eliminadas) para poder calcular counts
      const allData = await getDeals(idProductor, true);

      // Calcular conteos por estado (usar 'Pendiente' por defecto cuando sea null)
      const counts = allData.reduce((acc, d) => {
        const st = normalizeStatus(d.estado).toLowerCase();
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      }, {});
      // Añadir conteo para 'eliminada' (si no existe, será 0)
      counts.eliminada = counts.eliminada || 0; 
      setStatusCounts(counts);

      // Determinar filtro por defecto según prioridad solo la primera vez: Aprobado > Pendiente > Rechazado
      if (!initialDefaultsSetRef.current) {
        if (counts.aprobado > 0) setFilterStatus('aprobado');
        else if (counts.pendiente > 0) setFilterStatus('pendiente');
        else if (counts.rechazado > 0) setFilterStatus('rechazado');
        else setFilterStatus('todos');
        initialDefaultsSetRef.current = true;
      }

      // Filtrar en cliente: ocultar 'eliminada' a menos que showDeleted sea true
      const visible = showDeleted
        ? allData
        : allData.filter((d) => normalizeStatus(d.estado).toLowerCase() !== 'eliminada');

      setDeals(visible);
      // setMensaje(visible.length === 0 ? "No tienes promociones registradas." : null); // Este mensaje se manejará mejor en el render
    } catch {
      setMensaje("Error cargando promociones.");
    } finally {
      setLoading(false);
    }
  }, [idProductor, showDeleted]);

  useEffect(() => {
    if (idProductor) {
      cargarProductos();
      cargarDeals();
    } else {
      setMensaje("Debes iniciar sesión como productor.");
      setLoading(false);
    }
  }, [idProductor, cargarProductos, cargarDeals]);

  const handleOfferCreation = () => cargarDeals();
  const handleEditClick = (deal) => setDealToEdit(deal);

  const filteredDeals = deals.filter((deal) => {
    // Normalizar estado nulo a 'Pendiente'
    const dealStatus = normalizeStatus(deal.estado).toLowerCase();
    
    // Si 'showDeleted' es true, deals ya contiene las eliminadas.
    // Si 'filterStatus' es 'todos', muestra todos los visibles (incluyendo eliminadas si showDeleted es true).
    if (filterStatus === "todos") {
        return true; 
    }
    
    // Si el filtro es por estado específico, debe coincidir con el estado de la promoción.
    return dealStatus === filterStatus.toLowerCase();
  });

  const handleDeletePromocion = async (idPromocion, tipo) => {
    // Nota: El backend debe cambiar el estado a 'Eliminada', no borrar el registro.
    if (!window.confirm("¿Estás seguro de que quieres eliminar/ocultar esta promoción?")) return;
    try {
      // Asumiendo que deletePromocion establece el estado a 'Eliminada'
      await deletePromocion(idPromocion, tipo.toLowerCase()); 
      setMensaje("Promoción marcada como eliminada correctamente.");
      cargarDeals(); // Recargar datos para actualizar la vista
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };


  // **NUEVA LÓGICA DE MENSAJE DE ESTADO**
  const renderMessage = () => {
    if (mensaje) return <div className="message-alert">{mensaje}</div>;
    
    if (loading) return null; // No mostrar nada si está cargando
    
    if (deals.length === 0) {
      return <div className="message-alert">No tienes promociones registradas.</div>;
    }

    if (filteredDeals.length === 0) {
        // Obtenemos el nombre del estado para mostrar en el mensaje
        const statusName = filterStatus === 'eliminada' ? 'Eliminadas' : 
                         filterStatus === 'aprobado' ? 'Aprobadas' : 
                         filterStatus === 'pendiente' ? 'Pendientes' : 
                         filterStatus === 'rechazado' ? 'Rechazadas' : 'con ese estado';

        return (
          <div className="no-results">
            <div className="no-results-card">
              <div className="no-results-icon">✓</div>
              <h3>No hay promociones {statusName.toLowerCase()}</h3>
              <p>
                Actualmente no existen promociones {statusName.toLowerCase()} para este productor.
                Puedes crear una nueva promoción desde el panel de creación.
              </p>
            </div>
          </div>
        );
    }
    
    return null;
  };
  // -------------------------------------


  // Ajuste en el botón de eliminadas para que use 'eliminada' como estado de filtro
  const handleToggleDeleted = () => {
      // Si estamos a punto de MOSTRAR eliminadas
      if (!showDeleted) {
          // Si el filtro actual es 'eliminada', significa que lo ocultamos previamente, volvemos a mostrar solo eliminadas
          if (filterStatus === 'eliminada') {
              setShowDeleted(true);
          } else {
              // Si no estábamos en el filtro 'eliminada', mantenemos el filtro actual, pero mostramos todas las deals (incluyendo eliminadas)
              setShowDeleted(true);
          }
      } else {
          // Si estamos a punto de OCULTAR eliminadas, volvemos al estado 'todos' si estábamos en 'eliminadas'
          if (filterStatus === 'eliminada') {
              setFilterStatus('todos'); // Volver a mostrar todo lo no eliminado
          }
          setShowDeleted(false);
      }
  };

  // Configuración de pestañas
  const tabs = [
    { key: "todos", label: "Todas", count: deals.length },
    { key: "aprobado", label: "Aprobadas", count: statusCounts.aprobado || 0 },
    { key: "pendiente", label: "Pendientes", count: statusCounts.pendiente || 0 },
    { key: "rechazado", label: "Rechazadas", count: statusCounts.rechazado || 0 },
    { key: "eliminada", label: "Eliminadas", count: statusCounts.eliminada || 0 },
  ];

  return (
    <div className="deals-container">
      <div className="deals-header">
        <h2>Promociones del Productor</h2>
        <div className="filter-buttons">
            {tabs.map(tab => (
                <button 
                    key={tab.key}
                    className={`filter-btn ${filterStatus === tab.key ? `active-${tab.key === 'todos' ? 'all' : (tab.key === 'pendiente' ? 'pendiente' : (tab.key === 'rechazado' ? 'rechazado' : (tab.key === 'eliminada' ? 'eliminada' : 'aprobado')))}` : ''}`}
                    onClick={() => setFilterStatus(tab.key)}
                >
                    {tab.label} ({tab.count})
                </button>
            ))}

          {/* El botón de 'Ver/Ocultar Eliminadas' ahora controla solo la lista base (deals) */}
          {/* El filtro 'eliminada' controla qué se muestra en la lista filtrada (filteredDeals) */}
          { (statusCounts.eliminada || 0) > 0 && (
            <label className="toggle-deleted-label">
              <input 
                type="checkbox"
                checked={showDeleted}
                onChange={handleToggleDeleted}
              />
              {showDeleted ? "Ocultar Eliminadas" : "Ver Eliminadas"}
            </label>
          )}

        </div>
      </div>

      {renderMessage()} {/* Uso del nuevo renderMessage */}

      <OfferCreationForm products={productos} onOfferCreated={handleOfferCreation} />
      
      {/* Solo mostrar el conteo si hay deals filtradas */}
      {filteredDeals.length > 0 && (
          <div className="deals-count">
              Mostrando {filteredDeals.length} de {deals.length} promociones
          </div>
      )}

      {loading && <p>Cargando...</p>}
      
      {/* Solo renderizar la cuadrícula si hay deals filtradas */}
      {filteredDeals.length > 0 && (
          <div className="deals-grid">
              {filteredDeals.map((deal) => {
                  const descuento = deal.porcentaje_descuento
                      ? deal.porcentaje_descuento / 100
                      : 0;
                  const precioFinal = (deal.precio_original * (1 - descuento)).toFixed(2);
                  const isDiscount = deal.tipo_deal === "Descuento";
                  const statusStyle = getStatusStyle(deal.estado);
                  const isDeleted = normalizeStatus(deal.estado).toLowerCase() === "eliminada"; // Cambio a minúsculas para seguridad
                  return (
                      <div
                          key={deal.id_promocion + deal.tipo_deal}
                          className={`deal-card ${isDiscount ? "discount" : "offer"} ${isDeleted ? "deleted" : ""}`}
                      >
                          <div className="deal-image-container">
                              <img
                                  src={deal.url_imagen || DEFAULT_IMAGE}
                                  alt={deal.producto}
                              />
                              <span className={`image-status-tag ${statusStyle}`}>
                                  {normalizeStatus(deal.estado)}
                              </span>
                          </div>
                          <div className="deal-content">
                              <div className="deal-header">
                                  <span
                                      className={`tag ${isDiscount ? "discount-type" : "offer-type"}`}
                                  >
                                      {deal.tipo_deal}
                                  </span>
                                  <div className="deal-percentage">
                                      {deal.porcentaje_descuento
                                          ? `-${deal.porcentaje_descuento}%`
                                          : "¡Oferta!"}
                                  </div>
                              </div>
                              <h3>{deal.producto}</h3>
                              <p>{deal.descripcion || deal.nombre}</p>
                              <div className="price-section">
                                  <p
                                      className={`price-base ${deal.estado === "Aprobado" && isDiscount
                                          ? "line-through-price"
                                          : ""
                                          }`}
                                  >
                                      ${deal.precio_original}
                                  </p>
                                  {deal.estado === "Aprobado" && isDiscount && (
                                      <p className="price-final">${precioFinal}</p>
                                  )}
                              </div>
                              <div className="deal-footer">
                                  <p>
                                      Vigencia: {deal.fecha_inicio} → {deal.fecha_fin}
                                  </p>
                                  <div className="deal-actions">
                                      {/* Deshabilitar botones si está eliminado */}
                                      <button 
                                        className="edit-btn btn btn-sm" 
                                        onClick={() => handleEditClick(deal)}
                                        disabled={isDeleted}
                                      >
                                        Editar
                                      </button>
                                      <button
                                          className="delete-btn btn btn-sm"
                                          onClick={() =>
                                              handleDeletePromocion(deal.id_promocion, deal.tipo_deal)
                                          }
                                          // Permitir eliminar si está pendiente o si no está eliminada
                                          disabled={isDeleted} 
                                      >
                                          Eliminar
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {dealToEdit && (
        <OfferEditModal
          deal={dealToEdit}
          products={productos}
          onClose={() => setDealToEdit(null)}
          onUpdated={cargarDeals}
        />
      )}
    </div>
  );
}
