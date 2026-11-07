import { app, firebaseListo } from './firebase'
import { BRAND } from '../config'
import { responderConReglas } from './asistenteReglas.js'
import { instruccionDelSistema, respuestaValida } from './asistentePrompt.js'

// ASISTENTE DE IA PERSONALIZADO: recomendador de experiencias, en español e inglés.
// Dos modos, el mismo contrato: preguntarAlAsistente(pregunta, experiencias) -> texto.
//  1) Gemini vía Firebase AI Logic: la clave la guarda Firebase, nunca viaja en el frontend.
//  2) Reglas locales (asistenteReglas.js): respaldo que siempre funciona.
// Si Gemini falla, tarda demasiado o dice algo que no está en el catálogo, se usan las reglas.

const USAR_IA = import.meta.env.VITE_USE_AI === 'true' && firebaseListo
const TIEMPO_MAXIMO_MS = 15000
const MARCA = { nombre: BRAND.nombre, email: BRAND.email }

async function conGemini(pregunta, experiencias, pct) {
  // Import dinámico: el SDK de IA solo se descarga si realmente se usa.
  const { getAI, getGenerativeModel, GoogleAIBackend } = await import('firebase/ai')
  const ai = getAI(app, { backend: new GoogleAIBackend() })
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    systemInstruction: instruccionDelSistema(experiencias, pct),
    generationConfig: { temperature: 0.4, maxOutputTokens: 500 }, // baja temperatura = menos invención
  })
  const espera = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('Tiempo agotado')), TIEMPO_MAXIMO_MS))
  const result = await Promise.race([model.generateContent(pregunta), espera])
  return result.response.text()
}

// pricing = { platformPct, fundPct } leído de Firestore (settings/pricing); si es null se usan los valores por defecto.
export async function preguntarAlAsistente(pregunta, experiencias, pricing) {
  const pct = pricing ?? undefined
  if (USAR_IA) {
    try {
      const respuesta = await conGemini(pregunta, experiencias, pct)
      if (respuestaValida(respuesta, pregunta, experiencias, pct)) return respuesta
      console.warn('La IA mencionó precios que no están en el catálogo; uso el modo de reglas.')
    } catch (err) {
      console.warn('La IA real falló; uso el modo de reglas.', err)
    }
  }
  return responderConReglas(pregunta, experiencias, { marca: MARCA, ...(pct && { pct }) })
}
