import { useState, useEffect, useCallback } from "react";
import { obtenerOrdenes, actualizarEstadoOrden, obtenerComprobante } from "../services/pedidoService";
import PedidoTable from "../components/PedidoTable";
import "../styles/PagePedido.css";

const getLoggedUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    return userData?.id_usuario || userData?.idUsuario || null;
  } catch {
    return null;
  }
};

export default function PagePedido() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado unificado para filtros
  const [filtros, setFiltros] = useState({
    search: "",
    fechaInicio: "",
    fechaFin: "",
    estado: ""
  });

  const ID_USUARIO_ACTUAL = getLoggedUserId();

  const fetchOrdenes = useCallback(async (filtrosAplicados = {}) => {
    try {
      const data = await obtenerOrdenes(filtrosAplicados);
      setOrdenes(data);
    } catch (error) {
      console.error(" No se pudieron obtener las órdenes.", error);
      setError("Error al cargar las órdenes. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ID_USUARIO_ACTUAL) {
        // Carga inicial sin filtros (o con los defaults)
        fetchOrdenes(filtros);
    } else {
      setError("No se encontró el usuario logueado. Inicia sesión nuevamente.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ID_USUARIO_ACTUAL]); // Solo carga inicial al montar/cambiar usuario

  const handleSearch = () => {
    fetchOrdenes(filtros);
  };

  const handleClear = () => {
    const newFiltros = { search: "", fechaInicio: "", fechaFin: "", estado: "" };
    setFiltros(newFiltros);
    fetchOrdenes(newFiltros);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
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

  if (loading) return <div>Cargando órdenes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="orders-container">
      <h2>Gestión de Órdenes</h2>
      
      <div className="filters-container" style={{ 
        display: "flex", 
        gap: "1rem", 
        flexWrap: "wrap", 
        marginBottom: "1.5rem", 
        padding: "1rem", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "8px" 
      }}>
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Nombre, Ciudad, Producto, Seguimiento..."
            value={filtros.search}
            onChange={handleInputChange}
            style={{ padding: "0.5rem", width: "300px" }}
          />
        </div>
        
        <div className="filter-group">
          <select 
            name="estado" 
            value={filtros.estado} 
            onChange={handleInputChange}
            style={{ padding: "0.5rem" }}
          >
            <option value="">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Procesando">Procesando</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>

        <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label>Desde:</label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleInputChange}
            style={{ padding: "0.4rem" }}
          />
        </div>

        <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label>Hasta:</label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={handleInputChange}
            style={{ padding: "0.4rem" }}
          />
        </div>

        <div className="filter-actions" style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-success" onClick={handleSearch}>
            Filtrar
          </button>
          <button className="btn-secondary" onClick={handleClear} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>
            Limpiar
          </button>
        </div>
      </div>

      <PedidoTable 
        ordenes={ordenes}
        onEstadoChange={handleEstadoChange}
        onPreviewComprobante={handlePrevisualizarComprobante}
        onDownloadComprobante={handleDescargarComprobante}
      />
    </div>
  );
}
