// src/pages/MisPedidos.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaHashtag,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaArrowLeft,
  FaTrash
} from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import CancelarPedidoModal from '../components/CancelarPedidoModal';
import { api } from '../config/api';
import '../style/Pedidos.css';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [cancelandoPedido, setCancelandoPedido] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [usuario] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // Formatear precios en COP
  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined || price === "" || isNaN(price)) return "$0 COP";
    let numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numericPrice < 100) numericPrice *= 1000;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  }, []);

  // Obtener pedidos del usuario
  const obtenerPedidos = async () => {
    if (!usuario) {
      setLoading(false);
      setPedidos([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/pedidos/usuario/${usuario.id_usuario}`);
      if (response.data && response.data.success) {
        setPedidos(response.data.data || []);
      } else {
        setError(response.data?.error || "Error al cargar los pedidos");
        setPedidos([]);
      }
    } catch (err) {
      console.error("Error obteniendo pedidos:", err);
      setError("Error al cargar los pedidos");
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id_usuario]);

  // Cancelar pedido
  const cancelarPedido = async (motivo) => {
    setCancelandoPedido(true);
    try {
      const response = await api.put(`/api/pedidos/cancelar/${pedidoSeleccionado.id_pedido}`, { motivo_cancelacion: motivo });
      if (response.data.success) {
        addNotification('Pedido cancelado exitosamente', 'success');
        await obtenerPedidos();
        setShowCancelarModal(false);
        setPedidoSeleccionado(null);
      } else {
        throw new Error(response.data.error || 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al cancelar el pedido';
      addNotification(errorMessage, 'error');
    } finally {
      setCancelandoPedido(false);
    }
  };

  // Calcular fecha estimada de entrega
  const calcularFechaEntrega = useCallback((fechaPedido) => {
    if (!fechaPedido) return 'Fecha no disponible';
    const fecha = new Date(fechaPedido);
    fecha.setDate(fecha.getDate() + 3);
    if (fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 2);
    if (fecha.getDay() === 0) fecha.setDate(fecha.getDate() + 1);
    return fecha.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  // Iconos y estilos según estado del pedido
  const getEstadoIcon = (idEstado) => {
    switch (idEstado) {
      case 1: return <FaBox className="status-icon pendiente" />;
      case 2: return <FaShippingFast className="status-icon procesando" />;
      case 3: return <FaCheckCircle className="status-icon entregado" />;
      case 4: return <FaTimesCircle className="status-icon cancelado" />;
      default: return <FaBox />;
    }
  };

  const getEstadoClass = (idEstado) => {
    switch (idEstado) {
      case 1: return 'pendiente';
      case 2: return 'procesando';
      case 3: return 'entregado';
      case 4: return 'cancelado';
      default: return 'pendiente';
    }
  };

  const getEstadoTexto = (idEstado) => {
    switch (idEstado) {
      case 1: return 'Pendiente';
      case 2: return 'En Proceso';
      case 3: return 'Entregado';
      case 4: return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  // Renderización según estado de carga y errores
  if (loading) return (
    <div className="mis-pedidos-container">
      <div className="pedidos-header">
        <button className="pedidos-volver-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
        <h1 className="pedidos-title"><FaBox /> Mis Pedidos</h1>
      </div>
      <div className="pedidos-loading">
        <FaBox className="loading-icon" />
        <p>Cargando tus pedidos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="mis-pedidos-container">
      <div className="pedidos-header">
        <button className="pedidos-volver-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
        <h1 className="pedidos-title"><FaBox /> Mis Pedidos</h1>
      </div>
      <div className="pedidos-error">
        <FaTimesCircle className="error-icon" />
        <h3>Error al cargar los pedidos</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button className="pedidos-btn-primary" onClick={obtenerPedidos}>Reintentar</button>
          <button className="pedidos-btn-secondary" onClick={() => navigate('/catalogo')}>Seguir Comprando</button>
        </div>
      </div>
    </div>
  );

  if (!pedidos || pedidos.length === 0) return (
    <div className="mis-pedidos-container">
      <div className="pedidos-header">
        <button className="pedidos-volver-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
        <h1 className="pedidos-title"><FaBox /> Mis Pedidos</h1>
      </div>
      <div className="pedidos-mensaje">
        <FaBox className="mensaje-icon" />
        <h3>No tienes pedidos aún</h3>
        <p>Realiza tu primera compra y aparecerá aquí</p>
        <button className="pedidos-btn-primary" onClick={() => navigate('/catalogo')}>Explorar Productos</button>
      </div>
    </div>
  );

  return (
    <div className="mis-pedidos-container">
      <div className="pedidos-header">
        <button className="pedidos-volver-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
        <h1 className="pedidos-title"><FaBox /> Mis Pedidos</h1>
      </div>

      <div className="pedidos-resumen">
        <div className="resumen-card">
          <h3>Total Pedidos</h3>
          <div className="resumen-number">{pedidos.length}</div>
        </div>
        <div className="resumen-card">
          <h3>Pendientes</h3>
          <div className="resumen-number">{pedidos.filter(p => p.id_estado_pedido === 1).length}</div>
        </div>
        <div className="resumen-card">
          <h3>Entregados</h3>
          <div className="resumen-number entregado">{pedidos.filter(p => p.id_estado_pedido === 3).length}</div>
        </div>
      </div>

      <h2 className="pedidos-subtitle">Historial de Pedidos</h2>

      <div className="pedidos-grid">
        {pedidos.map((pedido) => (
          <div key={pedido.id_pedido} className="pedido-card">
            <div className="pedido-header">
              <div className="pedido-info">
                <h3 className="pedido-numero">Pedido #{pedido.numero_seguimiento}</h3>
                <div className="pedido-fecha">
                  <FaCalendarAlt />
                  {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="pedido-estado">
                <div className={`status-badge ${getEstadoClass(pedido.id_estado_pedido)}`}>
                  {getEstadoIcon(pedido.id_estado_pedido)}
                  {getEstadoTexto(pedido.id_estado_pedido)}
                </div>
              </div>
            </div>

            <div className="pedido-detalles">
              <div className="detalle-fila">
                <div className="detalle-item">
                  <FaHashtag className="detalle-icon" />
                  <div className="detalle-content">
                    <span className="detalle-label">N° de Seguimiento</span>
                    <span className="detalle-valor numero-seguimiento">{pedido.numero_seguimiento}</span>
                  </div>
                </div>
                <div className="detalle-item">
                  <FaClock className="detalle-icon" />
                  <div className="detalle-content">
                    <span className="detalle-label">Entrega Estimada</span>
                    <span className="detalle-valor fecha-entrega">{calcularFechaEntrega(pedido.fecha_pedido)}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-fila">
                <div className="detalle-item">
                  <FaMoneyBillWave className="detalle-icon" />
                  <div className="detalle-content">
                    <span className="detalle-label">Método de Pago</span>
                    <span className="detalle-valor">{pedido.nombre_metodo}</span>
                  </div>
                </div>
                <div className="detalle-item">
                  <div className="detalle-content">
                    <span className="detalle-label">Total del Pedido</span>
                    <span className="detalle-valor total-pedido">{formatPrice(pedido.total_pedido)}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-item full-width">
                <FaMapMarkerAlt className="detalle-icon" />
                <div className="detalle-content">
                  <span className="detalle-label">Dirección de Envío</span>
                  <span className="detalle-valor">{pedido.direccion_envio}, {pedido.ciudad_envio} - {pedido.codigo_postal_envio}</span>
                </div>
              </div>
            </div>

            <div className="pedido-footer">
              <div className="pedido-total">
                <span className="total-label">Total:</span>
                <span className="total-precio">{formatPrice(pedido.total_pedido)}</span>
              </div>
              <div className="pedido-acciones">
                {pedido.id_estado_pedido === 1 && (
                  <button className="btn-accion cancelar-pedido" onClick={() => { setPedidoSeleccionado(pedido); setShowCancelarModal(true); }}>
                    <FaTrash /> Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CancelarPedidoModal
        isOpen={showCancelarModal}
        onClose={() => { setShowCancelarModal(false); setPedidoSeleccionado(null); }}
        onConfirm={cancelarPedido}
        pedido={pedidoSeleccionado}
        processing={cancelandoPedido}
      />
    </div>
  );
};

export default MisPedidos;
