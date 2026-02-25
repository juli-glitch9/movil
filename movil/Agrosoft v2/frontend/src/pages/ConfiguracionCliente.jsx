import React, { useContext, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom"; // Importar useLocation para determinar el enlace activo
import { AuthContext } from "../context/AuthContext";
import "./ConfiguracionCliente.css"; // Asume que este archivo contiene el CSS del dashboard

// 🔥 Feather Icons (react-icons/fi)
import {
    FiUser, FiMapPin, FiCreditCard, FiGift, FiStar,
    FiShoppingBag, FiClock, FiTruck, FiMessageSquare,
    FiRotateCcw, FiHeart, FiEye, FiBell, FiFileText,
    FiHelpCircle, FiLogOut, FiPlusCircle, FiChevronDown, FiChevronRight,
    FiSettings, FiShield
} from "react-icons/fi";

// 1. Configuración de Menú: Datos de navegación centralizados y escalables
const sidebarConfig = [
    {
        label: "Mi Cuenta",
        icon: FiSettings,
        onAdd: () => alert("Añadir dirección!"),
        items: [
            { to: "/mi-cuenta/perfil", label: "Mi Perfil", icon: FiUser },
            { to: "/mi-cuenta/direcciones", label: "Direcciones", icon: FiMapPin },
            { to: "/mi-cuenta/pago", label: "Métodos de Pago", icon: FiCreditCard },
            { to: "/mi-cuenta/cupones", label: "Mis Cupones", icon: FiGift },
            { to: "/mi-cuenta/puntos", label: "Mis Puntos", icon: FiStar },
            { to: "/mi-cuenta/cartera", label: "Mi Cartera", icon: FiGift },
            { to: "/mi-cuenta/tarjetas-regalo", label: "Mis Tarjetas de Regalo", icon: FiGift },
        ]
    },
    {
        label: "Mis Pedidos",
        icon: FiShoppingBag,
        items: [
            { to: "/pedidos/todos", label: "Todos los Pedidos", icon: FiShoppingBag },
            { to: "/pedidos/impagados", label: "Impagados", icon: FiClock },
            { to: "/pedidos/proceso", label: "En Proceso", icon: FiClock },
            { to: "/pedidos/enviados", label: "Enviados", icon: FiTruck },
            { to: "/pedidos/comentados", label: "Comentados", icon: FiMessageSquare },
            { to: "/pedidos/devueltos", label: "Devueltos", icon: FiRotateCcw },
        ]
    },
    {
        label: "Mis Intereses",
        icon: FiHeart,
        items: [
            { to: "/intereses/deseos", label: "Lista De Deseos", icon: FiHeart },
            { to: "/intereses/visto", label: "Visto Recientemente", icon: FiEye },
            { to: "/intereses/seguir", label: "Seguir", icon: FiUser },
        ]
    },
    {
        label: "Servicio Al Cliente",
        icon: FiHelpCircle,
        items: [
            { to: "/servicio/registros", label: "Registros De Servicio", icon: FiFileText },
            { to: "/servicio/contacto", label: "Contáctanos", icon: FiHelpCircle },
        ]
    },
    {
        label: "Política",
        icon: FiShield,
        onAdd: () => alert("Abrir Privacidad y Seguridad"),
        items: [
            { to: "/politica/envio", label: "Información De Envío", icon: FiFileText },
            { to: "/politica/devoluciones", label: "Devoluciones", icon: FiRotateCcw },
            { to: "/politica/privacidad", label: "Política De Privacidad", icon: FiFileText },
            { to: "/politica/reembolso", label: "Reembolso", icon: FiGift },
            { to: "/politica/pago", label: "Método de Pago", icon: FiCreditCard },
            { to: "/politica/wallet", label: "SHEIN Wallet", icon: FiGift },
            { to: "/politica/puntos", label: "Puntos", icon: FiStar },
            { to: "/politica/cupones", label: "Cupones", icon: FiGift },
            { to: "/politica/vip", label: "SHEIN VIP", icon: FiStar },
            { to: "/politica/reseñas", label: "Reseñas", icon: FiMessageSquare },
            { to: "/politica/regalo", label: "Tarjeta de Regalo", icon: FiGift },
            { to: "/politica/rastrear", label: "Rastrear Pedido", icon: FiTruck },
            { to: "/politica/hacerpedido", label: "Cómo Hacer Un Pedido", icon: FiShoppingBag },
        ]
    },
];

const Plus = ({ onClick, title = "Añadir" }) => (
    <button className="plus-btn" onClick={onClick} title={title} aria-label={title}>
        <FiPlusCircle size={18} />
    </button>
);

/** Ítem lateral, mejorado para manejar la apertura basada en la ruta activa */
const SideItem = ({ label, onAdd, children, isDefaultOpen = false, currentPath }) => {
    const hasContent = React.Children.count(children) > 0;
    
    // Determina si alguno de los hijos es la ruta activa
    const isChildActive = useMemo(() => {
        if (!hasContent) return false;
        return React.Children.toArray(children).some(child => 
            child.props.to && currentPath.startsWith(child.props.to.replace(/\/$/, ""))
        );
    }, [children, currentPath, hasContent]);

    // Abre por defecto si se indica O si contiene la ruta actual
    const [open, setOpen] = useState(isDefaultOpen || isChildActive);

    // Si un hijo se activa, asegura que el padre esté abierto (efecto secundario)
    React.useEffect(() => {
        if (isChildActive) {
            setOpen(true);
        }
    }, [isChildActive]);

    return (
        <div className="side-item">
            <div className="side-head" onClick={() => hasContent && setOpen(!open)}>
                <span>{label}</span>
                <span className="side-actions">
                    {onAdd && (
                        <Plus
                            onClick={(e) => {
                                e.stopPropagation();
                                onAdd();
                            }}
                        />
                    )}
                    {hasContent &&
                        (open ? (
                            <FiChevronDown size={16} className="chev" />
                        ) : (
                            <FiChevronRight size={16} className="chev" />
                        ))}
                </span>
            </div>
            {hasContent && open && <div className="side-body">{children}</div>}
        </div>
    );
};

export default function ConfiguracionCliente() {
    // Hooks
    const { user, logout } = useContext(AuthContext); // Asumo que AuthContext provee una función logout
    const location = useLocation();
    const currentPath = location.pathname;

    // Handlers
    const openHelp = () =>
        window.open(
            "mailto:Agrosoft@gmail.com?subject=Soporte%20AgroSoft&body=Describe%20tu%20solicitud",
            "_blank"
        );
    
    // User data display
    const initials = (user?.nombre || user?.nombre_usuario || user?.email || 'U').charAt(0).toUpperCase();
    const displayName = user?.nombre || user?.nombre_usuario || user?.email || 'Usuario';
    const displayEmail = user?.email || user?.correo_electronico || '-';

    return (
        <div className="container-global">
            <div className="dashboard">
                {/* ----------------- SIDEBAR ----------------- */}
                <aside className="sidebar">
                    <div className="sidebar-title">Centro Personal</div>
                    <div className="sidebar-profile">
                        {user?.foto || user?.avatarUrl ? (
                            <img className="avatar-img" src={user?.foto || user?.avatarUrl} alt="Avatar" />
                        ) : (
                            <div className="avatar">{initials}</div>
                        )}

                        <div className="profile-info">
                            <div className="name">{displayName}</div>
                            <div className="email">{displayEmail}</div>
                            <div className="profile-stats">
                                <div className="stat">
                                    <FiGift className="stat-icon" />
                                    <div className="stat-body">
                                        <div className="stat-value">{user?.cupones ?? 0}</div>
                                        <div className="stat-label">Cupones</div>
                                    </div>
                                </div>
                                <div className="stat">
                                    <FiStar className="stat-icon" />
                                    <div className="stat-body">
                                        <div className="stat-value">{user?.puntos ?? 0}</div>
                                        <div className="stat-label">Puntos</div>
                                    </div>
                                </div>
                                <div className="stat">
                                    <FiGift className="stat-icon" />
                                    <div className="stat-body">
                                        <div className="stat-value">{user?.cartera ?? 0}</div>
                                        <div className="stat-label">Cartera</div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="edit-profile" 
                                onClick={() => window.location.href = '/mi-cuenta/perfil'}
                                aria-label="Editar perfil y detalles de la cuenta"
                            >
                                Editar perfil
                            </button>
                        </div>
                    </div>

                    {/* Menús generados a partir de la configuración */}
                    <div className="side-list">
                        {sidebarConfig.map((section, index) => (
                            <SideItem
                                key={index}
                                label={section.label}
                                onAdd={section.onAdd}
                                currentPath={currentPath}
                                isDefaultOpen={index === 0} // Abrir la primera sección por defecto
                            >
                                <div className="mini-list menu-links">
                                    {section.items.map(item => (
                                        <Link 
                                            key={item.to} 
                                            to={item.to} 
                                            className={`menu-link ${currentPath.startsWith(item.to.replace(/\/$/, "")) ? 'active' : ''}`}
                                        >
                                            {React.createElement(item.icon)} {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </SideItem>
                        ))}
                    </div>
                </aside>

                {/* ----------------- MAIN CONTENT ----------------- */}
                <main className="content">
                    <div className="content-inner">
                        <div className="welcome">
                            <div>
                                <div className="hello">Hola, {displayName}</div>
                                <div className="muted">Administra cupones, puntos, cartera y más</div>
                            </div>
                            {/* Ajuste: Quitar el quick-links del welcome y ponerlo como un módulo de tarjeta aparte */}
                        </div>

                        {/* Quick links como un Panel destacado (opcional, si el contenido central lo permite) 
                            * NOTA: Mantenemos la estructura original de quick-links para consistencia con tu CSS, pero se sugiere moverlo a un componente separado o a la derecha si es posible.
                        */}
                        <div className="quick-links">
                            <div className="quick-item"><FiGift /> Cupones</div>
                            <div className="quick-item"><FiStar /> Puntos</div>
                            <div className="quick-item"><FiGift /> Cartera</div>
                            <div className="quick-item"><FiGift /> Tarjeta de Regalo</div>
                        </div>

                        <div className="alert" role="alert">¡Tienes cupones a punto de expirar!</div>

                        <section className="orders-block">
                            <div className="orders-head">
                                <div className="title">Mis Pedidos</div>
                                <Link to="/ordenes" className="link">Ver todo</Link>
                            </div>

                            <div className="order-status">
                                <div className="status-item"><FiClock size={20} /> Procesando</div>
                                <div className="status-item"><FiTruck size={20} /> Enviado</div>
                                <div className="status-item"><FiMessageSquare size={20} /> Comentarios</div>
                                <div className="status-item"><FiRotateCcw size={20} /> Devolución</div>
                            </div>

                            <div className="orders-list">
                                <div className="order-row empty">No hay pedidos para mostrar</div>
                                {/* Ejemplo de un pedido activo (mantengo la estructura) */}
                                <div className="order-row">
                                    <Link to="/pedido/detalles">Detalles De Pedido</Link>
                                </div>
                            </div>
                        </section>
                    </div> {/* .content-inner */}
                </main>

                {/* ----------------- RIGHT PANEL ----------------- */}
                <aside className="rightbar">

                    <div className="panel">
                        <div className="panel-title">Perfil Rápido</div>
                        <div className="panel-body">
                            <div><strong>Nombre:</strong> {user?.nombre || "-"}</div>
                            <div><strong>Email:</strong> {user?.email || "-"}</div>
                            <div><strong>ID:</strong> {user?.id_usuario ?? "-"}</div>
                        </div>
                    </div>


                    <div className="panel">
                        <div className="panel-title">Servicio Al Cliente</div>
                        <div className="panel-actions">
                            <button className="btn-icon"><FiBell /> Mis Notificaciones</button>
                            <button className="btn-icon"><FiFileText /> Registros de Servicio</button>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <div className="panel-title">GUARDAR</div>
                            <Link to="/guardados" className="link small">Más</Link>
                        </div>
                        <div className="panel-body muted" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src="https://via.placeholder.com/60x80/EEEEEE/808080?text=IMG" alt="Producto guardado" style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: '6px' }} />
                            <span>Favoritos próximamente</span>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-title">Siguiente</div>
                        <div className="panel-body muted">0 Artículo</div>
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <div className="panel-title">Visto Recientemente</div>
                            <Link to="/historial" className="link small">Más</Link>
                        </div>
                        <div className="panel-body muted">
                            Sin historial
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-title">Soporte</div>
                        <div className="panel-actions">
                            <button className="btn-icon" onClick={openHelp}>
                                <FiHelpCircle /> Contacto: Agrosoft@gmail.com
                            </button>
                            <Link className="btn-icon" to="/pqrs"><FiFileText /> PQRS</Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

