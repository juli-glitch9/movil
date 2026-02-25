import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/protectedRoute';
import AppRoutes from './app/routes';
import Footer from './components/Footer';

function AdminApp({ onLogout }) {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute requiredRole={2}>
            <>
              <AppRoutes onLogout={onLogout} />
              <Footer />
            </>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AdminApp;
