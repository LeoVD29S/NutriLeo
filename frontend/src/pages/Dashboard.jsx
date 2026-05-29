import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { limpiarDatos } from '../utils/data';
import PatientPanel from '../components/PatientPanel';
import ConsultationPanel from '../components/ConsultationPanel';
import Toast from '../components/Toast';

function fechaHoy() {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { nutritionist, logout } = useAuth();
  const [tab, setTab] = useState('pacientes');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState('');

  function irAConsultas(paciente) {
    setPacienteSeleccionado(paciente);
    setTab('consultas');
  }

  function handleLimpiarDatos() {
    if (!confirm('¿Borrar todos los pacientes y consultas? Esta acción no se puede deshacer.')) return;
    limpiarDatos();
    setPacienteSeleccionado(null);
    setRefresh((n) => n + 1);
    setToast('Datos del consultorio eliminados');
  }

  return (
    <div className="clinic-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <strong>NutriLeo</strong>
            <span>Consultorio</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${tab === 'pacientes' ? 'active' : ''}`}
            onClick={() => setTab('pacientes')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Pacientes
          </button>
          <button
            type="button"
            className={`sidebar-link ${tab === 'consultas' ? 'active' : ''}`}
            onClick={() => setTab('consultas')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Consultas
          </button>
        </nav>

        <div className="sidebar-actions">
          <button type="button" className="btn btn-clear" onClick={handleLimpiarDatos}>
            Limpiar datos
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{nutritionist.name.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <strong>{nutritionist.name}</strong>
            <span>Nutricionista</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </aside>

      <div className="clinic-main">
        <Toast mensaje={toast} onClose={() => setToast('')} />

        <header className="topbar">
          <div>
            <p className="topbar-date">{fechaHoy()}</p>
            <h1>{tab === 'pacientes' ? 'Expediente de pacientes' : 'Consultas clínicas'}</h1>
          </div>
          {pacienteSeleccionado && tab === 'consultas' && (
            <div className="patient-chip">
              <span>Paciente activo</span>
              <strong>{pacienteSeleccionado.name}</strong>
            </div>
          )}
        </header>

        <main className="clinic-content">
          {tab === 'pacientes' && <PatientPanel key={refresh} onConsultar={irAConsultas} />}
          {tab === 'consultas' && (
            <ConsultationPanel
              key={refresh}
              paciente={pacienteSeleccionado}
              onElegirPaciente={setPacienteSeleccionado}
            />
          )}
        </main>
      </div>
    </div>
  );
}
