import { useState, useEffect } from 'react';
import { calcularIMC, obtenerDiagnostico, claseDiagnostico } from '../utils/bmi';
import {
  listarPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from '../utils/data';

const formVacio = { name: '', age: '', weight: '', height: '' };

export default function PatientPanel({ onConsultar }) {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
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
      } else {
        crearPaciente(form, imc, diagnostico);
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
  }

  function borrar(id) {
    if (!confirm('¿Eliminar paciente y sus consultas?')) return;
    eliminarPaciente(id);
    if (editando === id) {
      setEditando(null);
      setForm(formVacio);
    }
    cargar();
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Pacientes</h2>
          <p>Registra peso, estatura y edad. El IMC se calcula solo.</p>
        </div>
        <div className="stat-badge">
          <span className="stat-number">{pacientes.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="form-section glass-card">
          <h3>{editando ? 'Editar' : 'Nuevo paciente'}</h3>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Edad</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Peso (kg)</label>
                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Estatura (cm)</label>
                <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} required />
              </div>
            </div>

            {imcPreview && (
              <div className="bmi-preview">
                <div className="bmi-value">
                  <span className="bmi-label">IMC</span>
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
                {editando ? 'Guardar' : 'Registrar'}
              </button>
            </div>
          </form>
        </section>

        <section className="table-section glass-card">
          <div className="table-header">
            <h3>Listado</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={cargar}>Refrescar</button>
          </div>

          {pacientes.length === 0 ? (
            <div className="empty-state">
              <p>No hay pacientes</p>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((p) => (
                    <tr key={p.id}>
                      <td className="cell-name">{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.weight} kg</td>
                      <td>{p.height} cm</td>
                      <td className="cell-bmi">{p.bmi}</td>
                      <td>
                        <span className={`badge ${claseDiagnostico(p.diagnosis)}`}>{p.diagnosis}</span>
                      </td>
                      <td className="cell-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onConsultar(p)}>Consulta</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => editar(p)}>Editar</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => borrar(p.id)}>Borrar</button>
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
