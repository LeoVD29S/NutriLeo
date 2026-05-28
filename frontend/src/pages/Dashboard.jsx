import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientPanel from '../components/PatientPanel';
import ConsultationPanel from '../components/ConsultationPanel';

export default function Dashboard() {
  const { nutritionist, logout } = useAuth();
  const [tab, setTab] = useState('pacientes');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  function irAConsultas(paciente) {
    setPacienteSeleccionado(paciente);
    setTab('consultas');
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-logo">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 4 C10 4 6 10 6 16 C6 22 10 28 16 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="16" r="3" fill="currentColor" />
          </svg>
          <span>NutriLeo</span>
        </div>

        <nav className="header-nav">
          <button
            type="button"
            className={`nav-tab ${tab === 'pacientes' ? 'active' : ''}`}
            onClick={() => setTab('pacientes')}
          >
            Pacientes
          </button>
          <button
            type="button"
            className={`nav-tab ${tab === 'consultas' ? 'active' : ''}`}
            onClick={() => setTab('consultas')}
          >
            Consultas
          </button>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{nutritionist.name.charAt(0).toUpperCase()}</div>
            <span>{nutritionist.name}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {tab === 'pacientes' && <PatientPanel onConsultar={irAConsultas} />}
        {tab === 'consultas' && (
          <ConsultationPanel
            paciente={pacienteSeleccionado}
            onElegirPaciente={setPacienteSeleccionado}
          />
        )}
      </main>
    </div>
  );
}
