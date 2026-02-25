// src/context/CarritoContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../config/api'; // <-- Importamos api.js

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [numeroItems, setNumeroItems] = useState(0);
  const [carritoData, setCarritoData] = useState(null);
  const [idCarrito, setIdCarrito] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener o crear carrito para el usuario
  const obtenerCarritoUsuario = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || user.id_rol !== 1) {
        setCarritoData({ items: [] });
        setNumeroItems(0);
        return;
      }

      const res = await api.get(`/api/carrito/activo/${user.id_usuario}`);
      if (res.data && res.data.success && res.data.data) {
        setIdCarrito(res.data.data.id_carrito);
        setCarritoData(res.data.data);
        setNumeroItems(res.data.data.items?.length || 0);
      } else {
        setCarritoData({ items: [] });
        setNumeroItems(0);
      }
      return res;
    } catch (error) {
      console.error('Error obteniendo/creando carrito:', error.response?.data || error.message);
      setCarritoData({ items: [] });
      setNumeroItems(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar producto al carrito
  const agregarAlCarrito = async (idProducto, cantidad = 1) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || user.id_rol !== 1) {
        throw new Error('Solo los clientes pueden agregar productos al carrito');
      }

      const response = await api.post('/api/carrito/agregar', {
        id_usuario: user.id_usuario,
        id_producto: idProducto,
        cantidad,
      });

      if (response.data.success) {
        window.dispatchEvent(new Event('cartUpdated'));
        await obtenerCarritoUsuario();
        return response.data;
      } else {
        throw new Error(response.data.error || 'Error al agregar producto');
      }
    } catch (error) {
      let errorMessage = error.response?.data?.error || error.message || 'Error inesperado al agregar al carrito';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const actualizarCarrito = async () => {
    await obtenerCarritoUsuario();
  };

  useEffect(() => {
    obtenerCarritoUsuario();
  }, [obtenerCarritoUsuario]);

  return (
    <CarritoContext.Provider value={{
      numeroItems,
      carritoData,
      idCarrito,
      actualizarCarrito,
      agregarAlCarrito,
      loading,
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export { CarritoContext };
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  return context;
};
