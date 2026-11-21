import { useMemo, useState } from 'react'
import { useExperiencias } from '../hooks/useExperiencias'
import { MUNDOS, PRICING_DEFECTO } from '../config'
import { desglosarPrecio } from '../services/precio'
import ExperienceCard from '../components/ExperienceCard'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

// Rangos de duración del filtro (en horas)
const DURACIONES = {
  todas: { texto: 'Todas', ok: () => true },
  dia: { texto: 'Hasta 1 día', ok: (h) => h <= 8 },
  varios: { texto: '2 a 3 días', ok: (h) => h > 8 && h <= 72 },
  largo: { texto: '4 días o más', ok: (h) => h > 72 },
}

export default function Catalogo() {
  const { experiencias, pricing, cargando, error, recargar } = useExperiencias()
  const precios = pricing ?? PRICING_DEFECTO

  // Estado de los filtros
  const [busqueda, setBusqueda] = useState('')
  const [mundos, setMundos] = useState([]) // vacío = todos
  const [tope, setTope] = useState(null) // null = sin tope
  const [duracion, setDuracion] = useState('todas')
  const [orden, setOrden] = useState('nombre')

  // Precio total por persona de cada experiencia (con el precio justo ya sumado)
  const conTotal = useMemo(
    () => experiencias.map((x) => ({ ...x, total: desglosarPrecio(x.basePrice, precios).total })),
    [experiencias, precios],
  )
  const techo = Math.max(10, Math.ceil(Math.max(0, ...conTotal.map((x) => x.total)) / 10) * 10)
  const limite = tope ?? techo

  // Filtramos y ordenamos en el cliente: el catálogo es pequeño y el cambio es instantáneo.
  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = conTotal.filter((x) =>
      (!q || [x.title, x.province, x.adventureType].some((t) => (t ?? '').toLowerCase().includes(q)))
      && (mundos.length === 0 || mundos.includes(x.world))
      && x.total <= limite
      && DURACIONES[duracion].ok(Number(x.durationHours) || 0))
    const orden_ = {
      nombre: (a, b) => a.title.localeCompare(b.title, 'es'),
      menor: (a, b) => a.total - b.total,
      mayor: (a, b) => b.total - a.total,
    }
    return [...lista].sort(orden_[orden])
  }, [conTotal, busqueda, mundos, limite, duracion, orden])

  const alternarMundo = (clave) =>
    setMundos((m) => (m.includes(clave) ? m.filter((c) => c !== clave) : [...m, clave]))

  function limpiar() {
    setBusqueda(''); setMundos([]); setTope(null); setDuracion('todas'); setOrden('nombre')
  }

  return (
    <section className="container section">
      <h1>Encuentra tu lugar</h1>
      <p className="lead">Cada tarjeta te muestra cuánto de tu pago llega al negocio o comunidad que te recibe.</p>
      <ErrorMessage mensaje={error} onReintentar={recargar} />
      {cargando ? <Loader texto="Cargando experiencias…" /> : (
        <div className="catalogo">
          {/* Filtros */}
          <aside className="filtros" aria-label="Filtros del catálogo">
            <label className="filtros__bloque">
              <span className="filtros__titulo">Buscar</span>
              <input type="search" placeholder="Nombre, zona o tipo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </label>

            <fieldset className="filtros__bloque">
              <legend className="filtros__titulo">Mundo</legend>
              {Object.entries(MUNDOS).map(([clave, m]) => (
                <label key={clave} className="filtros__check">
                  <input type="checkbox" checked={mundos.includes(clave)} onChange={() => alternarMundo(clave)} /> {m.nombre}
                </label>
              ))}
            </fieldset>

            <label className="filtros__bloque">
              <span className="filtros__titulo">Precio máximo: US$ {limite}</span>
              <input type="range" min="10" max={techo} step="10" value={limite} onChange={(e) => setTope(Number(e.target.value))} />
            </label>

            <label className="filtros__bloque">
              <span className="filtros__titulo">Duración</span>
              <select value={duracion} onChange={(e) => setDuracion(e.target.value)}>
                {Object.entries(DURACIONES).map(([k, d]) => <option key={k} value={k}>{d.texto}</option>)}
              </select>
            </label>

            <button type="button" className="btn btn--ghost" onClick={limpiar}>Limpiar filtros</button>
          </aside>

          {/* Resultados */}
          <div>
            <div className="catalogo__barra">
              <span className="muted">{visibles.length} {visibles.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}</span>
              <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar por">
                <option value="nombre">Nombre, A a Z</option>
                <option value="menor">Precio: de menor a mayor</option>
                <option value="mayor">Precio: de mayor a menor</option>
              </select>
            </div>
            {visibles.length === 0
              ? <p className="muted">No hay lugares con esos filtros. Prueba con “Limpiar filtros”.</p>
              : <div className="grid grid--cat">{visibles.map((x, i) => <ExperienceCard key={x.id} experiencia={x} pricing={precios} index={i} />)}</div>}
            <p className="muted">
              Los porcentajes y precios son valores de ejemplo del prototipo; en un negocio real se acuerdan con cada operador.
              Las experiencias marcadas "Ejemplo" no son ofertas reales.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
