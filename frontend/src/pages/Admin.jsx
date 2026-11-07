import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useExperiencias } from '../hooks/useExperiencias'
import {
  actualizarExperiencia, crearExperiencia, eliminarExperiencia,
} from '../services/experienciasApi'
import { desglosarPrecio, usd } from '../services/precio'
import { MUNDOS, DIFICULTADES } from '../config'
import { eliminarMensaje, listarMensajes, marcarLeido } from '../services/mensajesApi'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

const VACIO = {
  title: '', description: '', world: 'sierra', province: '', adventureType: '', difficulty: 'easy',
  durationHours: '', basePrice: '', maxGroupSize: '', imageUrl: '', isExample: true, active: true,
}

export default function Admin() {
  const { logout, user } = useAuth()
  const [tab, setTab] = useState('experiencias')
  return (
    <section className="container section">
      <div className="admin__head">
        <h1>Panel de administración</h1>
        <div><span className="muted">{user?.email}</span>{' '}<button className="btn btn--small btn--ghost" onClick={logout}>Salir</button></div>
      </div>
      <div className="filters">
        <button className={`chip ${tab === 'experiencias' ? 'is-active' : ''}`} onClick={() => setTab('experiencias')}>Experiencias</button>
        <button className={`chip ${tab === 'mensajes' ? 'is-active' : ''}`} onClick={() => setTab('mensajes')}>Mensajes</button>
      </div>
      {tab === 'experiencias' ? <GestorExperiencias /> : <BandejaMensajes />}
    </section>
  )
}

