import React, { useState, useEffect } from "react";
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
import {
    getFinanzasData,
    getVentasPorMes,
    getProductosMasVendidos,
    getOrdenesEstado,
} from "../services/finanzaService";
import { formatoCOP } from "../utils/format";
import ReportesProductor from "../components/ReportesProductor";
import "../style/finanza.css";
import "../style/graficas.css";

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

const getLoggedUserId = () => {
    try {
        // CLAVE MODIFICADA DE "usuarioLogueado" A "user"
        const userData = JSON.parse(localStorage.getItem("user")); // <<-- CAMBIAR AQUÍ

        if (userData) {
            // ... el resto de la lógica de id_usuario || idUsuario es correcta.
            const userId = userData.id_usuario || userData.idUsuario;

            if (userId) {
                return userId; // Devuelve el ID del productor logueado
            }
        }

        console.warn("No se encontró el objeto de usuario o la clave del ID (id_usuario/idUsuario) en localStorage.");
        return null;
    } catch (error) {
        console.error("Error al obtener el usuario logueado:", error);
        return null;
    }
};
export default function Finanza() {
    const [finanzas, setFinanzas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [ventasData, setVentasData] = useState([]);
    const [productosData, setProductosData] = useState([]);
    const [ordenesData, setOrdenesData] = useState({});

    // Estados para filtros y reportes
    const [filterType, setFilterType] = useState("ventas"); // ventas, productos, ordenes
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReports, setShowReports] = useState(false);

    const ID_USUARIO_ACTUAL = getLoggedUserId();

    useEffect(() => {
        const fetchData = async () => {
            if (!ID_USUARIO_ACTUAL) {
                setError("No se encontró el ID del productor. Inicia sesión nuevamente.");
                setLoading(false);
                return;
            }

            try {
                console.log("Iniciando carga de datos para usuario:", ID_USUARIO_ACTUAL);
                
                const [finanzasResult, ventasJson, productosJson, ordenesJson] = await Promise.all([
                    getFinanzasData(ID_USUARIO_ACTUAL),
                    getVentasPorMes(ID_USUARIO_ACTUAL),
                    getProductosMasVendidos(ID_USUARIO_ACTUAL),
                    getOrdenesEstado(ID_USUARIO_ACTUAL),
                ]);

                console.log("Datos recibidos:", {
                    finanzas: finanzasResult,
                    ventas: ventasJson,
                    productos: productosJson,
                    ordenes: ordenesJson
                });

                // Validar y establecer datos financieros
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

                // Validar y establecer datos de ventas
                if (Array.isArray(ventasJson)) {
                    setVentasData(ventasJson.map(v => ({
                        mes: v.mes,
                        totalVentas: Number(v.totalVentas) || 0
                    })));
                }

                // Validar y establecer datos de productos
                if (Array.isArray(productosJson)) {
                    setProductosData(productosJson.map(p => ({
                        nombre_producto: p.nombre_producto || 'Sin nombre',
                        cantidadVendida: Number(p.cantidadVendida) || 0
                    })));
                }

                // Validar y establecer datos de órdenes
                if (ordenesJson && typeof ordenesJson === 'object') {
                    setOrdenesData({
                        activas: Number(ordenesJson.activas) || 0,
                        completadas: Number(ordenesJson.completadas) || 0
                    });
                }

            } catch (err) {
                console.error("Error detallado al cargar datos:", err);
                let mensajeError = "Error al cargar los datos. ";
                
                if (err.response?.status === 401) {
                    mensajeError += "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
                } else if (err.response?.data?.error) {
                    mensajeError += err.response.data.error;
                } else {
                    mensajeError += "Por favor, intenta de nuevo más tarde.";
                }
                
                setError(mensajeError);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ID_USUARIO_ACTUAL]);

    // formatoCOP ahora importado desde ../utils/format

    const ventasChartConfig = {
        labels: (ventasData || []).map((d) => `Mes ${d.mes}`),
        datasets: [
            {
                label: "Ventas Completadas (COP)",
                data: (ventasData || []).map((d) => d.totalVentas),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1,
                fill: true
            },
            {
                label: "Ventas Pendientes (COP)",
                data: (ventasData || []).map((d) => d.ventasPendientes),
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderColor: "rgba(255, 159, 64, 1)",
                tension: 0.1,
                fill: true
            }
        ],
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // Usamos formato colombiano para ejes
                        callback: function(value) {
                            try { return formatoCOP(Number(value)); } catch(e) { return `$${value}` }
                        }
                    },
                    stacked: true
                },
                x: {
                    stacked: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label ? context.dataset.label + ': ' : '';
                            const v = context.parsed?.y ?? context.raw ?? 0;
                            try { return label + formatoCOP(Number(v)); } catch(e) { return label + v }
                        }
                    }
                },
                legend: {
                    labels: { usePointStyle: true }
                }
            }
        }
    };

    const productosChartConfig = {
        labels: (productosData || []).map((d) => d.nombre_producto || 'Sin nombre'),
        datasets: [
            {
                label: "Cantidad Vendida",
                data: (productosData || []).map((d) => d.cantidadVendida),
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
        ],
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
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
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                ],
                borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
                borderWidth: 1,
            },
        ],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    };

    if (loading)
        return <div className="loading-message">Cargando datos financieros...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!finanzas)
        return (
            <div className="no-data-message">
                No se encontraron datos financieros.
            </div>
        );

    return (
        <div className="finanza-container">
            <h1 className="finanza-title">
                Reportes Visuales (Productor ID: {ID_USUARIO_ACTUAL})
            </h1>

            <div id="contenedorReportes">
                <div className="card">
                    <h4 className="text-center">Ventas por Mes</h4>
                    <div className="chart-wrapper">
                        <Line
                            data={ventasChartConfig}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                <div className="card">
                    <h4 className="text-center">Productos Más Vendidos</h4>
                    <div className="chart-wrapper">
                        <Bar
                            data={productosChartConfig}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                <div className="card">
                    <h4 className="text-center">Órdenes Activas vs Completadas</h4>
                    <div className="chart-wrapper">
                        <Doughnut
                            data={ordenesChartConfig}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </div>
                </div>

                <div className="card ingresos-chart">
                    <h4 className="text-center">Ingresos</h4>
                    <div className="financial-details">
                        <div className="detail-row">
                            <span>Completados:</span>
                            <p className="cifra-small">{formatoCOP(finanzas.ingresos.completados)}</p>
                        </div>
                        <div className="detail-row">
                            <span>Pendientes:</span>
                            <p className="cifra-small pendiente">{formatoCOP(finanzas.ingresos.pendientes)}</p>
                        </div>
                        <div className="detail-row total">
                            <span>Total:</span>
                            <p className="cifra-small">{formatoCOP(finanzas.ingresos.total)}</p>
                        </div>
                    </div>
                </div>

                <div className="card costos-chart">
                    <h4 className="text-center">Costos</h4>
                    <div className="financial-details">
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

                <div className="card ganancia-chart">
                    <h4 className="text-center">Ganancia</h4>
                    <div className="financial-details">
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
            </div>

            {/* Sección de Reportes Detallados */}
            {showReports && (
                <div style={{ marginTop: '40px' }}>
                    <h2 className="finanza-title">📋 Reportes Filtrados</h2>
                    <div className="finanza-reports-container">
                        {/* LISTA */}
                        <div className="finanza-report-list">
                            <div className="finanza-report-list-header">
                                {filterType === "ventas" && "📈 Ventas por Mes"}
                                {filterType === "productos" && "🛒 Productos"}
                                {filterType === "ordenes" && "📦 Órdenes"}
                            </div>
                            <div className="finanza-report-list-items">
                                {filterType === "ventas" && ventasData.length > 0 && ventasData.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className={`finanza-report-item ${selectedReport?.id === `venta-${idx}` ? 'active' : ''}`}
                                        onClick={() => setSelectedReport({ id: `venta-${idx}`, data: item, type: 'ventas' })}
                                    >
                                        <span className="finanza-report-item-label">Mes {item.mes}</span>
                                        <span className="finanza-report-item-value">{formatoCOP(item.totalVentas)}</span>
                                    </div>
                                ))}
                                {filterType === "productos" && productosData.length > 0 && productosData.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className={`finanza-report-item ${selectedReport?.id === `prod-${idx}` ? 'active' : ''}`}
                                        onClick={() => setSelectedReport({ id: `prod-${idx}`, data: item, type: 'productos' })}
                                    >
                                        <span className="finanza-report-item-label">{item.nombre_producto}</span>
                                        <span className="finanza-report-item-value">{item.cantidadVendida} ud</span>
                                    </div>
                                ))}
                                {filterType === "ordenes" && (
                                    <>
                                        <div 
                                            className={`finanza-report-item ${selectedReport?.id === 'orden-activas' ? 'active' : ''}`}
                                            onClick={() => setSelectedReport({ id: 'orden-activas', data: { tipo: 'Activas', cantidad: ordenesData.activas }, type: 'ordenes' })}
                                        >
                                            <span className="finanza-report-item-label">Órdenes Activas</span>
                                            <span className="finanza-report-item-value">{ordenesData.activas}</span>
                                        </div>
                                        <div 
                                            className={`finanza-report-item ${selectedReport?.id === 'orden-completadas' ? 'active' : ''}`}
                                            onClick={() => setSelectedReport({ id: 'orden-completadas', data: { tipo: 'Completadas', cantidad: ordenesData.completadas }, type: 'ordenes' })}
                                        >
                                            <span className="finanza-report-item-label">Órdenes Completadas</span>
                                            <span className="finanza-report-item-value">{ordenesData.completadas}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* REPORTE DETALLADO */}
                        <div className="finanza-detailed-report">
                            {!selectedReport ? (
                                <div className="no-report-selected">
                                    <div>
                                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                                        <p>Selecciona un item de la lista para ver los detalles</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p>Reporte seleccionado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Nuevo componente de Reportes Detallados */}
            <ReportesProductor />
        </div>
    );
}