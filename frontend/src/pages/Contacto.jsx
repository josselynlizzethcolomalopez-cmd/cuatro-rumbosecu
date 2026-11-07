import { useState } from 'react'
import { BRAND } from '../config'
import { enviarMensaje } from '../services/mensajesApi'

const vacio = { name: '', email: '', message: '' }
const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export default function Contacto() {
  const [form, setForm] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState('idle') // idle | enviando | ok | error
  const [msgError, setMsgError] = useState('')

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function validar() {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Escribe tu nombre.'
    if (!emailValido(form.email)) e.email = 'Escribe un correo válido.'
    if (form.message.trim().length < 10) e.message = 'Cuéntanos un poco más (mínimo 10 caracteres).'
    if (form.message.length > 1000) e.message = 'Máximo 1000 caracteres.'
    return e
  }

  async function enviar(ev) {
    ev.preventDefault()
    const e = validar()
    setErrores(e)
    if (Object.keys(e).length) return
    setEstado('enviando')
    try {
      await enviarMensaje(form)
      setEstado('ok')
      setForm(vacio)
    } catch (err) {
      console.error(err)
      setMsgError('No pudimos enviar tu mensaje. Inténtalo de nuevo en un momento.')
      setEstado('error')
    }
  }

  return (
    <section className="container section contacto">
      <div>
        <h1>Contacto</h1>
        <p className="lead">¿Tienes dudas o quieres cotizar? Escríbenos y te respondemos pronto.</p>
        <p>📧 {BRAND.email}<br />📞 {BRAND.telefono}<br />📍 {BRAND.ciudad}</p>
      </div>

      <form className="form" onSubmit={enviar} noValidate>
        {estado === 'ok' && <div className="alert alert--ok" role="status">¡Mensaje enviado! Gracias por escribirnos.</div>}
        {estado === 'error' && <div className="alert alert--error" role="alert">{msgError}</div>}

        <label>Nombre
          <input name="name" value={form.name} onChange={cambiar} autoComplete="name" />
          {errores.name && <small className="field-error">{errores.name}</small>}
        </label>
        <label>Correo
          <input name="email" type="email" value={form.email} onChange={cambiar} autoComplete="email" />
          {errores.email && <small className="field-error">{errores.email}</small>}
        </label>
        <label>Mensaje
          <textarea name="message" rows="5" value={form.message} onChange={cambiar} />
          {errores.message && <small className="field-error">{errores.message}</small>}
        </label>
        <button className="btn" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </section>
  )
}
