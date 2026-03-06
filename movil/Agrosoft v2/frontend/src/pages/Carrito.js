// src/components/Carrito.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaExclamationTriangle,
  FaFileAlt,
  FaCreditCard
} from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";
import { useCarrito } from "../context/CarritoContext";
import ShippingFormModal from "../components/ShippingFormModal";
import PaymentModal from "../components/PaymentModal";
import { generarPDFCarrito } from "../services/pdfCarritoService"; 
import { api } from "../config/api"; // <- IMPORTANTE: Usar api configurada
import "../style/Carrito.css";

const Carrito = () => {
  const {
    carritoData: carritoContextData,
    actualizarCarrito,
    numeroItems,
    loading: contextLoading
  } = useCarrito();

  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [error, setError] = useState(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const usuario = JSON.parse(localStorage.getItem("user"));
  const carritoData = carritoContextData;

  useEffect(() => {
    if (usuario) {
      if (carritoData) {
        setLoading(false);
      } else {
        actualizarCarrito().finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [usuario, carritoData, actualizarCarrito]);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "" || isNaN(price)) {
      return "$0 COP";
    }

    let numericPrice;
    if (typeof price === 'string') {
      numericPrice = parseFloat(price);
    } else {
      numericPrice = price;
    }

    if (numericPrice < 100) {
      numericPrice = numericPrice * 1000;
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericPrice);
  };

  const calcularTotales = () => {
    if (!carritoData || !carritoData.items) return { subtotal: 0, totalItems: 0 };

    const subtotal = carritoData.items.reduce((sum, item) => {
      let precio = item.precio_unitario_al_momento || item.precio || 0;

      if (precio < 100) {
        precio = precio * 1000;
      }

      const cantidad = item.cantidad || 0;
      return sum + (precio * cantidad);
    }, 0);

    const totalItems = carritoData.items.reduce((sum, item) => sum + (item.cantidad || 0), 0);

    return { subtotal, totalItems };
  };

  const { subtotal, totalItems } = calcularTotales();

  // Funciones del carrito usando api
  const cargarCarrito = async () => {
    try {
      setLoading(true);
      setError(null);
      await actualizarCarrito();
    } catch (err) {
      console.error("❌ Error cargando carrito:", err);
      setError("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = async (idItem, nuevaCantidad, stockDisponible) => {
    if (nuevaCantidad < 1) {
      eliminarItem(idItem);
      return;
    }

    if (nuevaCantidad > stockDisponible) {
      addNotification(`Solo hay ${stockDisponible} unidades disponibles`, 'warning');
      return;
    }

    setProcessingAction(true);
    try {
      // ✅ Usando api configurada
      const response = await api.put(`/api/carrito/actualizar-item/${idItem}`, {
        cantidad: nuevaCantidad
      });

      if (response.data.success) {
        await actualizarCarrito();
        addNotification('Cantidad actualizada correctamente', 'success');
      }
    } catch (err) {
      console.error("❌ Error actualizando cantidad:", err);
      addNotification('Error al actualizar la cantidad', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  const eliminarItem = async (idItem, productName = "producto") => {
    if (!window.confirm(`¿Estás seguro de eliminar "${productName}" del carrito?`)) return;

    setProcessingAction(true);
    try {
      // ✅ Usando api configurada
      const response = await api.delete(`/api/carrito/eliminar-item/${idItem}`);

      if (response.data.success) {
        await actualizarCarrito();
        addNotification(`"${productName}" eliminado del carrito`, 'info');
      }
    } catch (err) {
      console.error("❌ Error eliminando item:", err);
      addNotification('Error al eliminar el producto', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  // Funciones PDF
  const generarReportePDF = () => {
    if (!carritoData?.items) {
      addNotification('No hay productos en el carrito para generar reporte', 'warning');
      return;
    }

    setProcessingAction(true);

    try {
      const { subtotal } = calcularTotales();

      generarPDFCarrito(carritoData, usuario, subtotal)
        .then(result => {
          console.log('✅ PDF generado exitosamente:', result);
          addNotification('Cotización generada exitosamente', 'success');
          setProcessingAction(false);
        })
        .catch(error => {
          console.error('❌ Error generando PDF profesional:', error);
          generarReporteSimplePDF();
          setProcessingAction(false);
        });

    } catch (error) {
      console.error('❌ Error en generación de PDF:', error);
      addNotification('Error al generar el reporte PDF', 'error');
      setProcessingAction(false);
    }
  };

  const generarReporteSimplePDF = () => {
    if (!carritoData?.items) return;

    const { subtotal } = calcularTotales();

    import("jspdf").then(({ default: jsPDF }) => {
      const pdf = new jsPDF();

      pdf.setFont('helvetica');
      pdf.setFontSize(20);
      pdf.setTextColor(45, 80, 22);
      pdf.text('AGROSOFT SAS', 105, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Sistema Integral de Gestión Agrícola', 105, 28, { align: 'center' });

      pdf.setDrawColor(234, 128, 6);
      pdf.setLineWidth(0.5);
      pdf.line(20, 35, 190, 35);

      pdf.setFontSize(16);
      pdf.setTextColor(45, 80, 22);
      pdf.text('REPORTE DE COTIZACIÓN', 105, 45, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      let yPosition = 55;

      pdf.text(`Cliente: ${usuario?.nombre_usuario || 'Cliente'}`, 20, yPosition);
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, yPosition + 5);
      pdf.text(`No. Reporte: AG-${Date.now().toString().slice(-6)}`, 20, yPosition + 10);

      yPosition += 20;

      pdf.setFillColor(45, 80, 22);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(20, yPosition, 170, 8, 'F');
      pdf.text('Producto', 25, yPosition + 6);
      pdf.text('Cant', 130, yPosition + 6);
      pdf.text('Precio', 150, yPosition + 6);
      pdf.text('Subtotal', 170, yPosition + 6);

      yPosition += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);

      carritoData.items.forEach((item, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        let precio = item.precio_unitario_al_momento || 0;
        let subtotalItem = item.subtotal || 0;

        if (precio < 100) precio = precio * 1000;
        if (subtotalItem < 100) subtotalItem = subtotalItem * 1000;

        const productName = item.nombre_producto.length > 40 ?
          item.nombre_producto.substring(0, 40) + '...' : item.nombre_producto;

        pdf.text(productName, 25, yPosition);
        pdf.text(item.cantidad.toString(), 130, yPosition);
        pdf.text(formatPrice(precio), 150, yPosition);
        pdf.text(formatPrice(subtotalItem), 170, yPosition);

        yPosition += 8;

        if (item.descripcion_producto && yPosition < 250) {
          const desc = item.descripcion_producto.length > 60 ?
            item.descripcion_producto.substring(0, 60) + '...' : item.descripcion_producto;
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(desc, 25, yPosition);
          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          yPosition += 5;
        }

        yPosition += 5;
      });

      yPosition += 10;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(120, yPosition, 190, yPosition);
      yPosition += 8;

      pdf.text('Subtotal:', 130, yPosition);
      pdf.text(formatPrice(subtotal), 170, yPosition);
      yPosition += 6;

      pdf.text('Envío:', 130, yPosition);
      pdf.setTextColor(40, 167, 69);
      pdf.text('GRATIS', 170, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setDrawColor(234, 128, 6);
      pdf.line(120, yPosition, 190, yPosition);
      yPosition += 10;

      pdf.text('TOTAL:', 130, yPosition);
      pdf.setTextColor(40, 167, 69);
      pdf.text(formatPrice(subtotal), 170, yPosition);

      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© ' + new Date().getFullYear() + ' AgroSoft SAS - www.agrosoft.com', 105, 280, { align: 'center' });

      pdf.save(`cotizacion-agrosoft-${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification('Reporte PDF generado exitosamente', 'success');
    }).catch(error => {
      console.error('❌ Error cargando jsPDF:', error);
      addNotification('Error al generar el PDF', 'error');
    });
  };

  // Funciones de pedido usando api
  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setShowShippingForm(false);
    setShowPaymentModal(true);
  };

  const crearPedido = async () => {
    if (!selectedPaymentMethod) {
      addNotification('Por favor selecciona un método de pago', 'warning');
      return;
    }

    setProcessingPayment(true);
    try {
      const pedidoData = {
        id_usuario: usuario.id_usuario,
        id_metodo_pago: getPaymentMethodId(selectedPaymentMethod),
        direccion_envio: shippingData.direccion,
        ciudad_envio: shippingData.ciudad,
        codigo_postal_envio: shippingData.codigoPostal,
        notas_pedido: shippingData.notas || '',
        total_pedido: subtotal
      };

      console.log("📦 Creando pedido con datos:", pedidoData);

      // ✅ Usando api configurada
      const response = await api.post('/api/pedidos/crear', pedidoData, {
        timeout: 10000
      });

      if (response.data.success) {
        addNotification('¡Compra realizada exitosamente!', 'success');

        setShowPaymentModal(false);
        setShippingData(null);
        setSelectedPaymentMethod("");

        await cargarCarrito();
        setTimeout(() => {
          navigate('/mis-pedidos'); // Mantener la ruta que uses en tu app
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('❌ ERROR DETALLADO:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });

      const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
      addNotification(`❌ Error: ${serverError}`, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getPaymentMethodId = (method) => {
    const methods = {
      'tarjeta': 1,
      'transferencia': 4,
      'efectivo': 5
    };
    return methods[method] || 1;
  };

  const procederAlPago = () => {
    setShowShippingForm(true);
  };

  // Renderizado condicional
  if (loading || contextLoading) {
    return (
      <div className="carrito-container">
        <div className="carrito-loading">
          <FaShoppingCart className="loading-icon" />
          <p>Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-container">
        <div className="carrito-error">
          <FaExclamationTriangle className="error-icon" />
          <h3>Error al cargar el carrito</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="carrito-btn-primary" onClick={cargarCarrito}>
              Reintentar
            </button>
            <button className="carrito-btn-secondary" onClick={() => navigate('/catalogo')}>
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <div className="carrito-header-top">
          <button className="carrito-volver-btn" onClick={() => navigate(-1)} type="button">
            <FaArrowLeft />
            Volver
          </button>
        </div>
        <h1 className="carrito-title">Mi Carrito</h1>
      </div>

      {!usuario ? (
        <div className="carrito-mensaje">
          <FaShoppingCart className="mensaje-icon" />
          <h3>Inicia sesión para ver tu carrito</h3>
          <p>Necesitas tener una cuenta para gestionar tu carrito de compras</p>
          <button className="carrito-btn-primary" onClick={() => navigate("/login")} type="button">
            Iniciar Sesión
          </button>
        </div>
      ) : !carritoData?.items || carritoData.items.length === 0 ? (
        <div className="carrito-mensaje">
          <FaShoppingCart className="mensaje-icon" />
          <h3>Tu carrito está vacío</h3>
          <p>Descubre nuestros productos frescos y de calidad</p>
          <button className="carrito-btn-primary" onClick={() => navigate("/catalogo")} type="button">
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className="carrito-content">
          <div className="carrito-items-section">
            <div className="carrito-items-header">
              <h2>Productos en el carrito ({totalItems})</h2>
            </div>

            <div className="carrito-items-grid">
              {carritoData.items.map(item => {
                let precioMostrar = item.precio_unitario_al_momento || 0;
                if (precioMostrar < 100) {
                  precioMostrar = precioMostrar * 1000;
                }

                let subtotalMostrar = item.subtotal || 0;
                if (subtotalMostrar < 100) {
                  subtotalMostrar = subtotalMostrar * 1000;
                }

                return (
                  <div key={item.id_detalle_carrito} className="carrito-item-card">
                    <div className="carrito-item-imagen-container">
                      <img
                        src={item.url_imagen}
                        alt={item.nombre_producto}
                        className="carrito-item-imagen"
                      />
                    </div>

                    <div className="carrito-item-detalles">
                      <h3 className="carrito-item-nombre">{item.nombre_producto}</h3>
                      <p className="carrito-item-descripcion">{item.descripcion_producto}</p>

                      <div className="carrito-item-precios">
                        <span className="carrito-item-precio-unitario">
                          {formatPrice(precioMostrar)} / {item.unidad_medida}
                        </span>
                        <span className="carrito-item-subtotal">
                          Subtotal: {formatPrice(subtotalMostrar)}
                        </span>
                      </div>
                    </div>

                    <div className="carrito-item-controles">
                      <div className="cantidad-controls">
                        <button
                          className="cantidad-btn"
                          onClick={() => actualizarCantidad(item.id_detalle_carrito, item.cantidad - 1, 100)}
                          disabled={processingAction || item.cantidad <= 1}
                          type="button"
                        >
                          <FaMinus />
                        </button>

                        <span className="cantidad-display">{item.cantidad}</span>

                        <button
                          className="cantidad-btn"
                          onClick={() => actualizarCantidad(item.id_detalle_carrito, item.cantidad + 1, 100)}
                          disabled={processingAction}
                          type="button"
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <button
                        className="carrito-btn-eliminar"
                        onClick={() => eliminarItem(item.id_detalle_carrito, item.nombre_producto)}
                        disabled={processingAction}
                        type="button"
                      >
                        <FaTrash />
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="carrito-resumen-section">
            <div className="carrito-resumen-card">
              <h3>Resumen de compra</h3>

              <div className="resumen-detalles">
                <div className="resumen-fila">
                  <span>Productos ({totalItems})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="resumen-fila">
                  <span>Envío</span>
                  <span className="envio-gratis">¡Gratis!</span>
                </div>

                <div className="resumen-separador"></div>

                <div className="resumen-total">
                  <span>Total</span>
                  <span className="total-precio">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                className="carrito-btn-comprar"
                onClick={procederAlPago}
                disabled={processingAction}
                type="button"
              >
                <FaCreditCard />
                {processingAction ? "Procesando..." : " Finalizar Compra"}
              </button>

              <button
                className="carrito-btn-reporte"
                onClick={generarReportePDF}
                disabled={processingAction}
                type="button"
              >
                <FaFileAlt />
                {processingAction ? "Generando PDF..." : "Generar Reporte PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ShippingFormModal
        isOpen={showShippingForm}
        onClose={() => setShowShippingForm(false)}
        onContinue={handleShippingSubmit}
        usuario={usuario}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        shippingData={shippingData}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        onConfirm={crearPedido}
        processingPayment={processingPayment}
        total={subtotal}
        formatPrice={formatPrice}
        carritoData={carritoData}
      />
    </div>
  );
};

export default Carrito;