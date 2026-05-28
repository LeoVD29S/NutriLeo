import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const emptyForm = {
  patient_id: '',
  consultation_date: new Date().toISOString().split('T')[0],
  consultation_time: new Date().toTimeString().slice(0, 5),
  evolution: '',
  meal_plan: '',
};

export default function ConsultationPanel({ selectedPatient, onSelectPatient }) {
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterPatientId, setFilterPatientId] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadConsultations = useCallback(async () => {
    try {
      const pid = filterPatientId || undefined;
      const data = await api.getConsultations(pid);
      setConsultations(data);
    } catch (err) {
      setError(err.message);
    }
  }, [filterPatientId]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    loadConsultations();
    const interval = setInterval(loadConsultations, 5000);
    return () => clearInterval(interval);
  }, [loadConsultations]);

  useEffect(() => {
    if (selectedPatient) {
      setFilterPatientId(String(selectedPatient.id));
      setForm((f) => ({ ...f, patient_id: String(selectedPatient.id) }));
    }
  }, [selectedPatient]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, patient_id: parseInt(form.patient_id) };
      if (editingId) {
        await api.updateConsultation(editingId, payload);
      } else {
        await api.createConsultation(payload);
      }
      setForm({
        ...emptyForm,
        patient_id: form.patient_id,
      });
      setEditingId(null);
      await loadConsultations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      patient_id: String(c.patient_id),
      consultation_date: c.consultation_date.split('T')[0],
      consultation_time: c.consultation_time.slice(0, 5),
      evolution: c.evolution,
      meal_plan: c.meal_plan,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta consulta?')) return;
    try {
      await api.deleteConsultation(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadConsultations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ ...emptyForm, patient_id: form.patient_id });
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterPatientId(val);
    if (val) {
      const p = patients.find((pt) => String(pt.id) === val);
      if (p) onSelectPatient(p);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Historial de Consultas</h2>
          <p>Registra evolución y plan alimenticio — se actualiza en tiempo real</p>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{consultations.length}</span>
          <span className="stat-label">Consultas</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="form-section glass-card">
          <h3>{editingId ? 'Editar Consulta' : 'Nueva Consulta'}</h3>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Paciente</label>
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={(e) => {
                  handleChange(e);
                  setFilterPatientId(e.target.value);
                }}
                required
              >
                <option value="">Seleccionar paciente...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha</label>
                <input name="consultation_date" type="date" value={form.consultation_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Hora exacta</label>
                <input name="consultation_time" type="time" value={form.consultation_time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Evolución del paciente</label>
              <textarea name="evolution" value={form.evolution} onChange={handleChange} placeholder="Describe la evolución clínica..." rows="3" required />
            </div>

            <div className="form-group">
              <label>Plan alimenticio</label>
              <textarea name="meal_plan" value={form.meal_plan} onChange={handleChange} placeholder="Detalla el plan de alimentación..." rows="3" required />
            </div>

            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar Consulta'}
              </button>
            </div>
          </form>
        </section>

        <section className="table-section glass-card">
          <div className="table-header">
            <h3>Historial Cronológico</h3>
            <div className="table-filters">
              <select value={filterPatientId} onChange={handleFilterChange}>
                <option value="">Todos los pacientes</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={loadConsultations}>
                Actualizar
              </button>
            </div>
          </div>

          {consultations.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="8" y="12" width="48" height="40" rx="4"/>
                <line x1="8" y1="24" x2="56" y2="24"/>
                <line x1="20" y1="8" x2="20" y2="16"/>
                <line x1="44" y1="8" x2="44" y2="16"/>
              </svg>
              <p>Sin consultas registradas</p>
              <span>Las notas más recientes aparecerán arriba</span>
            </div>
          ) : (
            <div className="consultation-list">
              {consultations.map((c) => (
                <article key={c.id} className="consultation-card">
                  <div className="consultation-card-header">
                    <div>
                      <span className="consultation-patient">{c.patient_name}</span>
                      <span className="consultation-datetime">
                        {formatDate(c.consultation_date)} — {c.consultation_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="cell-actions">
                      <button className="btn-icon" title="Editar" onClick={() => handleEdit(c)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => handleDelete(c.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="consultation-card-body">
                    <div className="consultation-field">
                      <strong>Evolución</strong>
                      <p>{c.evolution}</p>
                    </div>
                    <div className="consultation-field">
                      <strong>Plan alimenticio</strong>
                      <p>{c.meal_plan}</p>
                    </div>
                  </div>
                  <div className="consultation-card-footer">
                    <span>Atendido por: {c.nutritionist_name}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
