// REGLAS LOCALES DEL ASISTENTE (respaldo sin IA)
// Funciones puras: no tocan Firebase ni el navegador, así se pueden probar con `node --test`.
// Contrato: responderConReglas(pregunta, experiencias, opciones) -> texto en el idioma del viajero.

// Porcentajes por defecto del precio justo. En producción vienen de Firestore (settings/pricing);
// aquí son solo el respaldo si el documento no existe. Valores de ejemplo.
export const PRECIO_JUSTO_POR_DEFECTO = { platformPct: 0.10, fundPct: 0.05 }

const MARCA_POR_DEFECTO = { nombre: 'la plataforma', email: 'hola@ejemplo.com' }

// ---------- Utilidades de datos ----------

// Devuelve el texto en el idioma pedido con respaldo en español (igual que la función t() de la interfaz).
export const texto = (campo, lang) =>
  campo && typeof campo === 'object' ? campo[lang] || campo.es || campo.en || '' : campo || ''

// Precio total que paga el viajero: total = basePrice / (1 - platformPct - fundPct).
export function precioTotal(e, pct = PRECIO_JUSTO_POR_DEFECTO) {
  if (Number.isFinite(e.totalPrice)) return Math.round(e.totalPrice)
  if (Number.isFinite(e.basePrice)) return Math.round(e.basePrice / (1 - pct.platformPct - pct.fundPct))
  return Math.round(Number(e.price) || 0) // catálogo antiguo "services"
}

// Acepta el modelo nuevo (experiences) y el antiguo (services) para que el asistente no se rompa en la migración.
export function normalizar(e, pct) {
  return {
    id: e.id,
    titulo: e.title ?? e.name,
    descripcion: e.description,
    mundo: e.world ?? null,
    tipo: e.adventureType ?? e.category ?? null,
    dificultad: e.difficulty ?? null,
    horas: e.durationHours ?? null,
    grupoMax: e.maxGroupSize ?? null,
    idiomas: e.languages ?? [],
    insignias: e.badges ?? [],
    esEjemplo: e.isExample === true,
    base: Number.isFinite(e.basePrice) ? e.basePrice : null,
    total: precioTotal(e, pct),
    activa: e.active !== false,
  }
}

const usd = (n) => `$${Math.round(n)}`

// ---------- Detección de idioma y datos del mensaje ----------

const PALABRAS_EN = /\b(i|we|my|our|the|and|have|has|want|need|days?|nights?|budget|dollars?|trip|visit|recommend|suggest|what|which|where|how|much|easy|kids?|children|with|for|to|can|please|do|does|is|are|any|something|a|an|about|write|poem|of|in|on|you|me|tell|give|ignore|your|rules)\b/g
const PALABRAS_ES = /\b(yo|tengo|tenemos|quiero|necesito|d[ií]as?|noches?|presupuesto|d[oó]lares|viaje|visitar|recomi[eé]ndame|qu[eé]|cu[aá]l|d[oó]nde|c[oó]mo|cu[aá]nto|f[aá]cil|ni[ñn]os|con|para|por|una?|el|la|los|las|de|y|algo|hola)\b/g

export function detectarIdioma(q) {
  const s = q.toLowerCase()
  const en = (s.match(PALABRAS_EN) || []).length
  const es = (s.match(PALABRAS_ES) || []).length + (/[¿¡áéíóúñ]/.test(s) ? 2 : 0)
  return en > es ? 'en' : 'es'
}

const NUMEROS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7 }

export function extraerDias(q) {
  const s = q.toLowerCase()
  const m = s.match(/(\d+|one|two|three|four|five|six|seven|un|uno|dos|tres|cuatro|cinco|seis|siete)[\s-]*(days?|d[ií]as?|nights?|noches?)/)
  if (!m) return null
  const n = Number(m[1]) || NUMEROS[m[1]]
  return n >= 1 && n <= 30 ? n : null
}

