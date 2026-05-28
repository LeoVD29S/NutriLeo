import { useState, useEffect } from 'react';
import { obtenerSesion, listarPacientes, listarConsultas, crearConsulta, actualizarConsulta, eliminarConsulta } from '../utils/data';

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
      } else {
        crearConsulta(datos, obtenerSesion());
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
  }

  function borrar(id) {
    if (!confirm('¿Eliminar consulta?')) return;
    eliminarConsulta(id);
    if (editando === id) {
      setEditando(null);
      setForm(formInicial());
    }
    cargarConsultas();
  }

  function cambiarFiltro(e) {
    const val = e.target.value;
    setFiltro(val);
    cargarConsultas(val);
    const p = pacientes.find((x) => String(x.id) === val);
    if (p) onElegirPaciente(p);
  }

  function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Consultas</h2>
          <p>Historial por paciente, ordenado del más reciente al más antiguo.</p>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{consultas.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="form-section glass-card">
          <h3>{editando ? 'Editar consulta' : 'Nueva consulta'}</h3>
          {error && <div className="alert alert-error">{error}</div>}

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
              >
                <option value="">Selecciona...</option>
                {pacientes.map((p) => (
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
                <label>Hora</label>
                <input name="consultation_time" type="time" value={form.consultation_time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Evolución</label>
              <textarea name="evolution" value={form.evolution} onChange={handleChange} rows="3" required />
            </div>

            <div className="form-group">
              <label>Plan alimenticio</label>
              <textarea name="meal_plan" value={form.meal_plan} onChange={handleChange} rows="3" required />
            </div>

            <div className="form-actions">
              {editando && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditando(null); setForm(formInicial()); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editando ? 'Guardar' : 'Registrar'}
              </button>
            </div>
          </form>
        </section>

        <section className="table-section glass-card">
          <div className="table-header">
            <h3>Historial</h3>
            <div className="table-filters">
              <select value={filtro} onChange={cambiarFiltro}>
                <option value="">Todos</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => cargarConsultas()}>Refrescar</button>
            </div>
          </div>

          {consultas.length === 0 ? (
            <div className="empty-state">
              <p>Sin consultas</p>
            </div>
          ) : (
            <div className="consultation-list">
              {consultas.map((c) => (
                <article key={c.id} className="consultation-card">
                  <div className="consultation-card-header">
                    <div>
                      <span className="consultation-patient">{c.patient_name}</span>
                      <span className="consultation-datetime">
                        {formatearFecha(c.consultation_date)} — {c.consultation_time.slice(0, 5)}
                      </span>
                    </div>
                    <div className="cell-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => editar(c)}>Editar</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => borrar(c.id)}>Borrar</button>
                    </div>
                  </div>
                  <div className="consultation-card-body">
                    <div className="consultation-field">
                      <strong>Evolución</strong>
                      <p>{c.evolution}</p>
                    </div>
                    <div className="consultation-field">
                      <strong>Plan</strong>
                      <p>{c.meal_plan}</p>
                    </div>
                  </div>
                  <div className="consultation-card-footer">
                    {c.nutritionist_name}
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
