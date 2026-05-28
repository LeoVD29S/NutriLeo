import { storage } from './storage';

function delay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateBMI(weight, height) {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 100) / 100;
}

export function getDiagnosis(bmi) {
  if (bmi < 18.5) return 'Bajo Peso';
  if (bmi < 25) return 'Peso Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export function getDiagnosisClass(diagnosis) {
  const map = {
    'Bajo Peso': 'badge-warning',
    'Peso Normal': 'badge-success',
    'Sobrepeso': 'badge-orange',
    'Obesidad': 'badge-danger',
  };
  return map[diagnosis] || 'badge-neutral';
}

export const api = {
  async login(name) {
    await delay();
    if (!name?.trim()) throw new Error('El nombre es requerido');
    const nutritionist = { id: Date.now(), name: name.trim() };
    storage.setAuth(nutritionist);
    return { nutritionist };
  },

  async logout() {
    await delay();
    storage.clearAuth();
    return { message: 'Sesión cerrada' };
  },

  async getMe() {
    await delay();
    const nutritionist = storage.getAuth();
    if (!nutritionist) throw new Error('No autenticado');
    return { nutritionist };
  },

  async getPatients() {
    await delay();
    return storage.getPatients().sort((a, b) => a.name.localeCompare(b.name));
  },

  async createPatient(data) {
    await delay();
    if (!data.name || !data.age || !data.weight || !data.height) {
      throw new Error('Todos los campos son requeridos');
    }
    const bmi = calculateBMI(parseFloat(data.weight), parseFloat(data.height));
    const diagnosis = getDiagnosis(bmi);
    return storage.createPatient(data, bmi, diagnosis);
  },

  async updatePatient(id, data) {
    await delay();
    const bmi = calculateBMI(parseFloat(data.weight), parseFloat(data.height));
    const diagnosis = getDiagnosis(bmi);
    return storage.updatePatient(Number(id), data, bmi, diagnosis);
  },

  async deletePatient(id) {
    await delay();
    storage.deletePatient(Number(id));
    return { message: 'Paciente eliminado' };
  },

  async getConsultations(patientId) {
    await delay();
    const pid = patientId ? Number(patientId) : null;
    return storage.getConsultationsFiltered(pid);
  },

  async createConsultation(data) {
    await delay();
    const nutritionist = storage.getAuth();
    if (!nutritionist) throw new Error('No autenticado');
    if (!data.patient_id || !data.consultation_date || !data.consultation_time || !data.evolution || !data.meal_plan) {
      throw new Error('Todos los campos son requeridos');
    }
    return storage.createConsultation(
      { ...data, patient_id: Number(data.patient_id) },
      nutritionist
    );
  },

  async updateConsultation(id, data) {
    await delay();
    return storage.updateConsultation(Number(id), data);
  },

  async deleteConsultation(id) {
    await delay();
    storage.deleteConsultation(Number(id));
    return { message: 'Consulta eliminada' };
  },
};
