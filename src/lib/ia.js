// IA: clasifica publicaciones con Gemini y, si falla o no hay internet/clave,
// usa el clasificador de respaldo por palabras clave. La demo nunca depende de Gemini.
import { GoogleGenerativeAI } from '@google/generative-ai'

export const CATEGORIAS = ['Oficios', 'Alimentos', 'Salud', 'Hogar', 'Transporte', 'Educacion', 'Mascotas', 'Otro']
export const CATEGORIAS_MINKA = ['agua', 'medicina', 'albergue', 'rescate', 'comida', 'otro']

const PALABRAS = {
  Oficios: ['gasfitero', 'gasfiter', 'electricista', 'carpintero', 'pintor', 'albanil', 'albañil', 'costurera', 'tecnico', 'técnico', 'reparo', 'arreglo', 'soldador', 'cerrajero'],
  Alimentos: ['pan', 'menu', 'menú', 'comida', 'almuerzo', 'bodega', 'fruta', 'verdura', 'pollo', 'desayuno', 'torta'],
  Salud: ['medicina', 'farmacia', 'enfermera', 'doctor', 'pastilla', 'botiquin', 'botiquín', 'inyeccion'],
  Hogar: ['mueble', 'limpieza', 'lavado', 'gas', 'balon', 'balón', 'agua', 'herramienta', 'taladro', 'escalera'],
  Transporte: ['taxi', 'moto', 'mototaxi', 'carga', 'mudanza', 'bicicleta'],
  Educacion: ['clases', 'tarea', 'ingles', 'inglés', 'matematica', 'profesor', 'tutor'],
  Mascotas: ['perro', 'gato', 'veterinari', 'mascota'],
}

/** Clasificador de respaldo: palabras clave. Siempre funciona, incluso offline. */
export function clasificarLocal(texto) {
  const t = (texto || '').toLowerCase()
  for (const [cat, lista] of Object.entries(PALABRAS)) {
    if (lista.some((p) => t.includes(p))) return cat
  }
  return 'Otro'
}

const key = import.meta.env.VITE_GEMINI_API_KEY
const genAI = key ? new GoogleGenerativeAI(key) : null
// 2.5-flash-lite ya no esta disponible para claves nuevas (nov 2026)
const MODELO = 'gemini-3.5-flash-lite'

/** Clasifica con Gemini (timeout 6 s). Si no hay clave/internet o falla, usa el local. */
export async function clasificar(texto) {
  if (!genAI || !navigator.onLine) return { categoria: clasificarLocal(texto), fuente: 'local' }
  try {
    const model = genAI.getGenerativeModel({ model: MODELO })
    const prompt = `Clasifica este texto de un vecino de Lima en UNA de estas categorias: ${CATEGORIAS.join(', ')}. Responde solo la categoria.\nTexto: "${texto}"`
    const res = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
    ])
    const salida = res.response.text().trim()
    const cat = CATEGORIAS.find((c) => salida.toLowerCase().includes(c.toLowerCase()))
    return { categoria: cat || clasificarLocal(texto), fuente: cat ? 'gemini' : 'local' }
  } catch (e) {
    console.warn('Gemini fallo, uso respaldo', e.message)
    return { categoria: clasificarLocal(texto), fuente: 'local' }
  }
}

/** Resume comentarios de vecinos sobre un negocio (para "recomendado por N vecinos"). */
export async function resumirComentarios(comentarios) {
  if (!comentarios?.length) return ''
  if (!genAI || !navigator.onLine) return comentarios.slice(0, 2).join(' · ')
  try {
    const model = genAI.getGenerativeModel({ model: MODELO })
    const res = await model.generateContent(`Resume en una frase de maximo 15 palabras, en espanol peruano y tono vecinal, estas opiniones:\n${comentarios.join('\n')}`)
    return res.response.text().trim()
  } catch {
    return comentarios.slice(0, 2).join(' · ')
  }
}

// ---- Parte de zona (Modo Minka) ----
// datos = { pedidos: [{tipo:'agua', urgente:true}], ofrecen: ['botiquín', 'agua'], coordinadas: 3, avisos: ['...'] }
const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`
function contarTipos(lista) {
  const c = {}
  lista.forEach((t) => { c[t] = (c[t] || 0) + 1 })
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${n} de ${t}`).join(', ')
}

/** Resumen armado sin IA, con los numeros reales: siempre disponible (respaldo). */
export function parteLocal({ pedidos = [], ofrecen = [], coordinadas = 0 }) {
  const urgentes = pedidos.filter((p) => p.urgente).length
  const partes = [
    pedidos.length
      ? `${pl(pedidos.length, 'pedido de ayuda abierto', 'pedidos de ayuda abiertos')} (${contarTipos(pedidos.map((p) => p.tipo))})${urgentes ? `, ${pl(urgentes, 'urgente', 'urgentes')}` : ''}`
      : 'Sin pedidos de ayuda abiertos',
    ofrecen.length ? `${pl(ofrecen.length, 'vecino ofrece', 'vecinos ofrecen')} ayuda (${[...new Set(ofrecen)].join(', ')})` : null,
    coordinadas ? `${pl(coordinadas, 'ayuda ya coordinada', 'ayudas ya coordinadas')}` : null,
  ]
  return partes.filter(Boolean).join('. ') + '.'
}

/** Parte de zona con Gemini (6 s); si no hay clave, internet o falla: parteLocal. */
export async function resumirZona(datos) {
  const local = parteLocal(datos)
  if (!genAI || !navigator.onLine) return { texto: local, fuente: 'local' }
  try {
    const model = genAI.getGenerativeModel({ model: MODELO })
    const prompt = `Eres el boletín vecinal de emergencia de un barrio de Lima. Con estos datos escribe UN parte de zona `
      + `de máximo 35 palabras, claro y calmado, en español peruano. No inventes datos, nombres ni lugares que no estén aquí. `
      + `Sin saludos ni emojis.\nDatos: ${JSON.stringify(datos)}\nResumen base: ${local}`
    const res = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000)),
    ])
    const texto = res.response.text().trim().replace(/\s+/g, ' ')
    return texto ? { texto, fuente: 'gemini' } : { texto: local, fuente: 'local' }
  } catch (e) {
    console.warn('Gemini (parte de zona) fallo, uso respaldo', e.message)
    return { texto: local, fuente: 'local' }
  }
}
