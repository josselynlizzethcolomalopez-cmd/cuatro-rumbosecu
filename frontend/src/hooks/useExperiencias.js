import { useCallback, useEffect, useState } from 'react'
import { listarExperiencias, obtenerPricing } from '../services/experienciasApi'

// Devuelve { experiencias, pricing, cargando, error, recargar } para que cada pantalla maneje los tres estados.
export function useExperiencias(opciones) {
  const [experiencias, setExperiencias] = useState([])
  const [pricing, setPricing] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [lista, p] = await Promise.all([listarExperiencias(opciones), obtenerPricing()])
      setExperiencias(lista)
      setPricing(p)
    } catch (e) {
      console.error(e)
      setError('No pudimos cargar las experiencias. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opciones?.soloActivos])

  useEffect(() => { recargar() }, [recargar])

  return { experiencias, pricing, cargando, error, recargar }
}
