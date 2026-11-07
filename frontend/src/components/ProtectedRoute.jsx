import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from './Loader'

// Protege /admin en la interfaz. La protección REAL de los datos está en firestore.rules.
export default function ProtectedRoute({ children }) {
  const { esAdmin, cargando } = useAuth()
  if (cargando) return <Loader texto="Verificando acceso…" />
  return esAdmin ? children : <Navigate to="/login" replace />
}
