import { Link } from 'react-router-dom'
import { BRAND, MUNDOS, CREDITOS_FOTOS } from '../config'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h3>{BRAND.nombre}</h3>
            <p>{BRAND.eslogan}</p>
            <p className="muted">Turismo sostenible en {BRAND.ciudad}.</p>
          </div>
          <div>
            <h3>Explora</h3>
            <div className="footer__links">
              <Link to="/experiencias">Experiencias</Link>
              {Object.entries(MUNDOS).map(([clave, m]) => <span key={clave}>{m.icono} {m.nombre}</span>)}
            </div>
          </div>
          <div>
            <h3>Contacto</h3>
            <p><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
            {BRAND.telefono && <p>{BRAND.telefono}</p>}
            <p><Link to="/contacto">Escríbenos</Link></p>
          </div>
        </div>
        <p className="muted footer__credits">{CREDITOS_FOTOS}</p>
        <p className="muted footer__bottom">© {new Date().getFullYear()} {BRAND.nombre}. Proyecto final · Jóvenes creaTIvos.</p>
      </div>
    </footer>
  )
}
