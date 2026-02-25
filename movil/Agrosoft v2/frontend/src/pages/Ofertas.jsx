// src/pages/Ofertas.js

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../config/api"; // <-- usar API centralizada
import "../style/Oferta.css";

export default function Ofertas() {
  const COP = (valor) => {
    if (!valor && valor !== 0) return "0";
    return Number(valor).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const [codigos, setCodigos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [codigoManual, setCodigoManual] = useState("");
  const [validacion, setValidacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [modalProducto, setModalProducto] = useState(null);
  const [toast, setToast] = useState("");

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [resCodigos, resProductos] = await Promise.all([
        api.get("/api/ofertas/codigos"),
        api.get("/api/ofertas/productos")
      ]);

      if (resCodigos.data.success) {
        setCodigos(resCodigos.data.codigos || []);
      }

      if (resProductos.data.success) {
        const productosData = resProductos.data.productos || [];
        setProductos(productosData);
        setProductosFiltrados(productosData);
      }

    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar datos");
      mostrarToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const mostrarToast = (mensaje, tipo = "info") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(""), 3000);
  };

  const validarCodigo = async () => {
    if (!codigoManual.trim()) {
      mostrarToast("Por favor ingresa un código", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/api/ofertas/validar/${codigoManual}`);
      const data = res.data;

      if (data.success) {
        setValidacion(data);

        if (data.valido) {
          mostrarToast(data.mensaje, "success");
          if (data.productos && data.productos.length > 0) {
            setProductosFiltrados(data.productos);
          }
        } else {
          mostrarToast(data.mensaje, "error");
        }
      }

    } catch (err) {
      console.error("Error:", err);
      mostrarToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorCodigo = (codigo) => {
    const filtrados = productos.filter(p =>
      p.codigo_mostrar === codigo || p.codigo_promocion === codigo
    );
    setProductosFiltrados(filtrados);
    setValidacion(null);
    setCodigoManual("");

    if (filtrados.length > 0) {
      mostrarToast(`${filtrados.length} productos encontrados`, "info");
    } else {
      mostrarToast("No hay productos con este código", "warning");
    }
  };

  const limpiarFiltros = () => {
    setProductosFiltrados(productos);
    setValidacion(null);
    setCodigoManual("");
    mostrarToast("Mostrando todos los productos", "info");
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-CO");
  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    mostrarToast(`Código copiado: ${codigo}`, "success");
  };

  const codigosVigentes = codigos.filter(codigo => !codigo.esta_expirado);

  return (
    <>
      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.tipo}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {toast.mensaje}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="layout-ofertas">
        <div className="left-column">
          <button
            className="btn-volver-inicio"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Volver al inicio
          </button>
          <h2 className="section-title">Códigos de Descuento</h2>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Cargando...</div>
          ) : codigosVigentes.length === 0 ? (
            <div className="no-data">No hay códigos disponibles</div>
          ) : (
            <div className="codigos-list">
              {codigosVigentes.map(codigo => {
                const expirado = codigo.esta_expirado;
                return (
                  <motion.div
                    key={`${codigo.tipo}-${codigo.id}`}
                    className={`codigo-card ${expirado ? 'expirado' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="codigo-header">
                      <strong className="codigo-nombre">{codigo.codigo_mostrar}</strong>
                      <span className="codigo-valor">{codigo.valor_formateado}</span>
                    </div>

                    <div className="codigo-body">
                      <p className="codigo-descripcion">{codigo.nombre}</p>
                      <div className="codigo-tiempo">
                        {expirado ? (
                          <span className="tiempo-expirado">Expirado</span>
                        ) : codigo.dias_restantes > 0 ? (
                          <span className="tiempo-restante">{codigo.dias_restantes} días restantes</span>
                        ) : <span>Finaliza hoy</span>}
                      </div>
                      <div className="codigo-fechas">
                        <div className="fecha-item">
                          <span>Válido hasta:</span>
                          <span>{formatearFecha(codigo.fecha_fin)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="codigo-actions">
                      <button
                        className="btn-ver"
                        onClick={() => filtrarPorCodigo(codigo.codigo_mostrar)}
                        disabled={expirado}
                      >
                        Ver productos
                      </button>

                      {codigo.tipo === 'descuento' && !codigo.es_sin_codigo && (
                        <button
                          className="btn-copiar"
                          onClick={() => copiarCodigo(codigo.codigo_mostrar)}
                        >
                          Copiar
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="validador-container">
            <h2 className="section-title">Validar Código</h2>
            <div className="validador-box">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ingresa un código de descuento..."
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && validarCodigo()}
                  disabled={loading}
                />
                <button
                  onClick={validarCodigo}
                  className="btn-validar"
                  disabled={loading || !codigoManual.trim()}
                >
                  {loading ? "Validando..." : "Validar"}
                </button>
              </div>

              {validacion && (
                <motion.div
                  className={`resultado-validacion ${validacion.valido ? 'valido' : 'invalido'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="resultado-header">
                    <strong>{validacion.valido ? "Código Válido" : "Código Inválido"}</strong>
                  </div>
                  <p className="resultado-mensaje">{validacion.mensaje}</p>
                  {validacion.valido && validacion.promocion && (
                    <div className="descuento-info">
                      <p><strong>Promoción:</strong> {validacion.promocion.nombre_descuento || validacion.promocion.nombre_oferta}</p>
                      <p><strong>Productos encontrados:</strong> {validacion.productos?.length || 0}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          <div className="productos-container">
            <div className="productos-header">
              <h2 className="section-title">
                {productosFiltrados.length === productos.length
                  ? `Productos con Descuento (${productos.length})`
                  : `Productos Filtrados (${productosFiltrados.length})`}
              </h2>

              {productosFiltrados.length !== productos.length && (
                <button className="btn-limpiar" onClick={limpiarFiltros}>
                  Mostrar todos
                </button>
              )}
            </div>

            {loading ? (
              <div className="loading">Cargando productos...</div>
            ) : productosFiltrados.length === 0 ? (
              <div className="no-data">
                <p>No hay productos disponibles</p>
                <button onClick={cargarDatos} className="btn-recargar">
                  Recargar
                </button>
              </div>
            ) : (
              <div className="productos-grid">
                {productosFiltrados.map((producto, index) => (
                  <motion.div
                    key={`${producto.id_producto}-${index}`}
                    className="producto-card"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="producto-imagen" onClick={() => setModalProducto(producto)}>
                      <img
                        src={producto.url_imagen || "https://via.placeholder.com/300x200?text=Sin+Imagen"}
                        alt={producto.nombre_producto}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen"; }}
                      />
                      {producto.descuento_info && (
                        <span className="badge-descuento">{producto.descuento_info}</span>
                      )}
                    </div>
                    <div className="producto-info">
                      <h3 className="producto-nombre">{producto.nombre_producto}</h3>
                      <p className="producto-descripcion">
                        {producto.descripcion_producto?.substring(0, 80) || "Sin descripción"}
                        {producto.descripcion_producto?.length > 80 && "..."}
                      </p>
                      <div className="producto-categoria">
                        {producto.categoria_nombre} • {producto.subcategoria_nombre}
                      </div>
                      <div className="producto-precios">
                        {producto.tiene_descuento || producto.tiene_oferta ? (
                          <>
                            <div className="precio-container">
                              <span className="precio-original">${producto.precio_original_format}</span>
                              <span className="precio-final">${producto.precio_final_format}</span>
                            </div>
                            <span className="ahorro">
                              Ahorras: ${COP(producto.precio_original - producto.precio_final)}
                            </span>
                          </>
                        ) : (
                          <span className="precio-final">${producto.precio_original_format}</span>
                        )}
                      </div>
                      <div className="producto-detalles">
                        <div>Unidad: {producto.unidad_medida}</div>
                        <div>Stock: {producto.cantidad || "Disponible"}</div>
                      </div>
                      <div className="producto-codigo">
                        Código: <strong>{producto.codigo_mostrar}</strong>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalProducto && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalProducto(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setModalProducto(null)}>×</button>
              <div className="modal-imagen">
                <img
                  src={modalProducto.url_imagen || "https://via.placeholder.com/500x350?text=Sin+Imagen"}
                  alt={modalProducto.nombre_producto}
                />
              </div>
              <div className="modal-info">
                <h2>{modalProducto.nombre_producto}</h2>
                <p className="modal-descripcion">{modalProducto.descripcion_producto || "No hay descripción disponible."}</p>
                <div className="modal-precio-container">
                  {modalProducto.tiene_descuento || modalProducto.tiene_oferta ? (
                    <>
                      <div className="precio-original-modal">
                        <span className="label">Precio original:</span>
                        <span className="valor tachado">${modalProducto.precio_original_format}</span>
                      </div>
                      <div className="precio-final-modal">
                        <span className="label">Precio con descuento:</span>
                        <span className="valor destacado">${modalProducto.precio_final_format}</span>
                      </div>
                      <div className="ahorro-modal">
                        <span className="label">Ahorras:</span>
                        <span className="valor ahorro">${COP(modalProducto.precio_original - modalProducto.precio_final)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="precio-final-modal">
                      <span className="label">Precio:</span>
                      <span className="valor">${modalProducto.precio_original_format}</span>
                    </div>
                  )}
                  <div className="codigo-modal">
                    <span className="label">Código:</span>
                    <span className="codigo-valor">{modalProducto.codigo_mostrar}</span>
                  </div>
                </div>
                <div className="modal-detalles">
                  <p><strong>Unidad:</strong> {modalProducto.unidad_medida}</p>
                  <p><strong>Stock:</strong> {modalProducto.cantidad || "No especificado"}</p>
                  <p><strong>Categoría:</strong> {modalProducto.categoria_nombre}</p>
                  <p><strong>Subcategoría:</strong> {modalProducto.subcategoria_nombre}</p>
                </div>
                <div className="modal-actions">
                  <button className="btn-comprar" onClick={() => { mostrarToast("Producto agregado al carrito", "success"); setModalProducto(null); }}>
                    Agregar al carrito
                  </button>
                  <button className="btn-cerrar" onClick={() => setModalProducto(null)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
