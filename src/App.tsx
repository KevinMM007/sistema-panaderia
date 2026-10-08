import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeDatabase } from './db/seed';
import { useAuthStore } from './store/authStore';

// Pages (las crearemos a continuación)
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import AdminPage from './pages/AdminPage';

function App() {
  const { isAuthenticated, currentUser } = useAuthStore();

  useEffect(() => {
    // Inicializar la base de datos al cargar la app
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={currentUser?.role === 'admin' ? '/admin' : '/pos'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Ruta de POS (Cajero) */}
        <Route
          path="/pos"
          element={
            isAuthenticated ? (
              <POSPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta de Admin */}
        <Route
          path="/admin"
          element={
            isAuthenticated && currentUser?.role === 'admin' ? (
              <AdminPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/pos' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
