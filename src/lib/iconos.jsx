// Iconos de Ayni: Lucide (licencia ISC) via lucide-react. Nada de emojis: cada rubro de negocio,
// tipo de publicacion y recurso de Minka tiene su icono. Tambien la marca (Logo) y el SVG en texto
// que necesitan los pines de Leaflet (divIcon).
import { renderToStaticMarkup } from 'react-dom/server'
import {
  ShoppingBasket, Croissant, Hammer, Wrench, Spool, Soup, Gift, WashingMachine, Drumstick, PawPrint, Car, Carrot,
  Scissors, Pill, Footprints, Store, HandHelping, Megaphone, Star, CircleCheck, Siren, HeartHandshake, Droplets,
  House, LifeBuoy, CircleHelp, Stethoscope, BriefcaseMedical, Zap, Warehouse,
} from 'lucide-react'

// Rubro o nombre del negocio -> icono. Si no calza, tienda.
const RUBROS = [
  [/abarrote|bodega/i, ShoppingBasket], [/pan/i, Croissant], [/ferret/i, Hammer], [/gasfit|electric|t[ée]cnico/i, Wrench],
  [/costur|enmiend/i, Spool], [/men[uú]|restaur/i, Soup], [/bazar|regalo|[uú]til/i, Gift], [/lavander/i, WashingMachine],
  [/poller/i, Drumstick], [/veterin|mascota/i, PawPrint], [/mec[aá]n|llanta/i, Car], [/verdul|fruta|verdura/i, Carrot],
  [/peluq|barber|est[ée]tica/i, Scissors], [/farmac|salud/i, Pill], [/zapat|calzado/i, Footprints],
]
export const iconoRubro = (rubro = '') => RUBROS.find(([re]) => re.test(rubro))?.[1] || Store

// Tipos de publicacion (Modo Barrio)
export const ICONO_TIPO = { OFREZCO: HandHelping, NECESITO: Megaphone, RECOMIENDO: Star }

// Minka: los 3 botones, lo que se pide y lo que se ofrece
export const ICONO_MINKA = {
  bien: CircleCheck, ayuda: Siren, puedo: HeartHandshake,
  agua: Droplets, medicina: Pill, albergue: House, rescate: LifeBuoy, comida: Soup, otro: CircleHelp,
  enfermera: Stethoscope, botiquin: BriefcaseMedical, generador: Zap, vehiculo: Car, espacio: Warehouse,
}

/** SVG como texto, para los pines del mapa (L.divIcon recibe HTML). */
export const svg = (Icono, props = {}) =>
  renderToStaticMarkup(<Icono size={18} strokeWidth={2.25} aria-hidden="true" {...props} />)

/** Marca Ayni: dos flechas que se persiguen en circulo (ida y vuelta = reciprocidad). */
export function Logo({ size = 36, fondo = 'var(--maiz)', trazo = 'var(--verde-prof)', className }) {
  const t = { fill: 'none', stroke: trazo, strokeWidth: 4.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill={fondo} />
      <path d="M13 28c0-8 5-13 12-13h9.5" {...t} />
      <path d="M29.5 10l5 5-5 5" {...t} />
      <path d="M35 20c0 8-5 13-12 13h-9.5" {...t} />
      <path d="M18.5 28l-5 5 5 5" {...t} />
    </svg>
  )
}
