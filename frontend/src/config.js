// Todo lo que identifica a tu marca vive aquí: cámbialo y se actualiza en todo el sitio.
// MARCA PROVISIONAL: nombre y eslogan están por decidir (ver fase 1 del proyecto).
export const BRAND = {
  nombre: 'Cuatro Rumbos (Ñan Vivo)',
  eslogan: 'Cuatro mundos. Caminos poco conocidos. Precio justo.',
  descripcion:
    'Conectamos a viajeros con negocios y comunidades locales de Ecuador. Cada experiencia te muestra cuánto de tu pago llega a quien la ofrece.',
  tono: 'cercano, amable y entusiasta, sin exagerar',
  email: 'hola@example.com',
  telefono: '+593 00 000 0000',
  ciudad: 'Ecuador',
  // Tres razones por las que elegirnos (aparecen en el Home)
  valores: [
    { titulo: 'Precio justo visible', texto: 'Ves cuánto del precio llega al negocio local, antes de reservar.' },
    { titulo: 'Lugares cuidados', texto: 'Cada experiencia indica su grupo máximo para no sobrecargar el lugar.' },
    { titulo: 'Cuatro mundos', texto: 'Costa, Sierra, Amazonía y Galápagos en un solo catálogo.' },
  ],
}

// Los cuatro mundos del catálogo. La clave es lo que se guarda en Firestore (campo "world").
export const MUNDOS = {
  costa: { nombre: 'Costa' },
  sierra: { nombre: 'Sierra' },
  amazonia: { nombre: 'Amazonía' },
  galapagos: { nombre: 'Galápagos' },
}

export const DIFICULTADES = { easy: 'Fácil', moderate: 'Moderada', demanding: 'Exigente' }

// Porcentajes de ejemplo del precio justo. La fuente real es Firestore (settings/pricing);
// estos solo se usan si Firebase no está configurado o el documento aún no existe.
export const PRICING_DEFECTO = { platformPct: 0.10, fundPct: 0.05 }

// Experiencias de ejemplo: se muestran solo mientras Firebase no esté configurado
// o la colección "experiences" esté vacía. Son INVENTADAS (isExample): no son operadores ni precios reales.
// Reemplázalas por experiencias reales desde /admin cuando tengas datos de un operador.
export const EXPERIENCIAS_DEMO = [
  { id: 'demo1', title: 'Caminata de ejemplo por bosque nublado', description: 'Sendero guiado por una asociación local, con grupos pequeños y normas de no dejar residuos.', world: 'sierra', province: 'Imbabura', adventureType: 'trekking', difficulty: 'moderate', durationHours: 6, basePrice: 45, maxGroupSize: 8, isExample: true, active: true },
  { id: 'demo2', title: 'Clase de surf de ejemplo con familia local', description: 'Iniciación al surf en una playa tranquila, con instructor de la zona.', world: 'costa', province: 'Manabí', adventureType: 'surf', difficulty: 'easy', durationHours: 3, basePrice: 30, maxGroupSize: 6, isExample: true, active: true },
  { id: 'demo3', title: 'Convivencia comunitaria de ejemplo en la selva', description: 'Recorrido por la selva y comida preparada por la comunidad que decide qué cultura comparte.', world: 'amazonia', province: 'Napo', adventureType: 'comunitaria', difficulty: 'easy', durationHours: 8, basePrice: 60, maxGroupSize: 10, isExample: true, active: true },
  { id: 'demo4', title: 'Snorkel guiado de ejemplo', description: 'Salida de snorkel con guía local. Verificar permisos y tarifas oficiales antes de publicar una experiencia real.', world: 'galapagos', province: 'Galápagos', adventureType: 'snorkel', difficulty: 'moderate', durationHours: 4, basePrice: 70, maxGroupSize: 8, isExample: true, active: true },
]
