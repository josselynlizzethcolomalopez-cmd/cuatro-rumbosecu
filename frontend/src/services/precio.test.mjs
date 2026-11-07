import test from 'node:test'
import assert from 'node:assert/strict'
import { desglosarPrecio } from './precio.js'

const pct = { platformPct: 0.10, fundPct: 0.05 }

test('el operador recibe siempre el precio base que fijó', () => {
  const d = desglosarPrecio(45, pct)
  assert.equal(d.operador, 45)
  assert.equal(d.total, 52.94)
})

test('el operador recibe 85 % del total con 10 % de plataforma y 5 % de fondo', () => {
  const d = desglosarPrecio(45, pct)
  assert.equal(d.pctOperador, 85)
  assert.equal(d.pctPlataforma, 10)
  assert.equal(d.pctFondo, 5)
})

test('las partes suman el total (con tolerancia de redondeo)', () => {
  const d = desglosarPrecio(80, pct)
  assert.ok(Math.abs(d.operador + d.plataforma + d.fondo - d.total) < 0.02)
})

test('porcentajes que suman 100 % o más lanzan error en vez de dividir entre cero', () => {
  assert.throws(() => desglosarPrecio(45, { platformPct: 0.6, fundPct: 0.4 }))
})
