import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Escribe tu nombre');
      return;
    }
    try {
      login(name);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="logo-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
              <path d="M24 8 C16 8 10 16 10 24 C10 32 16 40 24 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="4" fill="currentColor" />
            </svg>
          </div>
          <h1>NutriLeo</h1>
          <p className="tagline">Sistema Clínico Nutricional</p>
        </div>

        <form className="login-form glass-card" onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>
          <p className="form-subtitle">Ingresa tu nombre para continuar</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nutricionista</label>
            <input
              id="name"
              type="text"
              placeholder="Ej: Dra. María García"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
