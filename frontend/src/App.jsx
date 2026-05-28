import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children }) {
  const { nutritionist, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!nutritionist) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { nutritionist, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (nutritionist) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
