import React, { useState, useEffect, useRef } from 'react';
import '../styles/PageReportes.css';
import { 
  getFinanzasDataAdmin,
  getVentasPorMesAdmin,
  getProductosMasVendidosAdmin,
  getOrdenesEstadoAdmin,
  getReportAdmin 
} from '../services/reportService';
import ToastNotification from '../../../../components/ToastNotification';
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { formatoCOP } from "../../../../utils/format";

// Helpers para formateo
const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    try {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    } catch { return val; }
};

const formatDate = (val) => {
    if (!val) return '-';
    try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d.toLocaleDateString('es-CO');
    } catch { return val; }
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function PageReportes() {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Estado para la vista detallada (Tabla/Preview)
  const [viewMode, setViewMode] = useState(null); // 'table' | 'preview' | null
  const [activeReportId, setActiveReportId] = useState(null);
  const [reportContent, setReportContent] = useState(null); // Datos JSON o HTML
  const [localSearch, setLocalSearch] = useState(""); // Filtro local para tabla
  const detailedViewRef = useRef(null);

  // Financial Data State
  const [finanzas, setFinanzas] = useState(null);
  const [ventasData, setVentasData] = useState([]);
  const [productosData, setProductosData] = useState([]);
  const [ordenesData, setOrdenesData] = useState({});
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
        try {
            const [finanzasResult, ventasJson, productosJson, ordenesJson] = await Promise.all([
                getFinanzasDataAdmin(),
                getVentasPorMesAdmin(),
                getProductosMasVendidosAdmin(),
                getOrdenesEstadoAdmin(),
            ]);

            // Set Financial Data
            if (finanzasResult && typeof finanzasResult === 'object') {
                const { ingresos, costos, ganancia } = finanzasResult;
                setFinanzas({
                    ingresos: {
                        completados: Number(ingresos?.completados) || 0,
                        pendientes: Number(ingresos?.pendientes) || 0,
                        total: Number(ingresos?.total) || 0
                    },
                    costos: {
                        completados: Number(costos?.completados) || 0,
                        pendientes: Number(costos?.pendientes) || 0,
                        total: Number(costos?.total) || 0
                    },
                    ganancia: {
                        actual: Number(ganancia?.actual) || 0,
                        potencial: Number(ganancia?.potencial) || 0,
                        total: Number(ganancia?.total) || 0
                    }
                });
            }

            // Set Sales Data
            if (Array.isArray(ventasJson)) {
                setVentasData(ventasJson.map(v => ({
                    mes: v.mes,
                    totalVentas: Number(v.totalVentas) || 0,
                    ventasPendientes: Number(v.ventasPendientes) || 0
                })));
            }

            // Set Products Data
            if (Array.isArray(productosJson)) {
                setProductosData(productosJson.map(p => ({
                    nombre_producto: p.nombre_producto || 'Sin nombre',
                    cantidadVendida: Number(p.cantidadVendida) || 0
                })));
            }

            // Set Orders Data
            if (ordenesJson && typeof ordenesJson === 'object') {
                setOrdenesData({
                    activas: Number(ordenesJson.activas) || 0,
                    completadas: Number(ordenesJson.completadas) || 0
                });
            }

        } catch (err) {
            console.error("Error cargando datos de admin:", err);
            setErrorData("Error al cargar las estadísticas globales.");
        } finally {
            setDataLoading(false);
        }
    };

    fetchAdminData();
  }, []);

  const reportTypes = [
    { 
      id: 'productos', 
      title: 'Reporte Global de Productos', 
      description: 'Inventario completo de todos los productores.',
      icon: '📦'
    },
    { 
      id: 'inventario', 
      title: 'Inventario Global', 
      description: 'Estado del stock y movimiento de mercancía en la plataforma.',
      icon: '📊'
    },
    { 
      id: 'pedidos', 
      title: 'Ventas Globales', 
      description: 'Historial de transacciones de todos los clientes y productores.',
      icon: '🛍️'
    },
    { 
      id: 'descuentos', 
      title: 'Descuentos Activos', 
      description: 'Promociones vigentes en la plataforma.',
      icon: '🏷️'
    }
  ];

  const handleDownload = async (type, format, title) => {
    setLoading(true);
    try {
      const data = await getReportAdmin(type, format);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `reporte_admin_${type}_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ show: true, message: `Reporte de ${title} descargado correctamente.`, type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Error al descargar el reporte.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (type, mode) => {
      setLoading(true);
      setActiveReportId(type);
      setViewMode(mode);
      setReportContent(null);
      
      try {
          // Si es preview, pedimos html, si es tabla pedimos json
          const format = mode === 'preview' ? 'html' : 'json'; 
          const data = await getReportAdmin(type, format);
          setReportContent(data);
          
          setTimeout(() => {
              detailedViewRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);

      } catch (error) {
          console.error(error);
          setToast({ show: true, message: 'Error al cargar los detalles.', type: 'error' });
      } finally {
          setLoading(false);
      }
  };

  const closeDetailedView = () => {
      setViewMode(null);
      setActiveReportId(null);
      setReportContent(null);
  };

  // Chart Configurations
  const ventasChartConfig = {
    labels: (ventasData || []).map((d) => `Mes ${d.mes}`),
    datasets: [
        {
            label: "Ventas Totales (COP)",
            data: (ventasData || []).map((d) => d.totalVentas),
            backgroundColor: "rgba(69, 184, 16, 0.6)", // Verde Admin
            borderColor: "rgba(69, 184, 16, 1)",
            tension: 0.3,
            fill: true
        },
        {
            label: "Ventas Pendientes (COP)",
            data: (ventasData || []).map((d) => d.ventasPendientes),
            backgroundColor: "rgba(255, 193, 7, 0.6)", // Amarillo Warning
            borderColor: "rgba(255, 193, 7, 1)",
            tension: 0.3,
            fill: true
        }
    ],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                beginAtZero: true,
                stacked: true,
                ticks: {
                    callback: function(value) {
                        try { return formatoCOP(Number(value)); } catch(e) { return `$${value}` }
                    }
                }
            },
            x: { stacked: true }
        }
    }
  };

  const productosChartConfig = {
    labels: (productosData || []).map((d) => d.nombre_producto || 'Sin nombre'),
    datasets: [
        {
            label: "Unidades Vendidas",
            data: (productosData || []).map((d) => d.cantidadVendida),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
        },
    ],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    }
  };

  const ordenesChartConfig = {
    labels: ["Órdenes Activas", "Órdenes Completadas"],
    datasets: [
        {
            data: [
                Number(ordenesData?.activas) || 0, 
                Number(ordenesData?.completadas) || 0
            ],
            backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(75, 192, 192, 0.7)",
            ],
            borderColor: ["#fff", "#fff"],
            borderWidth: 2,
        },
    ],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' }
        }
    }
  };

  return (
    <div className="page-container">
      {toast.show && (
        <ToastNotification 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="page-header">
        <h1>Panel de Administración Global</h1>
        <p style={{color:'#666', marginTop:'5px'}}>Resumen de toda la plataforma AgroSoft</p>
      </div>

      {dataLoading ? (
         <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div> Cargando estadísticas globales...
         </div>
      ) : errorData ? (
         <div className="error-message" style={{ color: 'red', textAlign: 'center', margin: '20px' }}>{errorData}</div>
      ) : (
         <>
            {/* Visual Charts Section */}
            <div className="charts-container">
                {finanzas && (
                    <>
                        <div className="chart-card financial-card ingresos">
                            <h4>Ingresos Totales (Plataforma)</h4>
                            <div className="financial-details" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                <div className="detail-row">
                                    <span>Completados:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.ingresos.completados)}</p>
                                </div>
                                <div className="detail-row">
                                    <span>Pendientes:</span>
                                    <p className="cifra-small pendiente">{formatoCOP(finanzas.ingresos.pendientes)}</p>
                                </div>
                                <div className="detail-row total">
                                    <span>Gran Total:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.ingresos.total)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card financial-card costos">
                            <h4>Costos Operativos Globales</h4>
                            <div className="financial-details" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                <div className="detail-row">
                                    <span>Ejecutados:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.costos.completados)}</p>
                                </div>
                                <div className="detail-row">
                                    <span>Pendientes:</span>
                                    <p className="cifra-small pendiente">{formatoCOP(finanzas.costos.pendientes)}</p>
                                </div>
                                <div className="detail-row total">
                                    <span>Total:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.costos.total)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="chart-card financial-card ganancia">
                            <h4>Balance Global</h4>
                            <div className="financial-details" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                <div className="detail-row">
                                    <span>Actual:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.ganancia.actual)}</p>
                                </div>
                                <div className="detail-row">
                                    <span>Potencial:</span>
                                    <p className="cifra-small pendiente">{formatoCOP(finanzas.ganancia.potencial)}</p>
                                </div>
                                <div className="detail-row total">
                                    <span>Total:</span>
                                    <p className="cifra-small">{formatoCOP(finanzas.ganancia.total)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            
                <div className="chart-card">
                    <h4>Ventas Globales por Mes</h4>
                    <div className="chart-wrapper">
                        <Line data={ventasChartConfig} options={ventasChartConfig.options} />
                    </div>
                </div>

                <div className="chart-card">
                    <h4>Top Productos (Todos los vendedores)</h4>
                    <div className="chart-wrapper">
                        <Bar data={productosChartConfig} options={productosChartConfig.options} />
                    </div>
                </div>

                <div className="chart-card">
                    <h4>Estado de Órdenes (Plataforma)</h4>
                    <div className="chart-wrapper">
                        <Doughnut data={ordenesChartConfig} options={ordenesChartConfig.options} />
                    </div>
                </div>
            </div>
         </>
      )}

      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#45b810' }}>Reportes Generales del Sistema</h2>
      
      <div className="reports-grid">
        {reportTypes.map((report) => (
          <div key={report.id} className={`report-card ${activeReportId === report.id ? 'active-card' : ''}`}>
            <div>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{report.icon}</div>
                <h3>{report.title}</h3>
                <p>{report.description}</p>
            </div>
            <div className="report-actions">
              <button 
                className="btn-report btn-table" 
                onClick={() => handleViewDetails(report.id, 'table')}
                disabled={loading}
              >
                📋 Tabla
              </button>
              <button 
                className="btn-report btn-preview" 
                onClick={() => handleViewDetails(report.id, 'preview')}
                disabled={loading}
              >
                👁️ Vista
              </button>
              <button 
                className="btn-report btn-pdf" 
                onClick={() => handleDownload(report.id, 'pdf', report.title)}
                disabled={loading}
              >
                PDF
              </button>
              <button 
                className="btn-report btn-excel" 
                onClick={() => handleDownload(report.id, 'excel', report.title)}
                disabled={loading}
              >
                XLS
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="spinner"></div> Procesando solicitud...
        </div>
      )}

      {/* DETAILED VIEW SECTION */}
      {viewMode && reportContent && (
          <div ref={detailedViewRef} className="detailed-view-section">
              <div className="section-title">
                  <span>
                      {viewMode === 'table' ? '📋 Datos Tabulares: ' : '👁️ Vista Previa: '} 
                      {reportTypes.find(r => r.id === activeReportId)?.title}
                  </span>
                  <button className="btn-close-section" onClick={closeDetailedView}>
                      ✕ Cerrar
                  </button>
              </div>

              <div className="view-content">
                  {viewMode === 'table' && Array.isArray(reportContent) && (
                      <div className="table-wrapper">
                          <input
                            type="text"
                            placeholder="Filtrar resultados en la tabla..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            style={{ 
                                padding: '8px', 
                                marginBottom: '10px', 
                                width: '300px', 
                                border: '1px solid #ccc', 
                                borderRadius: '4px' 
                            }}
                          />
                          <table>
                              <thead>
                                  <tr>
                                      {reportContent.length > 0 && Object.keys(reportContent[0]).map(key => (
                                          <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody>
                                  {reportContent
                                    .filter(row => {
                                        // eslint-disable-next-line no-unused-vars
                                        if (!localSearch) return true;
                                        return Object.values(row).some(val => 
                                            String(val).toLowerCase().includes(localSearch.toLowerCase())
                                        );
                                    })
                                    .map((row, idx) => (
                                      <tr key={idx}>
                                          {Object.entries(row).map(([key, val], i) => {
                                              let displayVal = val;
                                              // Detectar moneda o fecha por nombre de columna (heurística simple)
                                              if (['precio', 'total', 'subtotal', 'valor', 'ingresos', 'costos', 'ganancia', 'valor_inventario'].some(k => key.toLowerCase().includes(k))) {
                                                  displayVal = formatCurrency(val);
                                              } else if (['fecha', 'date', 'created'].some(k => key.toLowerCase().includes(k))) {
                                                  displayVal = formatDate(val);
                                              } else {
                                                  displayVal = val !== null && val !== undefined ? String(val) : '-';
                                              }
                                              return <td key={i}>{displayVal}</td>;
                                          })}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                          <div className="table-info">
                              Total registros: {reportContent.length}
                          </div>
                      </div>
                  )}

                  {viewMode === 'table' && (!Array.isArray(reportContent) || reportContent.length === 0) && (
                      <p>No hay datos disponibles para mostrar en la tabla.</p>
                  )}

                  {viewMode === 'preview' && (
                       <iframe
                          className="preview-iframe"
                          srcDoc={reportContent}
                          title="Reporte Preview"
                      />
                  )}
              </div>
          </div>
      )}
    </div>
  );
}
