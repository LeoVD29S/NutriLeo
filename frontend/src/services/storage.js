const KEYS = {
  auth: 'nutrileo_auth',
  patients: 'nutrileo_patients',
  consultations: 'nutrileo_consultations',
  nextId: 'nutrileo_next_id',
};

function read(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function nextId() {
  const current = read(KEYS.nextId, 1);
  write(KEYS.nextId, current + 1);
  return current;
}

export const storage = {
  getAuth() {
    return read(KEYS.auth, null);
  },

  setAuth(nutritionist) {
    write(KEYS.auth, nutritionist);
  },

  clearAuth() {
    sessionStorage.removeItem(KEYS.auth);
  },

  getPatients() {
    return read(KEYS.patients, []);
  },

  savePatients(patients) {
    write(KEYS.patients, patients);
  },

  getConsultations() {
    return read(KEYS.consultations, []);
  },

  saveConsultations(consultations) {
    write(KEYS.consultations, consultations);
  },

  createPatient(data, bmi, diagnosis) {
    const patients = this.getPatients();
    const patient = {
      id: nextId(),
      name: data.name.trim(),
      age: parseInt(data.age, 10),
      weight: parseFloat(data.weight),
      height: parseFloat(data.height),
      bmi,
      diagnosis,
      created_at: new Date().toISOString(),
    };
    patients.push(patient);
    this.savePatients(patients);
    return patient;
  },

  updatePatient(id, data, bmi, diagnosis) {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Paciente no encontrado');

    patients[index] = {
      ...patients[index],
      name: data.name.trim(),
      age: parseInt(data.age, 10),
      weight: parseFloat(data.weight),
      height: parseFloat(data.height),
      bmi,
      diagnosis,
      updated_at: new Date().toISOString(),
    };
    this.savePatients(patients);
    return patients[index];
  },

  deletePatient(id) {
    const patients = this.getPatients().filter((p) => p.id !== id);
    this.savePatients(patients);
    const consultations = this.getConsultations().filter((c) => c.patient_id !== id);
    this.saveConsultations(consultations);
  },

  createConsultation(data, nutritionist) {
    const patient = this.getPatients().find((p) => p.id === data.patient_id);
    if (!patient) throw new Error('Paciente no encontrado');

    const consultation = {
      id: nextId(),
      patient_id: data.patient_id,
      patient_name: patient.name,
      nutritionist_id: nutritionist.id,
      nutritionist_name: nutritionist.name,
      consultation_date: data.consultation_date,
      consultation_time: data.consultation_time,
      evolution: data.evolution.trim(),
      meal_plan: data.meal_plan.trim(),
      created_at: new Date().toISOString(),
    };

    const consultations = this.getConsultations();
    consultations.unshift(consultation);
    this.saveConsultations(consultations);
    return consultation;
  },

  updateConsultation(id, data) {
    const consultations = this.getConsultations();
    const index = consultations.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Consulta no encontrada');

    consultations[index] = {
      ...consultations[index],
      consultation_date: data.consultation_date,
      consultation_time: data.consultation_time,
      evolution: data.evolution.trim(),
      meal_plan: data.meal_plan.trim(),
      updated_at: new Date().toISOString(),
    };
    this.saveConsultations(consultations);
    return consultations[index];
  },

  deleteConsultation(id) {
    const consultations = this.getConsultations().filter((c) => c.id !== id);
    this.saveConsultations(consultations);
  },

  getConsultationsFiltered(patientId) {
    const all = this.getConsultations();
    const filtered = patientId ? all.filter((c) => c.patient_id === patientId) : all;
    return filtered.sort((a, b) => {
      const dateA = `${a.consultation_date}T${a.consultation_time}`;
      const dateB = `${b.consultation_date}T${b.consultation_time}`;
      return dateB.localeCompare(dateA);
    });
  },
};
