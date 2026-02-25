const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./models/associations_model");
const db = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/products_routes");
const adminProductRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/review_routes");
const pqrsRoutes = require("./routes/pqrs_routes");

const ofertasRoutes = require("./routes/ofertas_routes"); // ← TU RUTA CORRECTA (codigos, validar, productos)
const ofertasProductor = require("./routes/ofertasRoutes");
const descuentosRoutes = require("./routes/descuentos_routes");
const ordenRoutes = require("./routes/ordenRoutes");
const productorRoutes = require("./routes/productorRoutes");
const finanzasRoutes = require("./routes/finanzasRoutes");
const comentarioResenaRoutes = require("./routes/comentarioResenaRoutes");
const subcategoriaRoutes = require("./routes/subcategoriaRoutes");
const carritoRoutes = require("./routes/carrito_routes");
const pedidoRoutes = require("./routes/pedido_routes");

const rolRoutes = require('./routes/rolRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const descuentoRoutes = require('./routes/descuentoRoutes');
const productoDescuentoRoutes = require('./routes/productoDescuentoRoutes');
const estadoPqrsRoutes = require('./routes/estadoPqrsRoutes');
const tipoPqrsRoutes = require('./routes/tipoPqrsRoutes');
const estadoPedidoRoutes = require('./routes/estadoPedidoRoutes');

const app = express();


/* ============================================================
   CORS
============================================================ */
app.use(cors({
  origin: true,         // permite cualquier origen (web, emulador, móvil real)
  credentials: true     // permite cookies / sesiones
}));

/* ============================================================
   MIDDLEWARE
============================================================ */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ============================================================
   RUTAS PÚBLICAS
============================================================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Agrosoft funcionando correctamente",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      root: "/",
      health: "/api/health",
      ofertas: "/api/ofertas",
      productos: "/api/products",
      descuentos: "/api/descuentos"
    }
  });
});

/* ============================================================
   API HEALTH CHECK
============================================================ */
app.get("/api/health", async (req, res) => {
  try {
    await db.authenticate();
    res.json({ success: true, status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ success: false, status: "unhealthy" });
  }
});

/* ============================================================
   RUTAS API
============================================================ */

//  RUTAS OFICIALES DE OFERTAS (CLIENTE)
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/ofertasPro", ofertasProductor);
app.use("/api/ofertas", ofertasRoutes);
app.use("/api/descuentos", descuentosRoutes);
app.use('/api/descuentos-alt', descuentoRoutes);
app.use('/api/product-discounts', productoDescuentoRoutes);

app.use("/api/users", userRoutes);
app.use("/api/products", adminProductRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/pqrs", pqrsRoutes);
app.use("/api/tipoPqrs", tipoPqrsRoutes);
app.use("/api/estadoPqrs", estadoPqrsRoutes);

app.use("/api/descuentos", descuentosRoutes);

app.use("/api/product-discounts", productoDescuentoRoutes);

app.use("/api/ordenes", ordenRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/estadoPedido", estadoPedidoRoutes);

app.use("/api/productor", productorRoutes);
app.use("/api/finanzas", finanzasRoutes);
const inventarioRoutes = require("./routes/inventarioRoutes");
app.use("/api/inventarios", inventarioRoutes);

app.use("/api/comentarios", comentarioResenaRoutes);

app.use("/api/categories", categoriaRoutes);
app.use("/api/subcategorias", subcategoriaRoutes);

app.use("/api/carrito", carritoRoutes);

app.use("/api/roles", rolRoutes);

// Documentación de Swagger
const { swaggerDocs } = require('./config/swagger');
swaggerDocs(app, process.env.PORT || 4000);

/* ============================================================
   RUTA 404
============================================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    path: req.originalUrl
  });
});

/* ============================================================
   ERROR GLOBAL
============================================================ */
app.use((err, req, res, next) => {
  console.error("🔥 Error global:", err.message);
  res.status(500).json({ success: false, error: "Error interno del servidor" });
});

/* ============================================================
   INICIAR SERVIDOR
============================================================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}\n`);
});