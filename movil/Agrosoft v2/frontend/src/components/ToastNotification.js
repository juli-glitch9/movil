import React, { useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast-notification toast-${type}`}>
            <div className="toast-content">
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default ToastNotification;