import { BRAND } from '../config'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p><strong>{BRAND.nombre}</strong> · {BRAND.ciudad}</p>
        <p>{BRAND.email} · {BRAND.telefono}</p>
        <p className="muted">© {new Date().getFullYear()} {BRAND.nombre}. Proyecto final.</p>
      </div>
    </footer>
  )
}