// Presupuesto en dólares: "$150", "150 dollars", "150 usd", "150 dólares", "tengo 150".
export function extraerPresupuesto(q) {
  const s = q.toLowerCase().replace(/,/g, '')
  const m =
    s.match(/\$\s?(\d+(?:\.\d+)?)/) ||
    s.match(/(\d+(?:\.\d+)?)\s?(?:dollars?|usd|bucks|d[oó]lares|dolares)/) ||
    s.match(/(?:budget|presupuesto)[^\d]{0,12}(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : null
}

const MUNDOS = {
  amazonia: /(selva|jungle|rainforest|amazon|amazon[ií]a|yasun[ií]|canoe|canotaje)/,
  galapagos: /(gal[aá]pagos|galapagos)/,
  sierra: /(sierra|andes|andean|volc[aá]n|volcano|mountain|monta[ñn]a|cotopaxi|quito|cuenca|otavalo|cloud forest|bosque nublado|trek|hik|caminata|senderismo)/,
  costa: /(costa|coast|beach|playa|surf|whale|ballena|pacific|pac[ií]fico|monta[ñn]ita)/,
}

export function extraerMundo(q) {
  const s = q.toLowerCase()
  return Object.keys(MUNDOS).find((k) => MUNDOS[k].test(s)) || null
}

export function pideFacil(q) {
  return /(easy|kids?|children|family|relaxed|f[aá]cil|ni[ñn]os|familia|tranquil)/i.test(q)
}

// ---------- Intenciones que NO deben recomendar ----------

const INTENCION = {
  saludo: /^\s*(hola|buenas|hey|hi|hello|good (morning|afternoon|evening))\b/i,
  hotel: /(hotel|hostal|hostel|resort|5[\s-]?star|cinco estrellas|5 estrellas|lodging|alojamiento)/i,
  datoOficial: /(entry (fee|requirement)|visa|passport|pasaporte|tarifa|park fee|ingreso a|entrada a|cu[aá]nto cuesta entrar|how much (is|does).*(enter|entry|ticket)|transit control|tcg|requisitos)/i,
  precioJusto: /(fair price|precio justo|community|comunidad|operator|operador|how much.*(goes|reaches)|cu[aá]nto.*(llega|va|recibe)|where does my money|a d[oó]nde va)/i,
  contacto: /(contact|contacto|escribir|whatsapp|correo|email|hablar con)/i,
  turismo: /(ecuador|viaj|trip|travel|tour|visit|d[ií]as?|days?|nights?|noches?|aventura|adventure|experienc|hik|trek|caminata|selva|jungle|beach|playa|surf|volc|budget|presupuesto|dollar|d[oó]lar|\$|recomi|recommend|suggest|what (can|should) i|qu[eé] (hacer|puedo|me)|kids|ni[ñn]os|easy|f[aá]cil|wildlife|birds?|aves|cultura|culture)/i,
}

// ---------- Textos en los dos idiomas ----------

const T = {
  es: {
    saludo: (m) => `¡Hola! Soy el asistente de ${m.nombre}. Cuéntame cuántos días tienes y tu presupuesto en dólares, y te propongo experiencias del catálogo.`,
    vacio: (m) => `Aún no tengo experiencias cargadas. Escríbenos desde el formulario de contacto o a ${m.email}.`,
    hotel: (m) => `No ofrecemos hoteles, solo experiencias de aventura con negocios locales. Si te interesa una experiencia, dime tus días y presupuesto; para hospedaje, escríbenos por el formulario de contacto (${m.email}) y te orientamos.`,
    datoOficial: () => `Ese dato cambia con el tiempo y no quiero darte una cifra equivocada. Verifícalo en la fuente oficial (Ministerio de Turismo o el Parque Nacional / Consejo de Gobierno de Galápagos) antes de viajar.`,
    fueraDeTema: (m) => `Eso se sale de lo que puedo ayudarte: soy el asistente de turismo de ${m.nombre}. Si me cuentas cuántos días tienes y cuánto quieres gastar, te recomiendo experiencias en Ecuador.`,
    contacto: (m) => `Puedes escribirnos desde la sección Contacto o a ${m.email}.`,
    sinDatos: (m) => `Para recomendarte bien necesito tus días y tu presupuesto en dólares (por persona). Por ejemplo: "tengo 3 días y 150 dólares". Si prefieres, escríbenos a ${m.email}.`,
    ningunaEncaja: (p, m) => `Con ${usd(p)} no tengo una experiencia del catálogo que encaje. Prueba con un presupuesto mayor o escríbenos por el formulario de contacto (${m.email}) y buscamos opciones.`,
    intro: (d, p) => `Con ${d ? d + ' días' : 'ese tiempo'} y ${usd(p)} te propongo:`,
    linea: (n, e, lang) => `${n}. ${texto(e.titulo, lang)} (${usd(e.total)}${e.horas ? `, ${e.horas} h` : ''}${e.mundo ? `, ${e.mundo}` : ''})${e.esEjemplo ? ' [ejemplo]' : ''}`,
    cierre: (suma, p, dias, n) => `Total: ${usd(suma)} de ${usd(p)}.${dias && n < dias ? ` Te quedan días libres para descansar o explorar por tu cuenta.` : ''} Los precios son por persona y no incluyen hospedaje, comidas ni transporte hasta el lugar. Respeta el cupo de cada grupo y las reglas de conducta del lugar.`,
    desglose: (e, lang) => `En "${texto(e.titulo, lang)}" pagas ${usd(e.total)}${e.base ? ` y ${usd(e.base)} llegan al operador local; el resto es comisión de la plataforma y fondo comunitario` : ''}. Los porcentajes son valores de ejemplo del proyecto.`,
  },
  en: {
    saludo: (m) => `Hi! I'm the ${m.nombre} assistant. Tell me how many days you have and your budget in dollars, and I'll suggest experiences from our catalog.`,
    vacio: (m) => `I don't have experiences loaded yet. Please use the contact form or email ${m.email}.`,
    hotel: (m) => `We don't offer hotels, only adventure experiences run by local businesses. If you'd like an experience, tell me your days and budget; for lodging, write to us through the contact form (${m.email}) and we'll point you in the right direction.`,
    datoOficial: () => `That information changes over time and I don't want to give you a wrong number. Please check it with the official source (Ecuador's Ministry of Tourism, or the Galapagos National Park / Government Council) before you travel.`,
    fueraDeTema: (m) => `That's outside what I can help with: I'm the travel assistant for ${m.nombre}. Tell me how many days you have and what you'd like to spend, and I'll recommend experiences in Ecuador.`,
    contacto: (m) => `You can write to us from the Contact section or at ${m.email}.`,
    sinDatos: (m) => `To recommend well I need your days and budget in dollars (per person). For example: "I have 3 days and $150". Or email us at ${m.email}.`,
    ningunaEncaja: (p, m) => `With ${usd(p)} I don't have a catalog experience that fits. Try a higher budget or write to us through the contact form (${m.email}) and we'll look for options.`,
    intro: (d, p) => `With ${d ? d + ' days' : 'that time'} and ${usd(p)}, I suggest:`,
    linea: (n, e, lang) => `${n}. ${texto(e.titulo, lang)} (${usd(e.total)}${e.horas ? `, ${e.horas} h` : ''}${e.mundo ? `, ${e.mundo}` : ''})${e.esEjemplo ? ' [sample]' : ''}`,
    cierre: (suma, p, dias, n) => `Total: ${usd(suma)} of ${usd(p)}.${dias && n < dias ? ` You'll have free days to rest or explore on your own.` : ''} Prices are per person and do not include lodging, meals or transport to the site. Please respect each group's size limit and the site's code of conduct.`,
    desglose: (e, lang) => `For "${texto(e.titulo, lang)}" you pay ${usd(e.total)}${e.base ? `, and ${usd(e.base)} goes to the local operator; the rest is the platform fee and community fund` : ''}. The percentages are sample values for this project.`,
  },
}

// ---------- Selección de experiencias dentro del presupuesto ----------

// Elige hasta `maxItems` experiencias de UN solo mundo (viajar entre mundos cuesta tiempo y dinero
// que el catálogo no incluye) cuya suma no pase del presupuesto. Gana el mundo con más experiencias
// y, en empate, el que aproveche mejor el presupuesto.
export function armarPlan(catalogo, { presupuesto, maxItems = 3, mundo = null, soloFacil = false }) {
  let candidatas = catalogo.filter((e) => e.activa && e.total > 0 && e.total <= presupuesto)
  if (mundo) candidatas = candidatas.filter((e) => e.mundo === mundo)
  if (soloFacil) candidatas = candidatas.filter((e) => e.dificultad === 'easy')

  const porMundo = {}
  for (const e of candidatas) (porMundo[e.mundo ?? 'otro'] ||= []).push(e)

  let mejor = null
  for (const lista of Object.values(porMundo)) {
    lista.sort((a, b) => a.total - b.total)
    // Ir de la más barata a la más cara; mantiene la suma bajo el presupuesto.
    const elegidas = []
    let suma = 0
    for (const e of lista) {
      if (elegidas.length < maxItems && suma + e.total <= presupuesto) {
        elegidas.push(e)
        suma += e.total
      }
    }
    if (!mejor || elegidas.length > mejor.items.length || (elegidas.length === mejor.items.length && suma > mejor.suma)) {
      mejor = { items: elegidas, suma }
    }
  }
  return mejor && mejor.items.length ? mejor : null
}

// ---------- Punto de entrada ----------

export function responderConReglas(pregunta, experiencias, { marca = MARCA_POR_DEFECTO, pct = PRECIO_JUSTO_POR_DEFECTO } = {}) {
  const lang = detectarIdioma(pregunta)
  const t = T[lang]
  const catalogo = experiencias.map((e) => normalizar(e, pct))

  if (!catalogo.length) return t.vacio(marca)

  // 1) Intenciones que no son una recomendación (el orden importa: lo más específico primero).
  if (INTENCION.hotel.test(pregunta)) return t.hotel(marca)
  if (INTENCION.datoOficial.test(pregunta)) return t.datoOficial()
  if (INTENCION.precioJusto.test(pregunta)) {
    const e = catalogo.find((x) => x.base) || catalogo[0]
    return t.desglose(e, lang)
  }
  if (INTENCION.saludo.test(pregunta) && !extraerPresupuesto(pregunta)) return t.saludo(marca)
  if (INTENCION.contacto.test(pregunta) && !extraerPresupuesto(pregunta)) return t.contacto(marca)
  if (!INTENCION.turismo.test(pregunta)) return t.fueraDeTema(marca)

  // 2) Recomendación por días + presupuesto.
  const dias = extraerDias(pregunta)
  const presupuesto = extraerPresupuesto(pregunta)
  if (presupuesto == null) return t.sinDatos(marca)

  const plan = armarPlan(catalogo, {
    presupuesto,
    maxItems: Math.min(dias ?? 3, 3), // 1 a 3 experiencias, nunca más que los días disponibles
    mundo: extraerMundo(pregunta),
    soloFacil: pideFacil(pregunta),
  })
  if (!plan) return t.ningunaEncaja(presupuesto, marca)

  const lineas = plan.items.map((e, i) => t.linea(i + 1, e, lang)).join('\n')
  return `${t.intro(dias, presupuesto)}\n${lineas}\n${t.cierre(plan.suma, presupuesto, dias, plan.items.length)}`
}
