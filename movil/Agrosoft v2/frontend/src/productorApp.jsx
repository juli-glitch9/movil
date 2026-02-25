import { Routes, Route } from "react-router-dom"; // Eliminamos el import de Router
import { motion } from "framer-motion";
import ProductorNavbar from "./components/Navbarproductor.jsx";
import AdminView from "./pages/AdminView.jsx";
import Finanza from "./pages/Finanza.jsx";
import OfertasPage from "./pages/DealsView.jsx";
import OrdenesPage from "./pages/OrdenesPage.jsx";
import ReseñasView from "./pages/ReseñasView.jsx";

function ProductorApp({ isAuthenticated, user, onLogout }) { // Se añaden user y onLogout si son necesarias para Navbar
  console.log(" ProductorApp props:", { isAuthenticated, user, hasOnLogout: !!onLogout });
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ProductorNavbar isAuthenticated={isAuthenticated} onLogout={onLogout} user={user} /> 
      <main className="flex-1 p-4">
        <Routes>
          <Route index element={<AdminView />} /> 
          <Route path="finanza" element={<Finanza />} />
          <Route path="ofertas" element={<OfertasPage />} />
          <Route path="ordenes" element={<OrdenesPage />} />
          <Route path="resenas" element={<ReseñasView />} />

          <Route path="*" element={<AdminView />} /> 
        </Routes>
      </main>
    </motion.div>
  );
}

export default ProductorApp;
