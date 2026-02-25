import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getReporteProductos,
  getReporteInventario,
  getReportePedidos,
  getReporteDescuentos,
  descargarReportePDF,
  descargarReporteExcel,
  getReportePreview,
} from '../services/reportesService';
import '../style/reportes.css';

const ReportesProductor = () => {
  const [activeReport, setActiveReport] = useState('productos');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [error, setError] = useState(null);

  const reportes = useMemo(() => [
    { id: 'productos', name: ' Productos Registrados', service: getReporteProductos },
    { id: 'inventario', name: ' Inventario Actual', service: getReporteInventario },
    { id: 'pedidos', name: ' Ventas / Pedidos', service: getReportePedidos },
    { id: 'descuentos', name: ' Descuentos y Ofertas', service: getReporteDescuentos },
  ], []);

  // Cargar datos del reporte seleccionado
  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const report = reportes.find(r => r.id === activeReport);
      if (!report) throw new Error('Reporte no encontrado');

      const json = await report.service('json');
      setReportData(json);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando reporte:', err);
    } finally {
      setLoading(false);
    }
  }, [activeReport, reportes]);

  // Descargar como PDF
  const downloadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      await descargarReportePDF(activeReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Descargar como Excel
  const downloadExcel = async () => {
    try {
      setLoading(true);
      setError(null);
      await descargarReporteExcel(activeReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar preview
  const openPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const html = await getReportePreview(activeReport);
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <h2> Reportes del Productor</h2>
        <p>Visualiza y descarga tus reportes en PDF, Excel o HTML</p>
      </div>

      {/* Selector de reportes */}
      <div className="reportes-selector">
        {reportes.map(reporte => (
          <button
            key={reporte.id}
            className={`reporte-btn ${activeReport === reporte.id ? 'active' : ''}`}
            onClick={() => {
              setActiveReport(reporte.id);
              setPreviewOpen(false);
            }}
          >
            {reporte.name}
          </button>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controles de descarga */}
      <div className="reportes-controls">
        <button
          className="btn-preview"
          onClick={openPreview}
          disabled={loading}
        >
           Vista previa (HTML)
        </button>
        <button
          className="btn-pdf"
          onClick={downloadPDF}
          disabled={loading}
        >
           Descargar PDF
        </button>
        <button
          className="btn-excel"
          onClick={downloadExcel}
          disabled={loading}
        >
           Descargar Excel
        </button>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando reporte...</p>
        </div>
      )}

      {/* Tabla de datos JSON */}
      {!loading && reportData && !previewOpen && (
        <div className="reportes-table">
          <h3>Vista de datos (JSON)</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(reportData[0] || {}).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{String(val).substring(0, 50)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-info">{reportData.length} registros encontrados</p>
        </div>
      )}

      {/* Preview HTML */}
      {previewOpen && previewHtml && (
        <div className="preview-container">
          <div className="preview-header">
            <h3>Vista previa del reporte</h3>
            <button className="btn-close" onClick={() => setPreviewOpen(false)}>
              ✕ Cerrar
            </button>
          </div>
          <iframe
            className="preview-iframe"
            srcDoc={previewHtml}
            title="Reporte Preview"
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && !reportData && !previewOpen && (
        <div className="empty-state">
          <p>No hay datos disponibles para este reporte.</p>
        </div>
      )}
    </div>
  );
};

export default ReportesProductor;
