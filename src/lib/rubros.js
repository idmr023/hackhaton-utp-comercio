// Emoji de un negocio segun su rubro o nombre (mapa, recompensas). Si no calza, tienda.
const RUBROS = [
  [/abarrote|bodega/i, '🛒'], [/pan/i, '🥖'], [/ferret/i, '🔨'], [/gasfit|electric|t[ée]cnico/i, '🔧'],
  [/costur|enmiend/i, '🧵'], [/men[uú]|restaur/i, '🍲'], [/bazar|regalo|[uú]til/i, '🎁'], [/lavander/i, '🧺'],
  [/poller/i, '🍗'], [/veterin|mascota/i, '🐾'], [/mec[aá]n|llanta/i, '🚗'], [/verdul|fruta|verdura/i, '🥬'],
  [/peluq|barber|est[ée]tica/i, '💇'], [/farmac|salud/i, '💊'], [/zapat|calzado/i, '👞'],
]
export const emojiRubro = (rubro = '') => RUBROS.find(([re]) => re.test(rubro))?.[1] || '🏪'
