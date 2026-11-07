// Precio justo: función PURA (sin Firebase, sin React) para poder probarla y explicarla en la defensa.
// Idea: el operador fija lo que quiere recibir (basePrice). Sobre ese valor la plataforma
// agrega su comisión y el aporte al fondo comunitario, de modo que:
//   total = basePrice / (1 - platformPct - fundPct)
// y el operador recibe SIEMPRE basePrice (su porcentaje del total es 1 - platformPct - fundPct).
export function desglosarPrecio(basePrice, { platformPct, fundPct }) {
  const base = Number(basePrice) || 0
  const parteOperador = 1 - platformPct - fundPct
  // Protección: si los porcentajes suman 100 % o más, no dividimos entre cero.
  if (parteOperador <= 0) throw new Error('platformPct + fundPct debe ser menor que 1')
  const total = base / parteOperador
  const redondear = (n) => Math.round(n * 100) / 100
  return {
    total: redondear(total),
    operador: redondear(base),
    plataforma: redondear(total * platformPct),
    fondo: redondear(total * fundPct),
    pctOperador: Math.round(parteOperador * 100),
    pctPlataforma: Math.round(platformPct * 100),
    pctFondo: Math.round(fundPct * 100),
  }
}

// Ecuador usa el dólar estadounidense.
export const usd = (n) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n)
