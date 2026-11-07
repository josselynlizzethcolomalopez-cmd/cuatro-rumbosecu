import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../config'
import { useExperiencias } from '../hooks/useExperiencias'
import { preguntarAlAsistente } from '../services/iaApi'

// Asistente flotante: conoce el catálogo real y responde con el tono de la marca.
export default function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: `¡Hola! Soy el asistente de ${BRAND.nombre}. ¿Qué tipo de aventura buscas: Costa, Sierra, Amazonía o Galápagos?` },
  ])
  const { experiencias, pricing } = useExperiencias()
  const fin = useRef(null)

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes, abierto])

  async function enviar(e) {
    e.preventDefault()
    const pregunta = texto.trim()
    if (!pregunta || pensando) return
    setMensajes((m) => [...m, { de: 'yo', texto: pregunta }])
    setTexto('')
    setPensando(true)
    const respuesta = await preguntarAlAsistente(pregunta, experiencias, pricing)
    setMensajes((m) => [...m, { de: 'bot', texto: respuesta }])
    setPensando(false)
  }

  return (
    <div className="chatbot">
      {abierto && (
        <div className="chatbot__panel" role="dialog" aria-label="Asistente virtual">
          <div className="chatbot__head">Asistente de {BRAND.nombre}</div>
          <div className="chatbot__msgs">
            {mensajes.map((m, i) => (
              <p key={i} className={`msg msg--${m.de}`}>{m.texto}</p>
            ))}
            {pensando && <p className="msg msg--bot">Escribiendo…</p>}
            <div ref={fin} />
          </div>
          <form className="chatbot__form" onSubmit={enviar}>
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu pregunta…" aria-label="Tu pregunta" />
            <button className="btn btn--small" disabled={pensando}>Enviar</button>
          </form>
        </div>
      )}
      <button className="chatbot__fab" onClick={() => setAbierto(!abierto)} aria-label="Abrir asistente">
        {abierto ? '✕' : '💬'}
      </button>
    </div>
  )
}
