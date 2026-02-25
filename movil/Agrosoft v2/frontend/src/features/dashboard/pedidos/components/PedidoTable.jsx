import React from 'react';

import { formatoCOP } from "../../../../utils/format";

const getStatusClass = (s) => {
  if (!s) return "status-Pendiente";
  return `status-${String(s).replace(/\s+/g, "")}`;
};

const PedidoTable = ({ ordenes, onEstadoChange, onPreviewComprobante, onDownloadComprobante }) => {
  return (
    <table className="orders-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Dirección</th>
          <th>Ciudad</th>
          <th>Seguimiento</th>
          <th>Acciones</th>
          <th>Comprobante</th>
        </tr>
      </thead>
      <tbody>
        {ordenes.length > 0 ? (
          ordenes.map((orden) => (
            <tr key={orden.id_pedido}>
              <td>{orden.id_pedido}</td> 
              <td>{orden.Cliente ? orden.Cliente.nombre_usuario : (orden.cliente || "N/A")}</td>
              <td>{new Date(orden.fecha_pedido).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${getStatusClass(orden.estado)}`}>
                  {orden.estado}
                </span>
              </td>
              <td style={{ maxWidth: "200px", fontSize: "0.85em" }}>{orden.productos_resumen || "—"}</td>
              <td>{formatoCOP(orden.total)}</td>
         
              <td>{orden.direccion_envio || "N/A"}</td>
              <td>{orden.ciudad_envio || "N/A"}</td>
              <td>{orden.numero_seguimiento || "—"}</td>
              <td>
                <select
                  className="form-select"
                  aria-label={`Cambiar estado orden ${orden.id_pedido}`}
                  value={orden.estado}
                  onChange={(e) => onEstadoChange(orden.id_pedido, e.target.value)}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Procesando">Procesando</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </td>
              <td className="comprobante-buttons">
                <button
                  className="btn-preview"
                  onClick={() => onPreviewComprobante(orden.id_pedido)}
                  title="Previsualizar comprobante"
                >
                    Ver
                </button>
                <button
                  className="btn-download"
                  onClick={() => onDownloadComprobante(orden.id_pedido)}
                  title="Descargar comprobante"
                >
                  ⬇️ Descargar
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="11">No hay órdenes para mostrar.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default PedidoTable;
