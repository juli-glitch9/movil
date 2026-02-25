import React, { useState, useEffect } from 'react';
import {
    FaUser,
    FaMapMarkerAlt,
    FaCity,
    FaEnvelope,
    FaPhone,
    FaBox,
    FaTimes
} from 'react-icons/fa';

const ShippingFormModal = ({
    isOpen,
    onClose,
    onContinue,
    usuario
}) => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        correo: '',
        direccion: '',
        ciudad: '',
        codigoPostal: '',
        telefono: '',
        notas: ''
    });

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (isOpen) {
            setFormData({
                nombreCompleto: usuario?.nombre_usuario || '',
                correo: usuario?.correo_electronico || '',
                direccion: '',
                ciudad: '',
                codigoPostal: '',
                telefono: '',
                notas: ''
            });
        }
    }, [isOpen, usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!formData.direccion.trim() || !formData.ciudad.trim() || !formData.correo.trim()) {
            return;
        }

        setLoading(true);


        await new Promise(resolve => setTimeout(resolve, 100));

        onContinue(formData);
        setLoading(false);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="payment-modal-overlay" onClick={handleClose}>
            <div className="payment-modal shipping-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h3>Informacion del envio</h3>
                    <button
                        className="close-modal"
                        onClick={handleClose}
                        type="button"
                        disabled={loading}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="shipping-form">
                    <div className="form-group">
                        <label htmlFor="nombreCompleto">
                            <FaUser className="form-icon" />
                            Nombre completo *
                        </label>
                        <input
                            id="nombreCompleto"
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ingresa tu nombre completo"
                            className="form-input"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">
                            <FaEnvelope className="form-icon" />
                            Correo electrónico *
                        </label>
                        <input
                            id="correo"
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            className="form-input"
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">
                            <FaMapMarkerAlt className="form-icon" />
                            Dirección de envío *
                        </label>
                        <input
                            id="direccion"
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            placeholder="Cra 10 #20-30, Barrio..."
                            className="form-input"
                            required
                            disabled={loading}
                            autoComplete="street-address"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="ciudad">
                                <FaCity className="form-icon" />
                                Ciudad *
                            </label>
                            <select
                                id="ciudad"
                                name="ciudad"
                                value={formData.ciudad}
                                onChange={handleChange}
                                className="form-input"
                                required
                                disabled={loading}
                            >
                                <option value="">Selecciona una ciudad</option>
                                <option value="Bogotá D.C.">Bogotá D.C.</option>
                                <option value="Medellín">Medellín</option>
                                <option value="Cali">Cali</option>
                                <option value="Barranquilla">Barranquilla</option>
                                <option value="Cartagena">Cartagena</option>
                                <option value="Otra">Otra ciudad</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="codigoPostal">
                                Código Postal
                            </label>
                            <input
                                id="codigoPostal"
                                type="text"
                                name="codigoPostal"
                                value={formData.codigoPostal}
                                onChange={handleChange}
                                placeholder="110111"
                                className="form-input"
                                disabled={loading}
                                autoComplete="postal-code"
                                maxLength="6"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="telefono">
                            <FaPhone className="form-icon" />
                            Teléfono de contacto *
                        </label>
                        <input
                            id="telefono"
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="+57 300 123 4567"
                            className="form-input"
                            required
                            disabled={loading}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notas">
                            <FaBox className="form-icon" />
                            Instrucciones especiales (opcional)
                        </label>
                        <textarea
                            id="notas"
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            placeholder="Ej: Llamar antes de entregar, dejar en portería..."
                            className="form-textarea"
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="payment-actions">
                        <button
                            className="btn-payment-cancel"
                            onClick={handleClose}
                            type="button"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn-payment-confirm"
                            type="submit"
                            disabled={loading || !formData.direccion.trim() || !formData.ciudad.trim() || !formData.correo.trim() || !formData.telefono.trim() || !formData.nombreCompleto.trim()}
                        >
                            {loading ? ' Procesando...' : 'Pagar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShippingFormModal;