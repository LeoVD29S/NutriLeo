import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientPanel from '../components/PatientPanel';
import ConsultationPanel from '../components/ConsultationPanel';

export default function Dashboard() {
  const { nutritionist, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('consultations');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 4 C10 4 6 10 6 16 C6 22 10 28 16 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="3" fill="currentColor"/>
            </svg>
            <span>NutriLeo</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-tab ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Pacientes
          </button>
          <button
            className={`nav-tab ${activeTab === 'consultations' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Consultas
          </button>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{nutritionist.name.charAt(0).toUpperCase()}</div>
            <span>{nutritionist.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {activeTab === 'patients' && (
          <PatientPanel onSelectPatient={handleSelectPatient} />
        )}
        {activeTab === 'consultations' && (
          <ConsultationPanel
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
        )}
      </main>
    </div>
  );
}
