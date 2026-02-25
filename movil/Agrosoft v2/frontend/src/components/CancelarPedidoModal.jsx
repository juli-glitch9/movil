import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import './CancelarPedidoModal.css';

const CancelarPedidoModal = ({
    isOpen,
    onClose,
    onConfirm,
    pedido,
    processing
}) => {
    const [motivo, setMotivo] = useState('');
    const [confirmacion, setConfirmacion] = useState('');

    const handleClose = () => {
        setMotivo('');
        setConfirmacion('');
        onClose();
    };

    const handleConfirm = () => {
        if (confirmacion.toLowerCase() !== 'cancelar') {
            alert('Por favor escribe "CANCELAR" para confirmar la cancelación');
            return;
        }
        onConfirm(motivo || 'Cancelado por el usuario');
        setMotivo('');
        setConfirmacion('');
    };

    if (!isOpen) return null;

    return (
        <div className="cancelar-pedido-overlay">
            <div className="cancelar-pedido-modal">
                <div className="cancelar-pedido-header">
                    <FaExclamationTriangle className="warning-icon" />
                    <h3>Cancelar Pedido</h3>
                    <button className="close-btn" onClick={handleClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cancelar-pedido-content">
                    <div className="pedido-info">
                        <h4>Pedido: {pedido?.numero_seguimiento}</h4>
                        <p><strong>Fecha:</strong> {new Date(pedido?.fecha_pedido).toLocaleDateString('es-CO')}</p>
                        <p><strong>Total:</strong> {pedido?.total_pedido}</p>
                        <p><strong>Estado actual:</strong> <span className="estado-pendiente">Pendiente</span></p>
                    </div>

                    <div className="advertencia">
                        <FaExclamationTriangle />
                        <p>¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.</p>
                    </div>

                    <div className="motivo-cancelacion">
                        <label htmlFor="motivo">Motivo de cancelación (opcional):</label>
                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Cambié de opinión, Encontré mejor precio, etc."
                            rows="3"
                        />
                    </div>

                    <div className="confirmacion-texto">
                        <label htmlFor="confirmacion">
                            Escribe <strong>"CANCELAR"</strong> para confirmar:
                        </label>
                        <input
                            id="confirmacion"
                            type="text"
                            value={confirmacion}
                            onChange={(e) => setConfirmacion(e.target.value)}
                            placeholder="Escribe CANCELAR aquí"
                            className={confirmacion && confirmacion.toLowerCase() !== 'cancelar' ? 'error' : ''}
                        />
                        {confirmacion && confirmacion.toLowerCase() !== 'cancelar' && (
                            <span className="error-text">Texto incorrecto</span>
                        )}
                    </div>
                </div>

                <div className="cancelar-pedido-actions">
                    <button
                        className="btn-cancelar-pedido"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Volver
                    </button>
                    <button
                        className="btn-confirmar-cancelacion"
                        onClick={handleConfirm}
                        disabled={processing || confirmacion.toLowerCase() !== 'cancelar'}
                    >
                        {processing ? (
                            <>
                                <div className="loading-spinner-small"></div>
                                Cancelando...
                            </>
                        ) : (
                            <>
                                <FaTrash />
                                Confirmar Cancelación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// EXPORTACIÓN CORRECTA - Solo default export
export default CancelarPedidoModal;