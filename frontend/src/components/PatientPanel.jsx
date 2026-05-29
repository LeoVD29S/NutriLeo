import { useState, useEffect } from 'react';
import { calcularIMC, obtenerDiagnostico, claseDiagnostico } from '../utils/bmi';
import {
  listarPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from '../utils/data';
import Toast from './Toast';

const formVacio = { name: '', age: '', weight: '', height: '' };

export default function PatientPanel({ onConsultar }) {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [imcPreview, setImcPreview] = useState(null);
  const [diagnosticoPreview, setDiagnosticoPreview] = useState('');

  function cargar() {
    setPacientes(listarPacientes());
  }

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    const peso = parseFloat(form.weight);
    const estatura = parseFloat(form.height);
    if (peso > 0 && estatura > 0) {
      const imc = calcularIMC(peso, estatura);
      setImcPreview(imc);
      setDiagnosticoPreview(obtenerDiagnostico(imc));
    } else {
      setImcPreview(null);
      setDiagnosticoPreview('');
    }
  }, [form.weight, form.height]);

  const filtrados = pacientes.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const imc = calcularIMC(parseFloat(form.weight), parseFloat(form.height));
      const diagnostico = obtenerDiagnostico(imc);

      if (editando) {
        actualizarPaciente(editando, form, imc, diagnostico);
        setToast('Paciente actualizado correctamente');
      } else {
        crearPaciente(form, imc, diagnostico);
        setToast('Paciente registrado en el expediente');
      }

      setForm(formVacio);
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  function editar(p) {
    setEditando(p.id);
    setForm({
      name: p.name,
      age: String(p.age),
      weight: String(p.weight),
      height: String(p.height),
    });
    setError('');
  }

  function borrar(id) {
    if (!confirm('¿Eliminar paciente y todas sus consultas?')) return;
    eliminarPaciente(id);
    if (editando === id) {
      setEditando(null);
      setForm(formVacio);
    }
    setToast('Paciente eliminado');
    cargar();
  }

  return (
    <div className="panel">
      <Toast mensaje={toast} onClose={() => setToast('')} />

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Pacientes registrados</span>
          <span className="stat-number">{pacientes.length}</span>
        </div>
        <div className="stat-card stat-card-light">
          <span className="stat-label">En pantalla</span>
          <span className="stat-number">{filtrados.length}</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="card card-form">
          <div className="card-title">
            <span className="card-icon">+</span>
            <div>
              <h3>{editando ? 'Editar expediente' : 'Nuevo paciente'}</h3>
              <p>Datos antropométricos del consultorio</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre del paciente" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Edad</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="Años" required />
              </div>
              <div className="form-group">
                <label>Peso (kg)</label>
                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} placeholder="70.5" required />
              </div>
            </div>

            <div className="form-group">
              <label>Estatura (cm)</label>
              <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} placeholder="165" required />
            </div>

            {imcPreview && (
              <div className="bmi-preview">
                <div>
                  <span className="bmi-label">Índice de masa corporal</span>
                  <span className="bmi-number">{imcPreview}</span>
                </div>
                <span className={`badge ${claseDiagnostico(diagnosticoPreview)}`}>
                  {diagnosticoPreview}
                </span>
              </div>
            )}

            <div className="form-actions">
              {editando && (
                <button type="button" className="btn btn-ghost" onClick={() => { setEditando(null); setForm(formVacio); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editando ? 'Guardar cambios' : 'Registrar paciente'}
              </button>
            </div>
          </form>
        </section>

        <section className="card card-table">
          <div className="card-title">
            <span className="card-icon card-icon-blue">≡</span>
            <div>
              <h3>Expedientes</h3>
              <p>Listado clínico de pacientes</p>
            </div>
          </div>

          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar paciente por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <p>{busqueda ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}</p>
              <span>Completa el formulario para agregar el primero</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Edad</th>
                    <th>Peso</th>
                    <th>Estatura</th>
                    <th>IMC</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      <td className="cell-name">{p.name}</td>
                      <td>{p.age} años</td>
                      <td>{p.weight} kg</td>
                      <td>{p.height} cm</td>
                      <td className="cell-bmi">{p.bmi}</td>
                      <td>
                        <span className={`badge ${claseDiagnostico(p.diagnosis)}`}>{p.diagnosis}</span>
                      </td>
                      <td className="cell-actions">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => onConsultar(p)}>
                          Consulta
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => editar(p)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => borrar(p.id)}>
                          Borrar
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
