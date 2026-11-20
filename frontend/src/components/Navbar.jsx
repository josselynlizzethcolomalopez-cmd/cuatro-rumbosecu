import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { BRAND } from '../config'
import { useAuth } from '../hooks/useAuth'
import Logo from './Logo'

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const { esAdmin } = useAuth()
  const cerrar = () => setAbierto(false)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={cerrar}>
          <Logo className="navbar__logo" />
          <span>
            {BRAND.corto}
            <small>{BRAND.subtitulo}</small>
          </span>
        </Link>
        <button
          className="navbar__toggle"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          ☰
        </button>
        <nav className={`navbar__links ${abierto ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={cerrar}>Inicio</NavLink>
          <NavLink to="/experiencias" onClick={cerrar}>Experiencias</NavLink>
          <NavLink to="/contacto" onClick={cerrar}>Contacto</NavLink>
          <NavLink to={esAdmin ? '/admin' : '/login'} onClick={cerrar}>{esAdmin ? 'Panel' : 'Admin'}</NavLink>
        </nav>
      </div>
    </header>
  )
}
