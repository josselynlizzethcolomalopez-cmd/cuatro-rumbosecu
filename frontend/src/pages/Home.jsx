import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BRAND } from '../config'
import { useExperiencias } from '../hooks/useExperiencias'
import ExperienceCard from '../components/ExperienceCard'
import Loader from '../components/Loader'

export default function Home() {
  const { experiencias, pricing, cargando } = useExperiencias()

  return (
    <>
      <section className="hero">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {BRAND.nombre}
          </motion.h1>
          <motion.p className="hero__lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            {BRAND.eslogan}
          </motion.p>
          <div className="hero__cta">
            <Link className="btn" to="/experiencias">Ver experiencias</Link>
            <Link className="btn btn--ghost" to="/contacto">Escríbenos</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Qué hacemos</h2>
        <p className="lead">{BRAND.descripcion}</p>
        <div className="grid grid--3">
          {BRAND.valores.map((v) => (
            <div className="value" key={v.titulo}>
              <h3>{v.titulo}</h3>
              <p>{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Experiencias destacadas</h2>
        {cargando ? <Loader /> : (
          <div className="grid grid--3">
            {experiencias.slice(0, 3).map((x, i) => <ExperienceCard key={x.id} experiencia={x} pricing={pricing} index={i} />)}
          </div>
        )}
        <p><Link to="/experiencias">Ver todo el catálogo →</Link></p>
      </section>
    </>
  )
}
