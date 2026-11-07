export default function ErrorMessage({ mensaje, onReintentar }) {
  if (!mensaje) return null
  return (
    <div className="alert alert--error" role="alert">
      <span>{mensaje}</span>
      {onReintentar && <button className="btn btn--small" onClick={onReintentar}>Reintentar</button>}
    </div>
  )
}