function GestorExperiencias() {
  // Pedimos TODAS (también las inactivas) para poder reactivarlas.
  const { experiencias, pricing, cargando, error, recargar } = useExperiencias({ soloActivos: false })
  const [form, setForm] = useState(VACIO)
  const [editId, setEditId] = useState(null)
  const [msg, setMsg] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  async function guardar(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) { setMsg('Título y descripción son obligatorios.'); return }
    // Poco conocido no significa sin límites: exigimos capacidad máxima de grupo.
    if (!(Number(form.maxGroupSize) >= 1)) { setMsg('Indica el grupo máximo (mínimo 1) para proteger el lugar.'); return }
    if (!(Number(form.basePrice) > 0)) { setMsg('El precio para el operador debe ser mayor que 0.'); return }
    setGuardando(true)
    setMsg('')
    try {
      if (editId) await actualizarExperiencia(editId, form)
      else await crearExperiencia(form)
      setForm(VACIO); setEditId(null)
      await recargar()
    } catch (err) {
      console.error(err)
      setMsg('No se pudo guardar. ¿Tu cuenta está en la colección "admins"?')
    } finally { setGuardando(false) }
  }

  function editar(x) {
    setEditId(x.id)
    setForm({
      title: x.title, description: x.description, world: x.world, province: x.province ?? '',
      adventureType: x.adventureType ?? '', difficulty: x.difficulty ?? 'easy',
      durationHours: x.durationHours ?? '', basePrice: x.basePrice, maxGroupSize: x.maxGroupSize ?? '',
      imageUrl: x.imageUrl ?? '', isExample: x.isExample === true, active: x.active !== false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function borrar(x) {
    if (!window.confirm(`¿Eliminar "${x.title}"?`)) return
    try { await eliminarExperiencia(x.id); await recargar() } catch { setMsg('No se pudo eliminar.') }
  }

  // Vista previa de lo que verá el viajero con el precio que escribe el admin
  const previa = Number(form.basePrice) > 0 && pricing ? desglosarPrecio(form.basePrice, pricing) : null

  return (
    <>
      <form className="form form--wide" onSubmit={guardar}>
        <h2>{editId ? 'Editar experiencia' : 'Nueva experiencia'}</h2>
        {msg && <div className="alert alert--error" role="alert">{msg}</div>}
        <div className="grid grid--2">
          <label>Título<input name="title" value={form.title} onChange={cambiar} /></label>
          <label>Mundo
            <select name="world" value={form.world} onChange={cambiar}>
              {Object.entries(MUNDOS).map(([k, m]) => <option key={k} value={k}>{m.nombre}</option>)}
            </select>
          </label>
          <label>Provincia<input name="province" value={form.province} onChange={cambiar} /></label>
          <label>Tipo de aventura<input name="adventureType" value={form.adventureType} onChange={cambiar} placeholder="trekking, surf, snorkel…" /></label>
          <label>Dificultad
            <select name="difficulty" value={form.difficulty} onChange={cambiar}>
              {Object.entries(DIFICULTADES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Duración (horas)<input name="durationHours" type="number" min="0" step="0.5" value={form.durationHours} onChange={cambiar} /></label>
          <label>Precio para el operador (USD por persona)<input name="basePrice" type="number" min="0" step="0.01" value={form.basePrice} onChange={cambiar} /></label>
          <label>Grupo máximo (personas)<input name="maxGroupSize" type="number" min="1" value={form.maxGroupSize} onChange={cambiar} /></label>
          <label>URL de imagen (opcional)<input name="imageUrl" value={form.imageUrl} onChange={cambiar} /></label>
        </div>
        {previa && (
          <p className="muted">
            El viajero pagará <strong>{usd(previa.total)}</strong>: {usd(previa.operador)} ({previa.pctOperador} %) para el operador,
            {' '}{usd(previa.plataforma)} plataforma, {usd(previa.fondo)} fondo comunitario.
          </p>
        )}
        <label>Descripción<textarea name="description" rows="3" value={form.description} onChange={cambiar} /></label>
        <label className="check"><input type="checkbox" name="isExample" checked={form.isExample} onChange={cambiar} /> Es un dato de ejemplo (desmarca solo si viene de un operador real)</label>
        <label className="check"><input type="checkbox" name="active" checked={form.active} onChange={cambiar} /> Visible en el catálogo</label>
        <div>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear experiencia'}</button>{' '}
          {editId && <button type="button" className="btn btn--ghost" onClick={() => { setEditId(null); setForm(VACIO) }}>Cancelar</button>}
        </div>
      </form>

      <h2>Experiencias ({experiencias.length})</h2>
      <ErrorMessage mensaje={error} onReintentar={recargar} />
      {cargando ? <Loader /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Título</th><th>Mundo</th><th>Operador recibe</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {experiencias.map((x) => (
                <tr key={x.id}>
                  <td>{x.title}</td><td>{MUNDOS[x.world]?.nombre ?? x.world}</td><td>{usd(Number(x.basePrice))}</td>
                  <td>{x.active === false ? 'Oculta' : 'Visible'}</td>
                  <td className="actions">
                    {String(x.id).startsWith('demo')
                      ? <span className="muted">ejemplo</span>
                      : <><button className="btn btn--small" onClick={() => editar(x)}>Editar</button> <button className="btn btn--small btn--danger" onClick={() => borrar(x)}>Eliminar</button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function BandejaMensajes() {
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true); setError('')
    try { setMensajes(await listarMensajes()) }
    catch { setError('No se pudieron cargar los mensajes.') }
    finally { setCargando(false) }
  }, [])
  useEffect(() => { cargar() }, [cargar])

  if (cargando) return <Loader texto="Cargando mensajes…" />
  return (
    <>
      <ErrorMessage mensaje={error} onReintentar={cargar} />
      {mensajes.length === 0 && !error && <p className="muted">Aún no hay mensajes.</p>}
      {mensajes.map((m) => (
        <article key={m.id} className={`card msg-card ${m.read ? '' : 'is-unread'}`}>
          <h3>{m.name} <small className="muted">· {m.email}</small></h3>
          <p>{m.message}</p>
          <p className="muted">{m.createdAt?.toDate?.().toLocaleString('es-CO') ?? ''}</p>
          <button className="btn btn--small" onClick={async () => { await marcarLeido(m.id, !m.read); cargar() }}>
            {m.read ? 'Marcar como no leído' : 'Marcar como leído'}
          </button>{' '}
          <button className="btn btn--small btn--danger" onClick={async () => { if (window.confirm('¿Eliminar mensaje?')) { await eliminarMensaje(m.id); cargar() } }}>Eliminar</button>
        </article>
      ))}
    </>
  )
}
