# Cuatro Rumbos (Ñan Vivo) (nombre provisional) – Proyecto Final Avanzado 1

Plataforma web de turismo sostenible en Ecuador: catálogo de experiencias filtrable por mundo (Costa, Sierra, Amazonía y Galápagos) que muestra cuánto del precio llega al negocio local, formulario de contacto, panel de administración con login y asistente de IA.

## Tecnologías y decisiones

| Pieza | Tecnología | Por qué |
| --- | --- | --- |
| Frontend | React + Vite | Compila a archivos estáticos que GitHub Pages puede servir |
| Rutas | React Router con `HashRouter` | GitHub Pages no redirige rutas internas; con `BrowserRouter`, recargar `/admin` da 404 |
| Backend | Firebase (Authentication + Firestore) | GitHub Pages es solo estático, así que datos y login viven en Firebase |
| Seguridad | `backend/firestore.rules` | Solo el admin escribe experiencias y ajustes y lee los mensajes |
| IA | Firebase AI Logic (Gemini) con respaldo por reglas | La clave de la IA nunca viaja en el frontend |
| Animaciones | Framer Motion | Entrada suave de tarjetas y del Home |

## Estructura

```
frontend/   App React (se publica en GitHub Pages)
backend/    Reglas de Firestore y configuración de Firebase
.github/    Workflow de despliegue automático
```

## Cómo correrlo

1. `cd frontend && npm install`
2. Copia `.env.example` como `.env.local` y completa los datos de tu proyecto Firebase.
3. `npm run dev` y abre la URL que aparece.

Sin `.env.local` la app funciona igual con experiencias de ejemplo (útil para diseñar), pero el formulario y el login necesitan Firebase.

## Configurar Firebase (una sola vez)

1. En [console.firebase.google.com](https://console.firebase.google.com) crea un proyecto y una **app web**; copia su configuración al `.env.local`.
2. **Authentication** → Sign-in method → activa *Correo y contraseña* y crea tu usuario administrador.
3. **Firestore Database** → crea la base de datos y pega el contenido de `backend/firestore.rules` en la pestaña *Reglas*.
4. Crea la colección `admins` con **un documento cuyo ID sea el UID** de tu usuario (lo ves en Authentication). Puede estar vacío o tener un campo `role: "admin"`.
5. (Opcional) Crea el documento `settings/pricing` con `platformPct: 0.10` y `fundPct: 0.05` (números).
6. Authentication → Settings → **Dominios autorizados** → agrega `tu-usuario.github.io`.

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub (rama `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Secrets and variables → Actions → crea los secretos `VITE_FIREBASE_*` con los mismos valores del `.env.local`.
4. Cada `git push` a `main` publica en `https://tu-usuario.github.io/nombre-del-repo/`.

## Precio justo

El operador fija el precio que quiere recibir (`basePrice`). El viajero paga `total = basePrice / (1 - platformPct - fundPct)`, así el operador recibe siempre su `basePrice`. La función pura está en `frontend/src/services/precio.js`. Los porcentajes se leen de Firestore (`settings/pricing`, campos `platformPct` y `fundPct`, por ejemplo `0.10` y `0.05`); si no existe, se usan los valores de ejemplo de `config.js` (10 % y 5 %). Son valores de ejemplo del prototipo: en un negocio real se acuerdan con cada operador. No hay pagos reales.

## Asistente de IA

Por defecto responde con reglas locales usando el catálogo real y el tono de la marca (funciona siempre). Para usar Gemini: activa **Firebase AI Logic** en la consola, define la variable `VITE_USE_AI=true` y vuelve a publicar. Si la IA falla, el asistente vuelve solo al modo de reglas.

## Personalizar la marca

Todo el texto de la marca (nombre, eslogan, valores, contacto) está en `frontend/src/config.js`; los colores, en las variables al inicio de `frontend/src/styles/global.css`.
