const AUTH_KEY = 'nutrileo_auth';
const PACIENTES_KEY = 'nutrileo_pacientes';
const CONSULTAS_KEY = 'nutrileo_consultas';
const ID_KEY = 'nutrileo_id';

function leer(key, valorDefault) {
  try {
    const dato = sessionStorage.getItem(key);
    return dato ? JSON.parse(dato) : valorDefault;
  } catch {
    return valorDefault;
  }
}

function guardar(key, valor) {
  sessionStorage.setItem(key, JSON.stringify(valor));
}

function nuevoId() {
  const id = leer(ID_KEY, 1);
  guardar(ID_KEY, id + 1);
  return id;
}

export function obtenerSesion() {
  return leer(AUTH_KEY, null);
}

export function iniciarSesion(nombre) {
  const nutricionista = { id: Date.now(), name: nombre.trim() };
  guardar(AUTH_KEY, nutricionista);
  return nutricionista;
}

export function cerrarSesion() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function listarPacientes() {
  return leer(PACIENTES_KEY, []).sort((a, b) => a.name.localeCompare(b.name));
}

export function crearPaciente(datos, imc, diagnostico) {
  const lista = leer(PACIENTES_KEY, []);
  const paciente = {
    id: nuevoId(),
    name: datos.name.trim(),
    age: parseInt(datos.age, 10),
    weight: parseFloat(datos.weight),
    height: parseFloat(datos.height),
    bmi: imc,
    diagnosis: diagnostico,
  };
  lista.push(paciente);
  guardar(PACIENTES_KEY, lista);
  return paciente;
}

export function actualizarPaciente(id, datos, imc, diagnostico) {
  const lista = leer(PACIENTES_KEY, []);
  const pos = lista.findIndex((p) => p.id === id);
  if (pos === -1) throw new Error('Paciente no encontrado');

  lista[pos] = {
    ...lista[pos],
    name: datos.name.trim(),
    age: parseInt(datos.age, 10),
    weight: parseFloat(datos.weight),
    height: parseFloat(datos.height),
    bmi: imc,
    diagnosis: diagnostico,
  };
  guardar(PACIENTES_KEY, lista);
  return lista[pos];
}

export function eliminarPaciente(id) {
  guardar(PACIENTES_KEY, leer(PACIENTES_KEY, []).filter((p) => p.id !== id));
  guardar(CONSULTAS_KEY, leer(CONSULTAS_KEY, []).filter((c) => c.patient_id !== id));
}

export function listarConsultas(pacienteId) {
  let lista = leer(CONSULTAS_KEY, []);
  if (pacienteId) lista = lista.filter((c) => c.patient_id === pacienteId);
  return lista.sort((a, b) => {
    const fechaA = `${a.consultation_date}T${a.consultation_time}`;
    const fechaB = `${b.consultation_date}T${b.consultation_time}`;
    return fechaB.localeCompare(fechaA);
  });
}

export function crearConsulta(datos, nutricionista) {
  const paciente = leer(PACIENTES_KEY, []).find((p) => p.id === datos.patient_id);
  if (!paciente) throw new Error('Paciente no encontrado');

  const consulta = {
    id: nuevoId(),
    patient_id: datos.patient_id,
    patient_name: paciente.name,
    nutritionist_id: nutricionista.id,
    nutritionist_name: nutricionista.name,
    consultation_date: datos.consultation_date,
    consultation_time: datos.consultation_time,
    evolution: datos.evolution.trim(),
    meal_plan: datos.meal_plan.trim(),
  };

  const lista = leer(CONSULTAS_KEY, []);
  lista.unshift(consulta);
  guardar(CONSULTAS_KEY, lista);
  return consulta;
}

export function actualizarConsulta(id, datos) {
  const lista = leer(CONSULTAS_KEY, []);
  const pos = lista.findIndex((c) => c.id === id);
  if (pos === -1) throw new Error('Consulta no encontrada');

  lista[pos] = {
    ...lista[pos],
    consultation_date: datos.consultation_date,
    consultation_time: datos.consultation_time,
    evolution: datos.evolution.trim(),
    meal_plan: datos.meal_plan.trim(),
  };
  guardar(CONSULTAS_KEY, lista);
  return lista[pos];
}

export function eliminarConsulta(id) {
  guardar(CONSULTAS_KEY, leer(CONSULTAS_KEY, []).filter((c) => c.id !== id));
}
