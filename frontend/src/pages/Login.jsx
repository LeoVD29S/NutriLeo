import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Escribe tu nombre para ingresar');
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
      <aside className="login-hero">
        <div className="login-hero-content">
          <div className="clinic-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            </svg>
            Consultorio Nutricional
          </div>
          <h1>NutriLeo</h1>
          <p>Gestión clínica de pacientes, consultas e historial nutricional en un solo lugar.</p>
          <ul className="login-features">
            <li>Registro antropométrico con IMC automático</li>
            <li>Historial de consultas en tiempo real</li>
            <li>Acceso seguro por nutricionista</li>
          </ul>
        </div>
      </aside>

      <main className="login-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Bienvenido</h2>
            <p>Identifícate para acceder al consultorio</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre del nutricionista</label>
              <input
                id="name"
                type="text"
                placeholder="Ej. Dra. Ana López"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              Entrar al consultorio
            </button>
          </form>

          <p className="login-note">Uso exclusivo del personal clínico</p>
        </div>
      </main>
    </div>
  );
}
