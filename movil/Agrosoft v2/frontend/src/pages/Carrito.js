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
import { api } from "../config/api";
import "../style/Carrito.css";

const Carrito = () => {
  const { carritoData: carritoContextData, actualizarCarrito, numeroItems, loading: contextLoading } = useCarrito();
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
    if (!usuario) {
      setLoading(false);
      return;
    }
    if (!carritoData) {
      setLoading(true);
      actualizarCarrito().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [usuario, carritoData, actualizarCarrito]);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "" || isNaN(price)) return "$0 COP";
    let numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numericPrice < 100) numericPrice *= 1000;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numericPrice);
  };

  const calcularTotales = () => {
    if (!carritoData || !carritoData.items) return { subtotal: 0, totalItems: 0 };
    const subtotal = carritoData.items.reduce((sum, item) => {
      let precio = item.precio_unitario_al_momento || item.precio || 0;
      if (precio < 100) precio *= 1000;
      return sum + (precio * (item.cantidad || 0));
    }, 0);
    const totalItems = carritoData.items.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    return { subtotal, totalItems };
  };

  const { subtotal, totalItems } = calcularTotales();

  // --------------------- FUNCIONES DEL CARRITO ---------------------
  const cargarCarrito = async () => {
    try {
      setLoading(true);
      setError(null);
      await actualizarCarrito();
    } catch (err) {
      console.error("Error cargando carrito:", err);
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
      addNotification(`Solo hay ${stockDisponible} unidades disponibles`, "warning");
      return;
    }
    setProcessingAction(true);
    try {
      const response = await api.put(`/api/carrito/actualizar-item/${idItem}`, { cantidad: nuevaCantidad });
      if (response.data.success) {
        await actualizarCarrito();
        addNotification("Cantidad actualizada correctamente", "success");
      }
    } catch (err) {
      console.error("Error actualizando cantidad:", err);
      addNotification("Error al actualizar la cantidad", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  const eliminarItem = async (idItem, productName = "producto") => {
    if (!window.confirm(`¿Estás seguro de eliminar "${productName}" del carrito?`)) return;
    setProcessingAction(true);
    try {
      const response = await api.delete(`/api/carrito/eliminar-item/${idItem}`);
      if (response.data.success) {
        await actualizarCarrito();
        addNotification(`"${productName}" eliminado del carrito`, "info");
      }
    } catch (err) {
      console.error("Error eliminando item:", err);
      addNotification("Error al eliminar el producto", "error");
    } finally {
      setProcessingAction(false);
    }
  };

  // --------------------- FUNCIONES PDF ---------------------
  const generarReportePDF = () => {
    if (!carritoData?.items) {
      addNotification("No hay productos en el carrito para generar reporte", "warning");
      return;
    }
    setProcessingAction(true);
    const { subtotal } = calcularTotales();
    generarPDFCarrito(carritoData, usuario, subtotal)
      .then(() => addNotification("Cotización generada exitosamente", "success"))
      .catch((err) => {
        console.error("Error generando PDF profesional:", err);
        generarReporteSimplePDF();
      })
      .finally(() => setProcessingAction(false));
  };

  const generarReporteSimplePDF = () => {
    if (!carritoData?.items) return;
    const { subtotal } = calcularTotales();
    import("jspdf").then(({ default: jsPDF }) => {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text("AGROSOFT SAS", 105, 20, { align: "center" });
      pdf.setFontSize(16);
      pdf.text("REPORTE DE COTIZACIÓN", 105, 45, { align: "center" });
      let y = 60;
      carritoData.items.forEach(item => {
        pdf.setFontSize(10);
        pdf.text(`${item.nombre_producto} x${item.cantidad} - ${formatPrice(item.precio_unitario_al_momento)}`, 20, y);
        y += 10;
      });
      pdf.text(`TOTAL: ${formatPrice(subtotal)}`, 20, y + 10);
      pdf.save(`cotizacion-agrosoft-${Date.now()}.pdf`);
      addNotification("Reporte PDF generado exitosamente", "success");
    });
  };

  // --------------------- FUNCIONES PEDIDO ---------------------
  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setShowShippingForm(false);
    setShowPaymentModal(true);
  };

  const crearPedido = async () => {
    if (!selectedPaymentMethod) {
      addNotification("Por favor selecciona un método de pago", "warning");
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
        notas_pedido: shippingData.notas || "",
        total_pedido: subtotal
      };
      const response = await api.post("/api/pedidos/crear", pedidoData);
      if (response.data.success) {
        addNotification("¡Compra realizada exitosamente!", "success");
        setShowPaymentModal(false);
        setShippingData(null);
        setSelectedPaymentMethod("");
        await cargarCarrito();
        setTimeout(() => navigate("/pedidos"), 2000);
      }
    } catch (error) {
      console.error("Error creando pedido:", error);
      addNotification("Error al crear el pedido", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const getPaymentMethodId = (method) => ({ tarjeta: 1, transferencia: 4, efectivo: 5 })[method] || 1;
  const procederAlPago = () => setShowShippingForm(true);

  // --------------------- RENDER ---------------------
  if (loading || contextLoading || !carritoData) return (
    <div className="carrito-container"><p>Cargando tu carrito...</p></div>
  );
  if (error) return (
    <div className="carrito-container">
      <p>{error}</p>
      <button onClick={cargarCarrito}>Reintentar</button>
    </div>
  );

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <button className="carrito-volver-btn" onClick={() => navigate(-1)}><FaArrowLeft /> Volver</button>
        <h1 className="carrito-title"><FaShoppingCart /> Mi Carrito</h1>
      </div>

      {!usuario ? (
        <div className="carrito-mensaje"><p>Inicia sesión para ver tu carrito</p></div>
      ) : (carritoData?.items?.length || 0) === 0 ? (
        <div className="carrito-mensaje"><p>Carrito vacío</p></div>
      ) : (
        <div className="carrito-content">
          <section className="carrito-items-section">
            <div className="carrito-items-header">
              <h2>Productos</h2>
              <div className="carrito-summary-mini">{totalItems} items</div>
            </div>

            <div className="carrito-items-grid">
              {carritoData?.items?.map(item => (
                <article key={item.id_detalle_carrito} className="carrito-item-card">
                  <div className="carrito-item-imagen-container">
                    {item.url_imagen ? (
                      <img src={item.url_imagen} alt={item.nombre_producto} className="carrito-item-imagen" />
                    ) : (
                      <div className="carrito-item-imagen" style={{background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center'}}>{item.nombre_producto?.slice(0,1)}</div>
                    )}
                  </div>

                  <div className="carrito-item-detalles">
                    <h3 className="carrito-item-nombre">{item.nombre_producto}</h3>
                    {item.descripcion_producto && <p className="carrito-item-descripcion">{item.descripcion_producto}</p>}
                    <div className="carrito-item-precios">
                      <div className="carrito-item-precio-unitario">{formatPrice(item.precio_unitario_al_momento)}</div>
                      <div className="carrito-item-subtotal">Subtotal: {formatPrice(item.subtotal)}</div>
                    </div>
                  </div>

                  <div className="carrito-item-controles">
                    <div className="cantidad-controls">
                      <button className="cantidad-btn" onClick={() => actualizarCantidad(item.id_detalle_carrito, (item.cantidad || 1) - 1, item.stock_disponible ?? item.cantidad)} disabled={processingAction}>-</button>
                      <div className="cantidad-display">{item.cantidad}</div>
                      <button className="cantidad-btn" onClick={() => actualizarCantidad(item.id_detalle_carrito, (item.cantidad || 1) + 1, item.stock_disponible ?? item.cantidad)} disabled={processingAction}>+</button>
                    </div>
                    <button className="carrito-btn-eliminar" onClick={() => eliminarItem(item.id_detalle_carrito, item.nombre_producto)} disabled={processingAction}><FaTrash /> Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="carrito-resumen-section">
            <div className="carrito-resumen-card">
              <h3>Resumen</h3>
              <div className="resumen-detalles">
                <div className="resumen-fila"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="resumen-fila"><span>Items</span><span>{totalItems}</span></div>
                <div className="resumen-separador" />
                <div className="resumen-total"><span>Total</span><span className="total-precio">{formatPrice(subtotal)}</span></div>
              </div>
              <button className="carrito-btn-comprar" onClick={procederAlPago} disabled={processingPayment}>Finalizar Compra <FaCreditCard /></button>
              <button className="carrito-btn-reporte" onClick={generarReportePDF} disabled={processingAction}><FaFileAlt /> Generar Reporte</button>
            </div>
          </aside>
        </div>
      )}

      <ShippingFormModal isOpen={showShippingForm} onClose={() => setShowShippingForm(false)} onContinue={handleShippingSubmit} usuario={usuario} />
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} shippingData={shippingData} selectedPaymentMethod={selectedPaymentMethod} onPaymentMethodChange={setSelectedPaymentMethod} onConfirm={crearPedido} processingPayment={processingPayment} total={subtotal} formatPrice={formatPrice} carritoData={carritoData} />
    </div>
  );
};

export default Carrito;
