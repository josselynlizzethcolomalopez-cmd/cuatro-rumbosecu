import { desglosarPrecio, usd } from '../services/precio'

// Desglose del precio justo (barra + texto). Lo usan la tarjeta del catálogo y la página de detalle,
// así el cálculo y el diseño viven en un solo lugar.
export default function PrecioJusto({ basePrice, pricing }) {
  const d = desglosarPrecio(basePrice, pricing)
  return (
    <div className="fair">
      {/* El ancho de cada tramo es proporcional a su porcentaje */}
      <div className="fair__bar" aria-hidden="true">
        <span className="fair__op" style={{ width: `${d.pctOperador}%` }} />
        <span className="fair__pl" style={{ width: `${d.pctPlataforma}%` }} />
        <span className="fair__fo" style={{ width: `${d.pctFondo}%` }} />
      </div>
      <p className="fair__main"><strong>{usd(d.operador)}</strong> ({d.pctOperador} %) llegan al negocio local</p>
      <p className="muted fair__rest">
        Plataforma {usd(d.plataforma)} ({d.pctPlataforma} %) · Fondo comunitario {usd(d.fondo)} ({d.pctFondo} %)
      </p>
    </div>
  )
}
