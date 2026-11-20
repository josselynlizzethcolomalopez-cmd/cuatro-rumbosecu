import { motion } from 'framer-motion'
import { MUNDOS, DIFICULTADES, urlFoto } from '../config'
import { desglosarPrecio, usd } from '../services/precio'

// Tarjeta de experiencia. Lo central del proyecto: el viajero ve cuánto del precio llega al negocio local.
export default function ExperienceCard({ experiencia: e, pricing, index = 0 }) {
  const mundo = MUNDOS[e.world]
  const d = desglosarPrecio(e.basePrice, pricing)

  return (
    <motion.article
      className="card card--media"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
    >
      {/* Si la experiencia tiene foto se muestra; si no, un banner con el color y el icono de su mundo */}
      {e.imageUrl
        ? <img className="card__img" src={e.imageUrl} alt={e.title} loading="lazy" />
        : (
          // Sin foto propia: usamos la foto de su mundo (public/img/<mundo>.jpg) o, si no existe, un degradado
          <div
            className={`card__banner card__banner--${mundo ? e.world : 'default'}`}
            style={mundo ? { '--foto': `url(${urlFoto(e.world)})` } : undefined}
            aria-hidden="true"
          >
            <span>{mundo?.icono ?? '🧭'}</span>
          </div>
        )}
      <div className="card__body">
      <div>
        {mundo && <span className={`badge badge--${e.world}`}>{mundo.nombre}</span>}{' '}
        {e.isExample && <span className="badge badge--ejemplo">Ejemplo</span>}
      </div>
      <h3>{e.title}</h3>
      <p className="muted card__meta">
        {e.province} · {DIFICULTADES[e.difficulty] ?? e.difficulty} · {e.durationHours} h · máx. {e.maxGroupSize} personas
      </p>
      <p>{e.description}</p>

      <p className="card__price">{usd(d.total)} <small>por persona</small></p>

      {/* Desglose del precio justo: el ancho de cada tramo es proporcional a su porcentaje */}
      <div className="fair">
        <div className="fair__bar" aria-hidden="true">
          <span className="fair__op" style={{ width: `${d.pctOperador}%` }} />
          <span className="fair__pl" style={{ width: `${d.pctPlataforma}%` }} />
          <span className="fair__fo" style={{ width: `${d.pctFondo}%` }} />
        </div>
        <p className="fair__main"><strong>{usd(d.operador)}</strong> ({d.pctOperador} %) llegan al negocio local</p>
        <p className="muted fair__rest">
          Plataforma {usd(d.plataforma)} ({d.pctPlataforma} %) · Fondo comunitario {usd(d.fondo)} ({d.pctFondo} %)
        </p>
      </div>
      </div>
    </motion.article>
  )
}
