import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loading from './components/Loading';

function RutaPrivada({ children }) {
  const { nutritionist, loading } = useAuth();
  if (loading) return <Loading />;
  return nutritionist ? children : <Navigate to="/login" replace />;
}

function RutaPublica({ children }) {
  const { nutritionist, loading } = useAuth();
  if (loading) return <Loading />;
  return nutritionist ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/dashboard" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
