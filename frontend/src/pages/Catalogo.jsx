import { useMemo, useState } from 'react'
import { useExperiencias } from '../hooks/useExperiencias'
import { MUNDOS } from '../config'
import ExperienceCard from '../components/ExperienceCard'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function Catalogo() {
  const { experiencias, pricing, cargando, error, recargar } = useExperiencias()
  const [mundo, setMundo] = useState('todos')

  // Filtramos en el cliente: el catálogo es pequeño y así el cambio de chip es instantáneo.
  const visibles = useMemo(
    () => (mundo === 'todos' ? experiencias : experiencias.filter((x) => x.world === mundo)),
    [experiencias, mundo],
  )

  return (
    <section className="container section">
      <h1>Experiencias</h1>
      <p className="lead">Cada tarjeta te muestra cuánto de tu pago llega al negocio o comunidad que te recibe.</p>
      <ErrorMessage mensaje={error} onReintentar={recargar} />
      {cargando ? <Loader texto="Cargando experiencias…" /> : (
        <>
          <div className="filters" role="group" aria-label="Filtrar por mundo">
            <button className={`chip ${mundo === 'todos' ? 'is-active' : ''}`} onClick={() => setMundo('todos')}>Todos</button>
            {Object.entries(MUNDOS).map(([clave, m]) => (
              <button key={clave} className={`chip ${mundo === clave ? 'is-active' : ''}`} onClick={() => setMundo(clave)}>
                {m.nombre}
              </button>
            ))}
          </div>
          {visibles.length === 0
            ? <p className="muted">Todavía no hay experiencias en este mundo.</p>
            : <div className="grid grid--3">{visibles.map((x, i) => <ExperienceCard key={x.id} experiencia={x} pricing={pricing} index={i} />)}</div>}
          <p className="muted">
            Los porcentajes son valores de ejemplo del prototipo; en un negocio real se acuerdan con cada operador.
            Las experiencias marcadas "Ejemplo" no son ofertas reales.
          </p>
        </>
      )}
    </section>
  )
}
