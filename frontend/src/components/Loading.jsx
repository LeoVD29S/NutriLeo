export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20" strokeLinecap="round" />
        </svg>
      </div>
      <div className="loading-spinner" />
      <p>Cargando consultorio...</p>
    </div>
  );
}
