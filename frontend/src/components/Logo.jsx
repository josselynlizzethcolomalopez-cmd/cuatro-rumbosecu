// Logo de la marca: una brújula de cuatro puntas (los cuatro rumbos / cuatro mundos).
// Es SVG en línea, así no depende de ninguna imagen externa.
export default function Logo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Logo Cuatro Rumbos">
      <rect width="64" height="64" rx="16" fill="#1f5a35" />
      <path d="M32 8l5.5 18.5L56 32l-18.5 5.5L32 56l-5.5-18.5L8 32l18.5-5.5z" fill="#c5e04b" />
      <circle cx="32" cy="32" r="5" fill="#1f5a35" />
    </svg>
  )
}
