import React from 'react';

export default function ResponseModal({ show, message, type, onClose }) {
    if (!show) return null;
    const modalClass = type === 'success' ? 'modal-success' : 'modal-error';
    const icon = type === 'success' ? ' Éxito' : ' Error';
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal ${modalClass}`} onClick={e => e.stopPropagation()}>
                <h3>{icon}</h3>
                <p>{message}</p>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
}

