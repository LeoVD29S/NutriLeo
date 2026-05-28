import { useState, useEffect, useCallback } from 'react';
import { api, calculateBMI, getDiagnosis, getDiagnosisClass } from '../services/api';

const emptyForm = { name: '', age: '', weight: '', height: '' };

export default function PatientPanel({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewBMI, setPreviewBMI] = useState(null);
  const [previewDiagnosis, setPreviewDiagnosis] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height);
    if (w > 0 && h > 0) {
      const bmi = calculateBMI(w, h);
      setPreviewBMI(bmi);
      setPreviewDiagnosis(getDiagnosis(bmi));
    } else {
      setPreviewBMI(null);
      setPreviewDiagnosis('');
    }
  }, [form.weight, form.height]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.updatePatient(editingId, form);
      } else {
        await api.createPatient(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      name: patient.name,
      age: String(patient.age),
      weight: String(patient.weight),
      height: String(patient.height),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este paciente y todas sus consultas?')) return;
    try {
      await api.deletePatient(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Registro de Pacientes</h2>
          <p>Registra datos antropométricos — el IMC se calcula automáticamente</p>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{patients.length}</span>
          <span className="stat-label">Pacientes</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="form-section glass-card">
          <h3>{editingId ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre del paciente" required />
              </div>
              <div className="form-group">
                <label>Edad</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="Años" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Peso (kg)</label>
                <input name="weight" type="number" step="0.1" min="1" value={form.weight} onChange={handleChange} placeholder="Ej: 70.5" required />
              </div>
              <div className="form-group">
                <label>Estatura (cm)</label>
                <input name="height" type="number" step="0.1" min="50" value={form.height} onChange={handleChange} placeholder="Ej: 165" required />
              </div>
            </div>

            {previewBMI && (
              <div className="bmi-preview">
                <div className="bmi-value">
                  <span className="bmi-label">IMC Calculado</span>
                  <span className="bmi-number">{previewBMI}</span>
                </div>
                <span className={`badge ${getDiagnosisClass(previewDiagnosis)}`}>
                  {previewDiagnosis}
                </span>
              </div>
            )}

            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar Paciente'}
              </button>
            </div>
          </form>
        </section>

        <section className="table-section glass-card">
          <div className="table-header">
            <h3>Lista de Pacientes</h3>
            <button className="btn btn-ghost btn-sm" onClick={loadPatients}>
              Actualizar
            </button>
          </div>

          {patients.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="32" cy="20" r="10"/>
                <path d="M12 56 C12 44 20 36 32 36 C44 36 52 44 52 56"/>
              </svg>
              <p>No hay pacientes registrados</p>
              <span>Usa el formulario para agregar el primero</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Edad</th>
                    <th>Peso</th>
                    <th>Estatura</th>
                    <th>IMC</th>
                    <th>Diagnóstico</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td className="cell-name">{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.weight} kg</td>
                      <td>{p.height} cm</td>
                      <td className="cell-bmi">{p.bmi}</td>
                      <td>
                        <span className={`badge ${getDiagnosisClass(p.diagnosis)}`}>
                          {p.diagnosis}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <button className="btn-icon" title="Consultar" onClick={() => onSelectPatient(p)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </button>
                        <button className="btn-icon" title="Editar" onClick={() => handleEdit(p)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
