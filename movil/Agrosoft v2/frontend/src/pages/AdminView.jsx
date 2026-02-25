import { useEffect, useState } from "react";
import "../style/style.css";
import { formatoCOP, formatoCOPSinSimbolo, parsePrecioInput } from "../utils/format";
import {
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto,
} from "../services/productService";
import { getSubcategorias } from "../services/subcategoriaService";

const getLoggedUserId = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user")); 

    if (userData) {
      const userId = userData.id_usuario || userData.idUsuario;

      if (userId) {
        return userId; 
      }
    }

    console.warn("No se encontró el objeto de usuario o la clave del ID (id_usuario/idUsuario) en localStorage.");
    return null;
  } catch (error) {
    console.error("Error al obtener el usuario logueado:", error);
    return null;
  }
};

export default function AdminView() {
  const [productos, setProductos] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    precio_unitario: "",
    unidad_medida: "",
    cantidad: "",
    url_imagen_1: "",
    url_imagen_2: "",
    url_imagen_3: "",
    id_SubCategoria: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState(null);
  const [mostrarFormularioAnadir, setMostrarFormularioAnadir] = useState(true);

  useEffect(() => {
    const id = getLoggedUserId();
    if (!id) {
      setMensaje("Error: Debes iniciar sesión como productor.");
    } else {
      setIdUsuario(id);
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const nombre = userData?.nombre || (userData?.email ? userData.email.split('@')[0] : null);
        setNombreUsuario(nombre);
      } catch (e) {
        setNombreUsuario(null);
      }
      cargarProductos(id);
      cargarSubcategorias();
    }
  }, []);

  const cargarSubcategorias = async () => {
    try {
      const data = await getSubcategorias();
      setSubcategorias(data);
    } catch (err) {
      console.error("Error cargando subcategorías:", err);
      setMensaje("Error al cargar subcategorías. Revisa la conexión con el servidor.");
    }
  };

  const cargarProductos = async (id) => {
    try {
      const data = await getProductos(id);
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setMensaje("Error al cargar productos. Revisa la conexión con el servidor.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (
      !nuevo.nombre_producto ||
      !nuevo.descripcion_producto ||
      !nuevo.precio_unitario ||
      !nuevo.unidad_medida ||
      !nuevo.cantidad ||
      !nuevo.url_imagen_1 ||
      !nuevo.id_SubCategoria
    ) {
      setMensaje("Por favor llena al menos todos los campos requeridos y la primera imagen.");
      return;
    }

    // sanitize precio input (accepts thousand separators like '.' or ',')
    const precioParsed = parsePrecioInput(nuevo.precio_unitario);

    const productoAEnviar = {
      ...nuevo,
      url_imagen: nuevo.url_imagen_1,
      precio_unitario: precioParsed,
      cantidad: parseInt(nuevo.cantidad, 10),
      id_SubCategoria: parseInt(nuevo.id_SubCategoria, 10), 
      id_usuario: idUsuario,
    };

    if (isNaN(productoAEnviar.precio_unitario) || isNaN(productoAEnviar.cantidad) || isNaN(productoAEnviar.id_SubCategoria)) {
      setMensaje("Error de validación: Valor, Existencia o ID SubCategoría deben ser números válidos.");
      return;
    }

    if (!productoAEnviar.id_usuario) {
      setMensaje("Error: No se ha identificado el usuario productor. Intenta recargar la página.");
      return;
    }


    try {
      await addProducto(productoAEnviar); 

      setMensaje(" Producto añadido correctamente.");
      setNuevo({
        nombre_producto: "",
        descripcion_producto: "",
        precio_unitario: "",
        unidad_medida: "",
        cantidad: "",
        url_imagen_1: "",
        url_imagen_2: "",
        url_imagen_3: "",
        id_SubCategoria: "",
      });
      cargarProductos(idUsuario);
    } catch (err) {
      setMensaje(` Error al añadir producto: ${err.message}`);
      console.error(err);
    }
  };
  const handleEdit = async () => {
    if (!productoSeleccionado) {
      setMensaje("Selecciona un producto para editar.");
      return;
    }

    if (productoSeleccionado.id_usuario !== idUsuario) {
      setMensaje("Error: No puedes editar un producto que no es tuyo.");
      return;
    }

    try {
      console.log("📝 Iniciando edición de producto:", productoSeleccionado.nombre_producto);
      
      const precioParsed = parsePrecioInput(productoSeleccionado.precio_unitario);

      // Usar url_imagen_1 si existe, sino usar url_imagen (compatibilidad)
      const urlImagenFinal = productoSeleccionado.url_imagen_1 || productoSeleccionado.url_imagen;

      const datosActualizados = {
        nombre_producto: productoSeleccionado.nombre_producto,
        descripcion_producto: productoSeleccionado.descripcion_producto,
        precio_unitario: precioParsed,
        unidad_medida: productoSeleccionado.unidad_medida,
        cantidad: productoSeleccionado.cantidad_disponible,
        url_imagen: urlImagenFinal,
      };

      console.log("📤 Datos a enviar:", datosActualizados);

      await updateProducto(productoSeleccionado.id_producto, datosActualizados);
      
      console.log("✅ Producto actualizado correctamente");
      setMensaje(" Producto editado correctamente.");
      setProductoSeleccionado(null);
      cargarProductos(idUsuario);
    } catch (err) {
      console.error("❌ Error al editar:", err);
      setMensaje(`Error al editar producto: ${err.message}`);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!productoSeleccionado) {
      setMensaje("Selecciona un producto para eliminar.");
      return;
    }

    if (productoSeleccionado.id_usuario !== idUsuario) {
      setMensaje("Error: No puedes eliminar un producto que no es tuyo.");
      return;
    }

    try {
      await deleteProducto(productoSeleccionado.id_producto);
      setMensaje(" Producto eliminado correctamente.");
      setProductoSeleccionado(null);
      cargarProductos(idUsuario);
    } catch (err) {
      setMensaje(` Error al eliminar producto: ${err.message}`);
      console.error(err);
    }
  };

  const handleSelectProduct = (nombre_producto) => {
    const producto = productos.find((p) => p.nombre_producto === nombre_producto);
    if (producto) {
      // Inicializar las imágenes: si no existen url_imagen_1, 2, 3, usar url_imagen
      setProductoSeleccionado({
        ...producto,
        url_imagen_1: producto.url_imagen_1 || producto.url_imagen || "",
        url_imagen_2: producto.url_imagen_2 || "",
        url_imagen_3: producto.url_imagen_3 || "",
        // Formatear precio para mostrar en el input (sin símbolo)
        precio_unitario: formatoCOPSinSimbolo(producto.precio_unitario),
      });
    }
  };

  const handleChangeNuevo = (e) => {
    const { id, value } = e.target;
    let fieldName = "";
    switch (id) {
      case "ProductoAnadir":
        fieldName = "nombre_producto";
        break;
      case "DescripcionAnadir":
        fieldName = "descripcion_producto";
        break;
      case "ValorAnadir":
        fieldName = "precio_unitario";
        break;
      case "UnidadMedidaAnadir":
        fieldName = "unidad_medida";
        break;
      case "ExistenciaAnadir":
        fieldName = "cantidad";
        break;
      case "Imagen1Anadir":
        fieldName = "url_imagen_1";
        break;
      case "Imagen2Anadir":
        fieldName = "url_imagen_2";
        break;
      case "Imagen3Anadir":
        fieldName = "url_imagen_3";
        break;
      case "IdSubCategoriaAnadir":
        fieldName = "id_SubCategoria";
        break;
      default:
        return;
    }
    setNuevo({ ...nuevo, [fieldName]: value });
  };


  const handleChangeSeleccionado = (field, value) => {
    if (!productoSeleccionado) {
      console.warn("⚠️ Intento de cambiar producto pero no hay producto seleccionado");
      return;
    }

    console.log(`✏️ Actualizando ${field}:`, value);

    setProductoSeleccionado({
      ...productoSeleccionado,
      [field]: value,
    });
  };

  if (!idUsuario) {
    return (
      <main>
        <h2> No tienes acceso a esta vista</h2>
        <p>Por favor inicia sesión como <strong>productor</strong>.</p>
      </main>
    );
  }


  return (
    <>
      <main className="admin-view">
        <div className="contenedor">
        
          <div className="anadir">
            <div className="header-anadir">
              <h2>Añadir Nuevo Producto</h2>
              <button 
                type="button" 
                className="btn-toggle-form"
                onClick={() => setMostrarFormularioAnadir(!mostrarFormularioAnadir)}
              >
                {mostrarFormularioAnadir ? "▼ Ocultar" : "▶ Mostrar"}
              </button>
            </div>
            {mostrarFormularioAnadir && (
            <form onSubmit={handleAdd}>
              <div className="form-grid-layout">
                {/* Fila 1: Nombre (8) y Subcategoría (4) */}
                <div className="form-group-admin span-8">
                  <label>Nombre del Producto</label>
                  <input
                    type="text"
                    id="ProductoAnadir"
                    placeholder="Ej. Tomate Chonto"
                    value={nuevo.nombre_producto}
                    onChange={handleChangeNuevo}
                  />
                </div>
  
                <div className="form-group-admin span-4">
                  <label>Categoría / Tipo</label>
                  <select
                    id="IdSubCategoriaAnadir"
                    value={nuevo.id_SubCategoria}
                    onChange={handleChangeNuevo}
                  >
                    <option value="">Seleccione...</option>
                    {subcategorias.map((sub) => (
                      <option key={sub.id_SubCategoria} value={sub.id_SubCategoria}>
                        {sub.nombre_subcategoria}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Fila 2: Descripción (12) */}
                <div className="form-group-admin span-12">
                  <label>Descripción del Producto</label>
                  <input
                    type="text"
                    id="DescripcionAnadir"
                    placeholder="Ej. Tomate fresco de alta calidad, ideal para ensaladas."
                    value={nuevo.descripcion_producto}
                    onChange={handleChangeNuevo}
                  />
                </div>
  
                {/* Fila 3: Precio (4), Unidad (4), Existencia (4) */}
                <div className="form-group-admin span-4">
                  <label>Precio Unitario ($)</label>
                  <input
                    type="text"
                    id="ValorAnadir"
                    placeholder="1.000"
                    value={nuevo.precio_unitario}
                    onChange={handleChangeNuevo}
                  />
                </div>
  
                <div className="form-group-admin span-4">
                  <label>Unidad de Medida</label>
                  <input
                    type="text"
                    id="UnidadMedidaAnadir"
                    placeholder="Kg, Lb, Bulto..."
                    value={nuevo.unidad_medida}
                    onChange={handleChangeNuevo}
                  />
                </div>
  
                <div className="form-group-admin span-4">
                  <label>Cantidad Disponible</label>
                  <input
                    type="number"
                    id="ExistenciaAnadir"
                    placeholder="0"
                    value={nuevo.cantidad}
                    onChange={handleChangeNuevo}
                  />
                </div>
  
                {/* Fila 4: URLs de Imágenes (3 imágenes) */}
                <div className="form-group-admin span-12">
                  <label>📷 Imagen Principal (Requerida)</label>
                  <input
                    type="text"
                    id="Imagen1Anadir"
                    placeholder="https://... (primera imagen obligatoria)"
                    value={nuevo.url_imagen_1}
                    onChange={handleChangeNuevo}
                  />
                </div>

                <div className="form-group-admin span-6">
                  <label>📷 Imagen Secundaria 2 (Opcional)</label>
                  <input
                    type="text"
                    id="Imagen2Anadir"
                    placeholder="https://... (opcional)"
                    value={nuevo.url_imagen_2}
                    onChange={handleChangeNuevo}
                  />
                </div>

                <div className="form-group-admin span-6">
                  <label>📷 Imagen Secundaria 3 (Opcional)</label>
                  <input
                    type="text"
                    id="Imagen3Anadir"
                    placeholder="https://... (opcional)"
                    value={nuevo.url_imagen_3}
                    onChange={handleChangeNuevo}
                  />
                </div>
              </div>
              
              <input type="submit" className="button button-add" value="Añadir Producto" />
            </form>
            )}
          </div>
  
      
          <div className="Editar">
            <h2>Editar Producto</h2>
            <form>
              <div className="field-group">
                <label>Seleccionar Producto</label>
                <select
                  id="productoEditar"
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  value={productoSeleccionado?.nombre_producto || ""}
                >
                  <option value="">--- Seleccione para editar ---</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.nombre_producto}>
                      {p.nombre_producto}
                    </option>
                  ))}
                </select>
              </div>
  
              {productoSeleccionado && (
                <>
                  <div className="grid-editar-fields">
                    <div className="field-group full-row">
                      <label>Descripción</label>
                      <input
                        type="text"
                        value={productoSeleccionado.descripcion_producto || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("descripcion_producto", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Valor</label>
                      <input
                        type="text"
                        placeholder="1.000"
                        value={productoSeleccionado.precio_unitario || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("precio_unitario", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Unidad</label>
                      <input
                        type="text"
                        value={productoSeleccionado.unidad_medida || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("unidad_medida", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>Existencia</label>
                      <input
                        type="number"
                        value={productoSeleccionado.cantidad_disponible || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("cantidad_disponible", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group full-row">
                      <label>📷 Imagen Principal</label>
                      <input
                        type="text"
                        value={productoSeleccionado.url_imagen_1 || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("url_imagen_1", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>📷 Imagen 2 (Opcional)</label>
                      <input
                        type="text"
                        value={productoSeleccionado.url_imagen_2 || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("url_imagen_2", e.target.value)
                        }
                      />
                    </div>
                    <div className="field-group">
                      <label>📷 Imagen 3 (Opcional)</label>
                      <input
                        type="text"
                        value={productoSeleccionado.url_imagen_3 || ""}
                        onChange={(e) =>
                          handleChangeSeleccionado("url_imagen_3", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <input
                    type="button"
                    className="button button-edit"
                    value="Guardar Cambios"
                    onClick={handleEdit}
                  />
                </>
              )}
            </form>
          </div>
  
          <div className="eliminar">
            <h2>Eliminar</h2>
            <form>
              <div className="field-group">
                <label>Seleccionar Producto</label>
                <select
                  id="productoEliminar"
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  value={productoSeleccionado?.nombre_producto || ""}
                >
                  <option value="">--- Seleccione para eliminar ---</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.nombre_producto}>
                      {p.nombre_producto}
                    </option>
                  ))}
                </select>
              </div>
              <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>
                  ⚠️ Esta acción eliminará el producto permanentemente del catálogo.
              </p>
              <input
                type="button"
                className="button button-delete"
                value="Eliminar Producto"
                onClick={handleDelete}
                id="botonEliminar"
              />
            </form>
          </div>
        </div>
  
        <div className="contenedorMensaje">
          <div id="mensaje">{mensaje && <p className="message-alert">{mensaje}</p>}</div>
        </div>
  
        <div className="contenedorProductos">
          <h2>Mis Productos usuario ({nombreUsuario || idUsuario})</h2>
          <div className="mostrarProductos">
            {productos.map((p) => (
              <div key={p.id_producto} className="contenedorProducto">
                <img src={p.url_imagen} alt={p.nombre_producto} onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                <div className="informacion">
                  <p className="nombre">{p.nombre_producto}</p>
                  <p className="descripcion">
                    {p.descripcion_producto}
                  </p>
                  <p className="precio">{formatoCOP(p.precio_unitario)}</p>
                  <p className="existencia">
                    Stock: <strong>{p.cantidad_disponible}</strong> {p.unidad_medida}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}