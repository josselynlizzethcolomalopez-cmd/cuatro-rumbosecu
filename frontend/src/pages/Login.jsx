import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { firebaseListo } from '../services/firebase'

export default function Login() {
  const { login, logout, user, esAdmin, cargando } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (esAdmin) return <Navigate to="/admin" replace />

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="container section narrow">
      <h1>Acceso de administrador</h1>
      {!firebaseListo && <div className="alert alert--error">Firebase aún no está configurado: completa el archivo .env.local.</div>}
      {user && !esAdmin && !cargando && (
        <div className="alert alert--error">
          Esta cuenta no tiene permisos de administrador.{' '}
          <button className="btn btn--small" onClick={logout}>Cerrar sesión</button>
        </div>
      )}
      <form className="form" onSubmit={enviar}>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        <label>Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="btn" disabled={enviando || !firebaseListo}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </section>
  )
}
