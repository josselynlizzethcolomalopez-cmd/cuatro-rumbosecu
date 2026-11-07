import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseListo } from './firebase'
import { EXPERIENCIAS_DEMO, PRICING_DEFECTO } from '../config'

const col = () => collection(db, 'experiences')

// Lee las experiencias activas. Si Firebase no está listo o no hay datos, devuelve las de ejemplo.
export async function listarExperiencias({ soloActivos = true } = {}) {
  if (!firebaseListo) return EXPERIENCIAS_DEMO
  const snap = await getDocs(query(col(), orderBy('title')))
  const todas = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const lista = soloActivos ? todas.filter((x) => x.active !== false) : todas
  return lista.length || !soloActivos ? lista : EXPERIENCIAS_DEMO
}

// Porcentajes del precio justo: viven en Firestore (settings/pricing) para cambiarlos sin tocar el código.
// Si todavía no existen, usamos los valores de ejemplo.
export async function obtenerPricing() {
  if (!firebaseListo) return PRICING_DEFECTO
  try {
    const snap = await getDoc(doc(db, 'settings', 'pricing'))
    if (!snap.exists()) return PRICING_DEFECTO
    const { platformPct, fundPct } = snap.data()
    const validos = typeof platformPct === 'number' && typeof fundPct === 'number' && platformPct + fundPct < 1
    return validos ? { platformPct, fundPct } : PRICING_DEFECTO
  } catch (e) {
    console.warn('No pude leer settings/pricing; uso los valores de ejemplo.', e)
    return PRICING_DEFECTO
  }
}

// El formulario entrega todo como texto: convertimos los números antes de guardar.
const limpiar = (d) => ({
  ...d,
  basePrice: Number(d.basePrice) || 0,
  durationHours: Number(d.durationHours) || 0,
  maxGroupSize: Number(d.maxGroupSize) || 1,
})

export const crearExperiencia = (data) =>
  addDoc(col(), { ...limpiar(data), active: data.active ?? true, createdAt: serverTimestamp() })

export const actualizarExperiencia = (id, data) =>
  updateDoc(doc(db, 'experiences', id), limpiar(data))

export const eliminarExperiencia = (id) => deleteDoc(doc(db, 'experiences', id))
