import { useState, useEffect } from "react";
import { obtenerOrdenes, actualizarEstadoOrden, obtenerComprobante } from "../services/ordenService";
import "../style/ordenes.css";

// Normalizador de estados robusto
const normalizeStatus = (status) => {
  if (!status) return "Pendiente";
  const s = String(status).trim();
  if (s.length === 0) return "Pendiente";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const getStatusClass = (s) => {
  const status = normalizeStatus(s);
  // Mapeo de clases CSS según estado normalizado
  const map = {
    "Pendiente": "status-Pendiente",
    "Procesando": "status-Procesando", // Asegurar que exista en CSS o usar fallback
    "Enviado": "status-Enviado",
    "Entregado": "status-Entregado",
    "Cancelado": "status-Rechazado" // Ejemplo si existiera
  };
  return map[status] || `status-${status.replace(/\s+/g, "")}`;
};

const getLoggedProductorId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    return userData?.id_usuario || userData?.idUsuario || null;
  } catch {
    return null;
  }
};

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const ID_PRODUCTOR_ACTUAL = getLoggedProductorId();

  useEffect(() => {
    if (ID_PRODUCTOR_ACTUAL) fetchOrdenes();
    else {
      setError("No se encontró el productor logueado. Inicia sesión nuevamente.");
      setLoading(false);
    }
  }, [ID_PRODUCTOR_ACTUAL]);

  const fetchOrdenes = async () => {
    try {
      const data = await obtenerOrdenes();
      setOrdenes(data);
    } catch (error) {
      console.error(" No se pudieron obtener las órdenes.", error);
      setError("Error al cargar las órdenes. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = async (id_pedido) => {
    try {
      const pdfBlob = await obtenerComprobante(id_pedido);
      
      const url = window.URL.createObjectURL(pdfBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante_orden_${id_pedido}.pdf`; 
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      alert("Error al descargar el comprobante.");
    }
  };

  const handlePrevisualizarComprobante = async (id_pedido) => {
    try {
      const pdfBlob = await obtenerComprobante(id_pedido);
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank'); 
    } catch (error) {
      alert("Error al previsualizar el comprobante.");
    }
  };

  const handleEstadoChange = async (id_pedido, estado) => { 
    try {
      await actualizarEstadoOrden(id_pedido, estado);
      setOrdenes(prevOrdenes => 
        prevOrdenes.map(orden => 
          orden.id_pedido === id_pedido ? { ...orden, estado: estado } : orden
        )
      );
    } catch (error) {
      console.error(" Error al actualizar estado", error);
    }
  };

  // Filtrado
  const filteredOrdenes = ordenes.filter(orden => {
    if (filterStatus === "todos") return true;
    return normalizeStatus(orden.estado).toLowerCase() === filterStatus.toLowerCase();
  });

  // Conteo
  const counts = ordenes.reduce((acc, orden) => {
    const status = normalizeStatus(orden.estado).toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, { total: 0 });

  // Configuración de pestañas
  const tabs = [
    { key: "todos", label: "Todas", count: counts.total || 0 },
    { key: "pendiente", label: "Pendientes", count: counts.pendiente || 0 },
    { key: "procesando", label: "Procesando", count: counts.procesando || 0 },
    { key: "enviado", label: "Enviados", count: counts.enviado || 0 },
    { key: "entregado", label: "Entregados", count: counts.entregado || 0 },
  ];

  if (loading) return <div>Cargando órdenes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Gestión de Órdenes (Productor ID: {ID_PRODUCTOR_ACTUAL})</h2>
        
        {/* FILTROS MEJORADOS */}
        <div className="filter-buttons">
            {tabs.map(tab => (
                <button 
                    key={tab.key}
                    className={`filter-btn ${filterStatus === tab.key ? `active-${tab.key === 'todos' ? 'all' : 'aprobado'}` : ''} ${filterStatus === tab.key && tab.key === 'pendiente' ? 'active-pendiente' : ''}`}
                    onClick={() => setFilterStatus(tab.key)}
                    style={filterStatus === tab.key ? {} : {}} // Limpiar estilos inline
                >
                    {tab.label} ({tab.count})
                </button>
            ))}
        </div>
      </div>

      {filteredOrdenes.length === 0 ? (
         <div className="no-results">
            <div className="no-results-card">
                <h3>No hay órdenes {filterStatus !== 'todos' ? filterStatus : ''}</h3>
                <p>No se encontraron pedidos con este estado.</p>
            </div>
         </div>
      ) : (
      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Seguimiento</th>
            <th>Acciones</th>
            <th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
            {filteredOrdenes.map((orden) => (
              <tr key={orden.id_pedido}>
                <td>{orden.id_pedido}</td> 
                <td>{orden.cliente}</td>
                <td>{new Date(orden.fecha_pedido).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(orden.estado)}`}>
                    {normalizeStatus(orden.estado)}
                  </span>
                </td>
                <td>${Number(orden.total).toFixed(2)}</td>
           
                <td>{orden.direccion_envio || "N/A"}</td>
                <td>{orden.ciudad_envio || "N/A"}</td>
                <td>{orden.numero_seguimiento || "—"}</td>
                <td>
                  <select
                    className="form-select"
                    aria-label={`Cambiar estado orden ${orden.id_pedido}`}
                    value={normalizeStatus(orden.estado)}
                    onChange={(e) => handleEstadoChange(orden.id_pedido, e.target.value)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Procesando">Procesando</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </td>
                <td className="comprobante-buttons">
                  <button
                    className="btn-preview"
                    onClick={() => handlePrevisualizarComprobante(orden.id_pedido)}
                    title="Previsualizar comprobante"
                  >
                      Ver
                  </button>
                  <button
                    className="btn-download"
                    onClick={() => handleDescargarComprobante(orden.id_pedido)}
                    title="Descargar comprobante"
                  >
                    ⬇️ Descargar
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      )}
    </div>
  );
}
