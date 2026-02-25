import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaExchangeAlt, FaMoneyBillWave, FaFilePdf, FaTimes, FaDownload } from 'react-icons/fa';
import { generarPDFTransferencia } from '../services/pdfGenerator';
import "./PaymentModal.css";

const PaymentModal = ({
    isOpen,
    onClose,
    shippingData,
    selectedPaymentMethod,
    onPaymentMethodChange,
    onConfirm,
    processingPayment,
    total,
    formatPrice,
    carritoData
}) => {
    const [localSelectedMethod, setLocalSelectedMethod] = useState('');
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [cartItems, setCartItems] = useState([]);


    useEffect(() => {
        if (isOpen) {
            console.log(' PAYMENT MODAL - DEBUG COMPLETO');
            console.log(' carritoData:', carritoData);
            console.log(' total prop:', total);
            console.log(' carritoData items:', carritoData?.items);


            if (carritoData?.items && Array.isArray(carritoData.items)) {
                console.log(' Items del carrito encontrados:', carritoData.items.length);


                const itemsAjustados = carritoData.items.map(item => {
                    let precio = item.precio_unitario_al_momento || 0;
                    let subtotal = item.subtotal || 0;


                    if (precio < 100) {
                        precio = precio * 1000;
                    }
                    if (subtotal < 100) {
                        subtotal = subtotal * 1000;
                    }

                    return {
                        ...item,
                        precio_ajustado: precio,
                        subtotal_ajustado: subtotal
                    };
                });

                setCartItems(itemsAjustados);


                const calculated = itemsAjustados.reduce((sum, item) => {
                    return sum + (item.subtotal_ajustado || 0);
                }, 0);

                console.log(' Total calculado desde items:', calculated);
                setCalculatedTotal(calculated);
            } else {
                console.log(' No hay items en carritoData o estructura incorrecta');
                setCartItems([]);
                setCalculatedTotal(0);
            }
        }
    }, [isOpen, carritoData]);

    useEffect(() => {
        if (selectedPaymentMethod) {
            setLocalSelectedMethod(selectedPaymentMethod);
        }
    }, [selectedPaymentMethod]);

    useEffect(() => {
        if (isOpen) {
            setLocalSelectedMethod(selectedPaymentMethod || '');
        }
    }, [isOpen, selectedPaymentMethod]);

    const paymentMethods = [
        {
            id: 'tarjeta',
            name: 'Tarjeta de Crédito/Débito',
            icon: FaCreditCard,
            description: 'Pago seguro con tarjeta'
        },
        {
            id: 'transferencia',
            name: 'Transferencia Bancaria',
            icon: FaExchangeAlt,
            description: 'Descarga el comprobante con datos bancarios'
        },
        {
            id: 'efectivo',
            name: 'Pago Contra Entrega',
            icon: FaMoneyBillWave,
            description: 'Paga cuando recibas tu pedido'
        }
    ];


    const displayTotal = total || calculatedTotal;

    const generarYDescargarComprobante = async () => {
        try {
            console.log(' Generando comprobante...');


            const datosPedido = {
                numeroPedido: `AGRO-${Date.now().toString().slice(-6)}`,
                fecha: new Date().toLocaleDateString('es-CO'),
                total: formatPrice(displayTotal),
                vencimiento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO'),
                productos: cartItems.map(item => ({
                    nombre: item.nombre_producto || item.nombre || 'Producto',
                    cantidad: item.cantidad || 1,
                    precioUnitario: formatPrice(item.precio_ajustado || item.precio_unitario_al_momento || 0),
                    subtotal: formatPrice(item.subtotal_ajustado || item.subtotal || 0),
                    unidad: item.unidad_medida || 'kg'
                }))
            };

            const datosCliente = {
                nombreCompleto: shippingData?.nombreCompleto || 'Cliente',
                correo: shippingData?.correo || 'correo@ejemplo.com',
                telefono: shippingData?.telefono || 'Sin teléfono',
                direccion: shippingData ? `${shippingData.direccion}, ${shippingData.ciudad} - ${shippingData.codigoPostal}` : 'Sin dirección'
            };

            console.log('Datos para PDF:', datosPedido);


            const pdfBlob = await generarPDFTransferencia(datosPedido, datosCliente);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `comprobante-transferencia-${datosPedido.numeroPedido}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert('Comprobante descargado. Realiza el pago según las instrucciones.');

        } catch (error) {
            console.error(' Error generando PDF:', error);
            alert(' Error al generar el comprobante.');
            throw error;
        }
    };

    const handleConfirm = async () => {
        if (localSelectedMethod === 'transferencia') {
            try {
                await generarYDescargarComprobante();
            } catch (error) {
                return;
            }
        }
        onConfirm();
    };

    const handleMethodSelect = (methodId) => {
        setLocalSelectedMethod(methodId);
        onPaymentMethodChange(methodId);
    };

    const handleClose = () => {
        if (!processingPayment) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="payment-modal-overlay" onClick={handleClose}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h3>Método de Pago</h3>
                    <button className="close-modal" onClick={handleClose} disabled={processingPayment}>
                        <FaTimes />
                    </button>
                </div>

                <div className="payment-content">

                    <div className="shipping-summary">
                        <h4>Dirección de Envío</h4>
                        <div className="shipping-details">
                            <p><strong>{shippingData?.nombreCompleto || 'Nombre no disponible'}</strong></p>
                            <p>{shippingData?.direccion || 'Dirección no disponible'}</p>
                            <p>{shippingData?.ciudad || 'Ciudad'} - {shippingData?.codigoPostal || 'CP'}</p>
                            <p> {shippingData?.telefono || 'Teléfono no disponible'}</p>
                            <p>{shippingData?.correo || 'Email no disponible'}</p>
                        </div>
                    </div>


                    <div className="products-summary">
                        <h4> Productos en el Carrito ({cartItems.length})</h4>
                        {cartItems.length > 0 ? (
                            <div className="products-list">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="product-item">
                                        <span className="product-name">{item.nombre_producto || item.nombre || 'Producto'}</span>
                                        <span className="product-quantity">{item.cantidad || 1} {item.unidad_medida || 'kg'}</span>
                                        <span className="product-price">{formatPrice(item.precio_ajustado || item.precio_unitario_al_momento || 0)}/{item.unidad_medida || 'kg'}</span>
                                        <span className="product-subtotal">{formatPrice(item.subtotal_ajustado || item.subtotal || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-products">No hay productos en el carrito</p>
                        )}
                    </div>


                    <div className="total-summary">
                        <h4> Total a Pagar</h4>
                        <div className="total-amount">{formatPrice(displayTotal)}</div>
                        {!total && calculatedTotal > 0 && (
                            <p className="calculated-note">(Calculado automáticamente desde los productos)</p>
                        )}
                    </div>


                    <div className="payment-methods">
                        <h4>Selecciona tu método de pago</h4>
                        <div className="methods-grid">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`method-card ${localSelectedMethod === method.id ? 'selected' : ''}`}
                                    onClick={() => handleMethodSelect(method.id)}
                                >
                                    <div className="method-icon"><method.icon /></div>
                                    <div className="method-info">
                                        <h5>{method.name}</h5>
                                        <p>{method.description}</p>
                                    </div>
                                    <div className="method-radio">
                                        <div className={`radio-dot ${localSelectedMethod === method.id ? 'active' : ''}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {localSelectedMethod === 'transferencia' && (
                        <div className="transfer-info">
                            <div className="transfer-header"><FaDownload /><span>Comprobante de Transferencia</span></div>
                            <p>Al confirmar, <strong>se descargará automáticamente</strong> un PDF con los datos bancarios.</p>
                        </div>
                    )}

                    {localSelectedMethod === 'efectivo' && (
                        <div className="cash-info">
                            <div className="cash-header"><FaMoneyBillWave /><span>Pago Contra Entrega</span></div>
                            <p>Paga cuando recibas tu pedido: <strong>{formatPrice(displayTotal)}</strong></p>
                        </div>
                    )}
                </div>

                <div className="payment-actions">
                    <button className="btn-payment-cancel" onClick={handleClose} disabled={processingPayment}>
                        Volver
                    </button>
                    <button
                        className="btn-payment-confirm"
                        onClick={handleConfirm}
                        disabled={!localSelectedMethod || processingPayment || cartItems.length === 0}
                    >
                        {processingPayment ? (
                            <>Procesando...</>
                        ) : localSelectedMethod === 'transferencia' ? (
                            ` Confirmar y Descargar PDF - ${formatPrice(displayTotal)}`
                        ) : (
                            ` Confirmar Pedido - ${formatPrice(displayTotal)}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;