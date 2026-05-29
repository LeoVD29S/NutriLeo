export default function Toast({ mensaje, tipo = 'ok', onClose }) {
  if (!mensaje) return null;
  return (
    <div className={`toast toast-${tipo}`} role="status">
      <span>{mensaje}</span>
      <button type="button" onClick={onClose} aria-label="Cerrar">×</button>
    </div>
  );
}
