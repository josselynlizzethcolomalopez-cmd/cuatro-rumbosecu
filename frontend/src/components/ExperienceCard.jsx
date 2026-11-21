import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MUNDOS, DIFICULTADES, urlFoto } from '../config'
import { desglosarPrecio, usd } from '../services/precio'
import PrecioJusto from './PrecioJusto'

// Tarjeta de experiencia. Lo central del proyecto: el viajero ve cuánto del precio llega al negocio local.
// Toda la tarjeta es un enlace a la página de detalle (/experiencias/:id).
export default function ExperienceCard({ experiencia: e, pricing, index = 0 }) {
  const mundo = MUNDOS[e.world]
  const d = desglosarPrecio(e.basePrice, pricing)

  return (
    <Link to={`/experiencias/${e.id}`} className="card-link" aria-label={`Ver ${e.title}`}>
      <motion.article
        className="card card--media"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      >
        {/* Foto propia si existe; si no, la foto de su mundo (public/img/<mundo>.jpg) o un degradado */}
        <div
          className={`card__banner card__banner--${mundo ? e.world : 'default'}`}
          style={{ '--foto': `url(${e.imageUrl || (mundo ? urlFoto(e.world) : '')})` }}
          aria-hidden="true"
        >
          <span>{mundo?.icono ?? '🧭'}</span>
        </div>
        <div className="card__body">
          <div>
            {mundo && <span className={`badge badge--${e.world}`}>{mundo.nombre}</span>}{' '}
            {e.isExample && <span className="badge badge--ejemplo">Ejemplo</span>}
          </div>
          <h3>{e.title}</h3>
          <p className="muted card__meta">
            {e.province} · {DIFICULTADES[e.difficulty] ?? e.difficulty} · {e.durationHours} h · máx. {e.maxGroupSize} personas
          </p>
          <p className="card__price">{usd(d.total)} <small>por persona</small></p>
          <PrecioJusto basePrice={e.basePrice} pricing={pricing} />
          <p className="card__more">Ver lugar →</p>
        </div>
      </motion.article>
    </Link>
  )
}
