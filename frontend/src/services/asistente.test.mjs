// Pruebas del asistente sin red ni Firebase:  node --test frontend/src/services/asistente.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { responderConReglas, detectarIdioma, extraerDias, extraerPresupuesto, armarPlan, normalizar } from './asistenteReglas.js'
import { respuestaValida, instruccionDelSistema } from './asistentePrompt.js'

// Catálogo de PRUEBA (datos de ejemplo, no reales). basePrice 0.85 del total con 10 % + 5 %.
const ex = (id, es, en, world, difficulty, basePrice, extra = {}) => ({
  id, title: { es, en }, world, difficulty, basePrice, durationHours: 5, maxGroupSize: 8,
  badges: ['gestion-local'], isExample: true, active: true, adventureType: 'trekking', ...extra,
})
const CAT = [
  ex('a', 'Caminata bosque nublado', 'Cloud forest hike', 'sierra', 'moderate', 34),   // total 40
  ex('b', 'Mercado y cultura Otavalo', 'Otavalo market and culture', 'sierra', 'easy', 25.5), // 30
  ex('c', 'Volcán en bici', 'Volcano biking', 'sierra', 'demanding', 51),               // 60
  ex('d', 'Convivencia en la selva', 'Jungle community stay', 'amazonia', 'easy', 68),  // 80
  ex('e', 'Canotaje río', 'River canoe', 'amazonia', 'moderate', 85),                    // 100
  ex('f', 'Snorkel con tortugas', 'Turtle snorkel', 'galapagos', 'moderate', 255),       // 300
  ex('g', 'Surf para principiantes', 'Beginner surf', 'costa', 'easy', 21.25),           // 25
  ex('h', 'Experiencia inactiva', 'Inactive', 'costa', 'easy', 10, { active: false }),
]
const MARCA = { nombre: 'Marca Prueba', email: 'hola@prueba.ec' }
const r = (q) => responderConReglas(q, CAT, { marca: MARCA })

test('helpers: idioma, días y presupuesto', () => {
  assert.equal(detectarIdioma('I have 3 days and $150, what do you recommend?'), 'en')
  assert.equal(detectarIdioma('Tengo 3 días y 150 dólares'), 'es')
  assert.equal(extraerDias('I have three days'), 3)
  assert.equal(extraerDias('tengo 5 días'), 5)
  assert.equal(extraerPresupuesto('I have 3 days and $150'), 150)
  assert.equal(extraerPresupuesto('tengo 80 dólares'), 80)
  assert.equal(extraerPresupuesto('hola'), null)
})

test('caso principal: gringo con 3 días y $150 recibe plan en inglés dentro del presupuesto', () => {
  const out = r('Hi! I have 3 days and $150. What do you recommend doing in Ecuador?')
  assert.match(out, /With 3 days and \$150/)
  assert.match(out, /Cloud forest hike|Otavalo market|Volcano biking/) // títulos en inglés
  assert.doesNotMatch(out, /Caminata|Mercado/)                          // no mezcla español
  const total = Number(out.match(/Total: \$(\d+)/)[1])
  assert.ok(total <= 150)
  assert.match(out, /do not include lodging/)                            // honestidad sobre lo no incluido
  assert.match(out, /\[sample\]/)                                        // datos de ejemplo marcados
  assert.doesNotMatch(out, /Inactive/)                                   // no recomienda inactivas
})

test('el mismo caso en español responde en español', () => {
  const out = r('Tengo 3 días y 150 dólares, ¿qué me recomiendas?')
  assert.match(out, /Con 3 días y \$150/)
  assert.match(out, /Caminata bosque nublado/)
})

test('nunca excede el presupuesto ni propone más experiencias que días', () => {
  for (const [dias, pres] of [[1, 150], [2, 90], [3, 150], [3, 500], [7, 20]]) {
    const plan = armarPlan(CAT.map((e) => normalizar(e)), { presupuesto: pres, maxItems: Math.min(dias, 3) })
    if (plan) {
      assert.ok(plan.suma <= pres, `suma ${plan.suma} > ${pres}`)
      assert.ok(plan.items.length <= dias)
    }
  }
})

test('presupuesto insuficiente: lo dice y no inventa', () => {
  const out = r('I have 2 days and $10')
  assert.match(out, /don't have a catalog experience that fits/)
  assert.match(out, /hola@prueba\.ec/)
})

test('"selva con $80": solo Amazonía y dentro del presupuesto', () => {
  const out = r('Tengo $80 y quiero algo en la selva')
  assert.match(out, /Convivencia en la selva/)
  assert.doesNotMatch(out, /Canotaje/) // $100 > $80
})

test('niños / fácil: solo dificultad easy', () => {
  const out = r('I want an easy activity for my kids, 2 days, $100')
  assert.match(out, /Otavalo market|Jungle community|Beginner surf/)
  assert.doesNotMatch(out, /Cloud forest hike|Volcano biking|River canoe/)
})

test('desglose del precio justo', () => {
  assert.match(r('¿Cuánto de lo que pago llega a la comunidad?'), /llegan al operador local/)
  assert.match(r('How much of my money goes to the local operator?'), /goes to the local operator/)
})

test('Galápagos y requisitos: no inventa cifras', () => {
  const out = r('How much does it cost to enter the Galapagos? entry fee')
  assert.doesNotMatch(out, /\$\d/)
  assert.match(out, /official source/)
})

test('hotel de 5 estrellas: reconoce que no lo ofrece', () => {
  assert.match(r('Recomiéndame un hotel de 5 estrellas'), /No ofrecemos hoteles/)
  assert.match(r('Recommend a 5-star hotel'), /don't offer hotels/)
})

test('fuera de tema vuelve al turismo; falta de datos pide días y presupuesto', () => {
  assert.match(r('Escribe un poema sobre política'), /asistente de turismo/)
  assert.match(r('Write a poem about politics'), /travel assistant/)
  assert.match(r('I want to hike somewhere'), /need your days and budget/)
})

test('catálogo vacío no se rompe', () => {
  assert.match(responderConReglas('hello', [], { marca: MARCA }), /don't have experiences|Aún no tengo/)
})

test('guarda anti-invención: acepta precios del catálogo y rechaza inventados', () => {
  assert.equal(respuestaValida('Try the Cloud forest hike for $40 and Otavalo for $30, total $70.', 'I have $150', CAT), true)
  assert.equal(respuestaValida('The Galapagos cruise costs $1,200.', 'I have $150', CAT), false)
  assert.equal(respuestaValida('', 'x', CAT), false)
})

test('instrucción del sistema contiene el catálogo y las reglas clave', () => {
  const p = instruccionDelSistema(CAT)
  assert.match(p, /Cloud forest hike/)
  assert.match(p, /\$40/)
  assert.match(p, /Never invent/)
  assert.match(p, /DATO DE EJEMPLO/)
  assert.doesNotMatch(p, /Inactive/ ) // se filtra abajo si aplica
})
