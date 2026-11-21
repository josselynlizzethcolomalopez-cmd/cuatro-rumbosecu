import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useExperiencias } from '../hooks/useExperiencias'
import { MUNDOS, DIFICULTADES, PRICING_DEFECTO, urlFoto } from '../config'
import { desglosarPrecio, usd } from '../services/precio'
import { enviarMensaje } from '../services/mensajesApi'
import PrecioJusto from '../components/PrecioJusto'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Página de un lugar: foto, datos, precio justo y formulario de consulta.
// La consulta se guarda como un mensaje (colección "messages"), así llega a la bandeja del Panel.
export default function Detalle() {
  const { id } = useParams()
  const { experiencias, pricing, cargando, error, recargar } = useExperiencias()
  const precios = pricing ?? PRICING_DEFECTO
  const e = experiencias.find((x) => x.id === id)

  const [form, setForm] = useState({ name: '', email: '', fecha: '', personas: 2, nota: '' })
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('idle') // idle | enviando | ok | error
  const cambiar = (ev) => setForm({ ...form, [ev.target.name]: ev.target.value })

  if (cargando) return <section className="container section"><Loader texto="Cargando lugar…" /></section>
  if (error) return <section className="container section"><ErrorMessage mensaje={error} onReintentar={recargar} /></section>
  if (!e) {
    return (
      <section className="container section">
        <h1>Lugar no encontrado</h1>
        <p><Link to="/experiencias">← Volver al catálogo</Link></p>
      </section>
    )
  }

  const mundo = MUNDOS[e.world]
  const d = desglosarPrecio(e.basePrice, precios)
  const foto = e.imageUrl || (mundo ? urlFoto(e.world) : '')

  function validar() {
    const er = {}
    if (form.name.trim().length < 2) er.name = 'Escribe tu nombre.'
    if (!emailValido(form.email)) er.email = 'Escribe un correo válido.'
    const p = Number(form.personas)
    if (!(p >= 1) || p > Number(e.maxGroupSize)) er.personas = `Entre 1 y ${e.maxGroupSize} personas.`
    if (form.nota.length > 500) er.nota = 'Máximo 500 caracteres.'
    return er
  }

  async function enviar(ev) {
    ev.preventDefault()
    const er = validar()
    setErrores(er)
    if (Object.keys(er).length) return
    setEstado('enviando')
    try {
      // Reutilizamos el mismo servicio del formulario de contacto: armamos el texto del mensaje.
      const message = [
        `Consulta sobre: ${e.title} (${mundo?.nombre ?? e.world}, ${e.province}).`,
        `Fecha deseada: ${form.fecha || 'sin definir'}. Personas: ${form.personas}.`,
        form.nota.trim() && `Mensaje: ${form.nota.trim()}`,
      ].filter(Boolean).join(' ')
      await enviarMensaje({ name: form.name, email: form.email, message })
      setEstado('ok')
    } catch (err) {
      console.error(err)
      setEstado('error')
    }
  }

  return (
    <section className="container section">
      <p><Link to="/experiencias">← Volver al catálogo</Link></p>
      <div className="detalle">
        <div>
          <div className="detalle__foto" style={{ '--foto': `url(${foto})` }} role="img" aria-label={e.title} />
          <p className="eyebrow">{mundo?.nombre} · {e.province} · {e.adventureType}</p>
          <h1>{e.title}</h1>
          <div>
            {e.isExample && <span className="badge badge--ejemplo">Ejemplo</span>}
          </div>
          <p className="lead">{e.description}</p>

          <ul className="detalle__datos">
            <li><strong>Dificultad</strong>{DIFICULTADES[e.difficulty] ?? e.difficulty}</li>
            <li><strong>Duración</strong>{e.durationHours} h</li>
            <li><strong>Grupo máximo</strong>{e.maxGroupSize} personas</li>
          </ul>

          <h2>Cuidemos el lugar</h2>
          <ul>
            <li>Respetamos el grupo máximo para no sobrecargar el lugar.</li>
            <li>No dejamos residuos ni tocamos la fauna.</li>
            <li>Seguimos a la guía o al guía local y las rutas marcadas.</li>
          </ul>
          <p className="muted">Normas generales de ejemplo del prototipo; cada operador define las suyas.</p>
        </div>

        <aside className="detalle__reserva">
          <p className="card__price">{usd(d.total)} <small>por persona</small></p>
          <PrecioJusto basePrice={e.basePrice} pricing={precios} />

          {estado === 'ok' ? (
            <div className="alert alert--ok" role="status">¡Consulta enviada! Te escribiremos pronto al correo que dejaste.</div>
          ) : (
            <form className="form detalle__form" onSubmit={enviar} noValidate>
              <h3>Consultar</h3>
              {estado === 'error' && <div className="alert alert--error" role="alert">No pudimos enviar tu consulta. Inténtalo de nuevo.</div>}
              <label>Nombre
                <input name="name" value={form.name} onChange={cambiar} autoComplete="name" />
                {errores.name && <small className="field-error">{errores.name}</small>}
              </label>
              <label>Correo
                <input name="email" type="email" value={form.email} onChange={cambiar} autoComplete="email" />
                {errores.email && <small className="field-error">{errores.email}</small>}
              </label>
              <label>Fecha deseada
                <input name="fecha" type="date" value={form.fecha} onChange={cambiar} />
              </label>
              <label>Personas
                <input name="personas" type="number" min="1" max={e.maxGroupSize} value={form.personas} onChange={cambiar} />
                {errores.personas && <small className="field-error">{errores.personas}</small>}
              </label>
              <label>Mensaje (opcional)
                <textarea name="nota" rows="3" value={form.nota} onChange={cambiar} />
                {errores.nota && <small className="field-error">{errores.nota}</small>}
              </label>
              <button className="btn" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar consulta'}</button>
            </form>
          )}
        </aside>
      </div>
    </section>
  )
}
