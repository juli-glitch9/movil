import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * @param {object} props 
 * @param {JSX.Element} props.element 
 * @param {boolean} props.isAuthenticated 
 * @param {object | null} props.user 
 */
const ProducerRoute = ({ element, isAuthenticated, user }) => {
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isProducer = user?.role === 'productor';

    if (!isProducer) {
        console.warn("Acceso denegado: El usuario no tiene rol de productor.");
        return <Navigate to="/" replace />;
    }

    return element;
};

export default ProducerRoute;
