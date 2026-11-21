// Logo de la marca: una brújula de cuatro puntas con una hoja (los cuatro rumbos / cuatro mundos).
// La imagen está en public/logo.png; BASE_URL es la ruta base de GitHub Pages.
export default function Logo({ className = '' }) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt="Logo Cuatro Rumbos"
      width="40"
      height="40"
    />
  )
}
