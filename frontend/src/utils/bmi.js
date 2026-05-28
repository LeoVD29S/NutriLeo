export function calcularIMC(peso, estatura) {
  const metros = estatura / 100;
  return Math.round((peso / (metros * metros)) * 100) / 100;
}

export function obtenerDiagnostico(imc) {
  if (imc < 18.5) return 'Bajo Peso';
  if (imc < 25) return 'Peso Normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export function claseDiagnostico(texto) {
  if (texto === 'Bajo Peso') return 'badge-warning';
  if (texto === 'Peso Normal') return 'badge-success';
  if (texto === 'Sobrepeso') return 'badge-orange';
  if (texto === 'Obesidad') return 'badge-danger';
  return 'badge-neutral';
}
