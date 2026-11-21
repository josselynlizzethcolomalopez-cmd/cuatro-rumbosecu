import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BRAND, MUNDOS, PASOS, PRICING_DEFECTO, urlFoto } from '../config'
import { useExperiencias } from '../hooks/useExperiencias'
import ExperienceCard from '../components/ExperienceCard'
import Loader from '../components/Loader'

// Animación de entrada reutilizable: aparece suave cuando la sección entra en pantalla.
const aparecer = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export default function Home() {
  const { experiencias, pricing, cargando } = useExperiencias()
  // Destacadas: la primera experiencia de cada mundo, para mostrar variedad en el inicio.
  const destacadas = Object.keys(MUNDOS).map((m) => experiencias.find((x) => x.world === m)).filter(Boolean)
  // Porcentajes para el bloque explicativo del precio justo (si no hay Firestore, usa los de ejemplo).
  const p = pricing ?? PRICING_DEFECTO
  const pctPlat = Math.round(p.platformPct * 100)
  const pctFondo = Math.round(p.fundPct * 100)
  const pctOp = 100 - pctPlat - pctFondo

  return (
    <>
      <section className="hero">
        {/* Foto de fondo (public/img/hero.jpg). Si no existe, se ve el degradado verde. */}
        <div className="hero__bg" style={{ '--foto': `url(${urlFoto('hero')})` }} aria-hidden="true" />
        <div className="container hero__grid">
          <div>
            <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#c5e04b' }}>
              Turismo sostenible en Ecuador
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              Cuatro mundos. <em>Caminos poco conocidos.</em> Precio justo.
            </motion.h1>
            <motion.p className="hero__lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              {BRAND.descripcion}
            </motion.p>
            <div className="hero__cta">
              <Link className="btn" to="/experiencias">Ver experiencias</Link>
              <Link className="btn btn--ghost" to="/contacto">Escríbenos</Link>
            </div>
            <div className="hero__stats">
              <div><strong>4</strong><span>mundos por descubrir</span></div>
              <div><strong>{pctOp} %</strong><span>del precio al negocio local</span></div>
              <div><strong>100 %</strong><span>transparente</span></div>
            </div>
          </div>
        </div>
        <svg className="hero__wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 C240 90 480 0 720 36 C960 72 1200 10 1440 44 V80 H0Z" />
        </svg>
      </section>

      <section className="container section">
        <motion.div {...aparecer} className="section__head">
          <p className="eyebrow">Explora</p>
          <h2>Elige tu mundo</h2>
          <p className="lead">Un solo catálogo para recorrer Ecuador de punta a punta, con negocios y comunidades que merecen ser conocidos.</p>
        </motion.div>
        <div className="grid grid--4">
          {Object.entries(MUNDOS).map(([clave, m], i) => (
            <motion.div key={clave} {...aparecer} transition={{ duration: 0.45, delay: i * 0.08 }}>
              <Link to="/experiencias" className={`mundo mundo--${clave}`} style={{ '--foto': `url(${urlFoto(clave)})` }}>
                <span className="mundo__icon" aria-hidden="true">{m.icono}</span>
                <h3>{m.nombre}</h3>
                <p>{m.texto}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <motion.div {...aparecer} className="section__head">
            <p className="eyebrow">Así de simple</p>
            <h2>Cómo funciona</h2>
          </motion.div>
          <div className="grid grid--3">
            {PASOS.map((paso, i) => (
              <motion.div className="step" key={paso.titulo} {...aparecer} transition={{ duration: 0.45, delay: i * 0.1 }}>
                <div className="step__n">{i + 1}</div>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="fairbox">
          <motion.div {...aparecer}>
            <p className="eyebrow">Nuestra promesa</p>
            <h2>Precio justo, a la vista</h2>
            <p className="lead">
              Antes de reservar ves exactamente adónde va tu dinero. La mayor parte llega al negocio o la comunidad que te recibe.
            </p>
            <ul>
              {BRAND.valores.map((v) => <li key={v.titulo}><strong>{v.titulo}.</strong> {v.texto}</li>)}
            </ul>
          </motion.div>
          <motion.div className="fairbox__card" {...aparecer}>
            <h3>Ejemplo: tu pago de 100 USD</h3>
            <div className="fair__bar" aria-hidden="true">
              <span className="fair__op" style={{ width: `${pctOp}%` }} />
              <span className="fair__pl" style={{ width: `${pctPlat}%` }} />
              <span className="fair__fo" style={{ width: `${pctFondo}%` }} />
            </div>
            <div className="fairbox__legend">
              <span><i className="dot" style={{ background: 'var(--color-primary)' }} /><strong>{pctOp} %</strong> al negocio local</span>
              <span><i className="dot" style={{ background: 'var(--color-accent)' }} /><strong>{pctPlat} %</strong> a la plataforma</span>
              <span><i className="dot" style={{ background: 'var(--costa)' }} /><strong>{pctFondo} %</strong> al fondo comunitario</span>
            </div>
            <p className="muted">Porcentajes de ejemplo del prototipo; en un negocio real se acuerdan con cada operador.</p>
          </motion.div>
        </div>
      </section>

      <section className="container section">
        <motion.div {...aparecer} className="section__head">
          <p className="eyebrow">Para empezar</p>
          <h2>Experiencias destacadas</h2>
        </motion.div>
        {cargando ? <Loader /> : (
          <div className="grid grid--cat">
            {destacadas.map((x, i) => <ExperienceCard key={x.id} experiencia={x} pricing={pricing} index={i} />)}
          </div>
        )}
        <p><Link to="/experiencias">Ver todo el catálogo →</Link></p>
      </section>

      <section className="container section">
        <motion.div className="cta" {...aparecer}>
          <h2>¿Listo para tu próximo camino?</h2>
          <p>Cuéntanos qué tipo de aventura buscas y te ayudamos a encontrarla. También puedes preguntarle a nuestro asistente.</p>
          <Link className="btn" to="/contacto">Escríbenos</Link>
        </motion.div>
      </section>
    </>
  )
}
