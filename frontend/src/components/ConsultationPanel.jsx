import { useState, useEffect } from 'react';
import { obtenerSesion, listarPacientes, listarConsultas, crearConsulta, actualizarConsulta, eliminarConsulta } from '../utils/data';
import Toast from './Toast';

function formInicial() {
  return {
    patient_id: '',
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_time: new Date().toTimeString().slice(0, 5),
    evolution: '',
    meal_plan: '',
  };
}

export default function ConsultationPanel({ paciente, onElegirPaciente }) {
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState(formInicial());
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [filtro, setFiltro] = useState('');

  function cargarConsultas(idFiltro) {
    const id = idFiltro !== undefined ? idFiltro : filtro;
    setConsultas(listarConsultas(id ? Number(id) : null));
  }

  useEffect(() => {
    setPacientes(listarPacientes());
    cargarConsultas('');
    const timer = setInterval(() => cargarConsultas(), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (paciente) {
      setFiltro(String(paciente.id));
      setForm((f) => ({ ...f, patient_id: String(paciente.id) }));
      cargarConsultas(String(paciente.id));
    }
  }, [paciente]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const datos = { ...form, patient_id: Number(form.patient_id) };
      if (editando) {
        actualizarConsulta(editando, datos);
        setToast('Consulta actualizada');
      } else {
        crearConsulta(datos, obtenerSesion());
        setToast('Consulta registrada en el historial');
      }
      setForm({ ...formInicial(), patient_id: form.patient_id });
      setEditando(null);
      cargarConsultas();
    } catch (err) {
      setError(err.message);
    }
  }

  function editar(c) {
    setEditando(c.id);
    setForm({
      patient_id: String(c.patient_id),
      consultation_date: c.consultation_date.split('T')[0],
      consultation_time: c.consultation_time.slice(0, 5),
      evolution: c.evolution,
      meal_plan: c.meal_plan,
    });
    setError('');
  }

  function borrar(id) {
    if (!confirm('¿Eliminar esta consulta del historial?')) return;
    eliminarConsulta(id);
    if (editando === id) {
      setEditando(null);
      setForm(formInicial());
    }
    setToast('Consulta eliminada');
    cargarConsultas();
  }

  function cambiarFiltro(e) {
    const val = e.target.value;
    setFiltro(val);
    cargarConsultas(val);
    const p = pacientes.find((x) => String(x.id) === val);
    if (p) onElegirPaciente(p);
    else onElegirPaciente(null);
  }

  function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="panel">
      <Toast mensaje={toast} onClose={() => setToast('')} />

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Consultas en historial</span>
          <span className="stat-number">{consultas.length}</span>
        </div>
        <div className="stat-card stat-card-light">
          <span className="stat-label">Pacientes disponibles</span>
          <span className="stat-number">{pacientes.length}</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="card card-form">
          <div className="card-title">
            <span className="card-icon">✎</span>
            <div>
              <h3>{editando ? 'Editar consulta' : 'Nueva consulta'}</h3>
              <p>Nota clínica y plan alimenticio</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {pacientes.length === 0 && (
            <div className="alert alert-info">
              Primero registra un paciente en la sección Pacientes.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Paciente</label>
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={(e) => {
                  handleChange(e);
                  setFiltro(e.target.value);
                  cargarConsultas(e.target.value);
                }}
                required
                disabled={pacientes.length === 0}
              >
                <option value="">Seleccionar paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de consulta</label>
                <input name="consultation_date" type="date" value={form.consultation_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <input name="consultation_time" type="time" value={form.consultation_time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Evolución clínica</label>
              <textarea name="evolution" value={form.evolution} onChange={handleChange} rows="4" placeholder="Progreso, síntomas, observaciones..." required />
            </div>

            <div className="form-group">
              <label>Plan alimenticio</label>
              <textarea name="meal_plan" value={form.meal_plan} onChange={handleChange} rows="4" placeholder="Desayuno, comida, cena, recomendaciones..." required />
            </div>

            <div className="form-actions">
              {editando && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditando(null); setForm(formInicial()); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={pacientes.length === 0}>
                {editando ? 'Guardar cambios' : 'Registrar consulta'}
              </button>
            </div>
          </form>
        </section>

        <section className="card card-table">
          <div className="card-title">
            <span className="card-icon card-icon-blue">🕐</span>
            <div>
              <h3>Historial clínico</h3>
              <p>Más recientes primero · se actualiza automáticamente</p>
            </div>
          </div>

          <div className="table-filters">
            <label htmlFor="filtro-paciente">Filtrar por paciente</label>
            <select id="filtro-paciente" value={filtro} onChange={cambiarFiltro}>
              <option value="">Todos los pacientes</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {consultas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Sin consultas registradas</p>
              <span>Las notas aparecerán aquí al guardarlas</span>
            </div>
          ) : (
            <div className="consultation-list">
              {consultas.map((c, i) => (
                <article key={c.id} className="consultation-card">
                  <div className="timeline-dot">{consultas.length - i}</div>
                  <div className="consultation-card-inner">
                    <div className="consultation-card-header">
                      <div>
                        <span className="consultation-patient">{c.patient_name}</span>
                        <span className="consultation-datetime">
                          {formatearFecha(c.consultation_date)} · {c.consultation_time.slice(0, 5)}
                        </span>
                      </div>
                      <div className="cell-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => editar(c)}>Editar</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => borrar(c.id)}>Borrar</button>
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
                      Atendido por {c.nutritionist_name}
                    </div>
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
