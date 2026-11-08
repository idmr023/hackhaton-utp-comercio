// Asistente de ayuda: responde como se usa Ayni. Gemini con la guia de la app como contexto;
// si no hay clave, internet o falla, responde el respaldo local por palabras clave (la demo nunca depende de Gemini).
import { GoogleGenerativeAI } from '@google/generative-ai'

const key = import.meta.env.VITE_GEMINI_API_KEY
const genAI = key ? new GoogleGenerativeAI(key) : null
const MODELO = 'gemini-3.5-flash-lite'

/** Que hace cada pantalla y como se llega (es lo unico que el asistente puede contar). Rutas entre corchetes. */
export const GUIA = `
AYNI, "tu barrio se ayuda": app para vecinos de Lima. Dos modos: Barrio (normal) y Minka (emergencia).
BARRA SUPERIOR: logo Ayni; boton rojo EMERGENCIA (entra al Modo Minka; la burbuja roja dice cuantos vecinos piden ayuda cerca); avatar con tus iniciales o foto (abre Ajustes [/ajustes]).
PESTAÑAS abajo (en PC arriba): Mapa [/], Vecinos [/vecinos], Puntos [/puntos].
MAPA [/]: negocios (pines verdes con icono del rubro o logo) y publicaciones (circulos con contador si hay varias en la misma zona) a 500 m, 1 km, 2 km o 5 km de ti (botones arriba). Buscador por nombre, rubro o texto. Boton de filtros (icono de controles, a la derecha del buscador): Todo / Negocios / Publicaciones, tipo de publicacion (Ofrezco, Necesito, Recomiendo), categorias de negocio (Comida, Salud, Hogar y oficios, Belleza, Tiendas), "Con opiniones". Tocar un pin abre su tarjeta con WhatsApp y "Opinar". Boton amarillo PUBLICAR abajo a la derecha.
VECINOS [/vecinos]: dos pestañas. "Vecinos": publicaciones recientes con foto, filtros Todo/Ofrezco/Necesito/Recomiendo; cada una tiene botones Mapa, Comentar y WhatsApp; tocarla abre el detalle con comentarios; tocar el nombre del autor abre su perfil (estrellas y recomendaciones). "Negocios": por categoria, con estrellas y botones Mapa, Opinar, WhatsApp; tocar uno abre su pagina.
PUBLICAR [/publicar]: 3 toques. Paso 1 elegir Ofrezco (algo que das o prestas), Necesito (algo que buscas) o Recomiendo (un negocio o vecino que te gusto); tambien "Mi negocio" para registrar tu negocio. Paso 2 escribir el texto (hay microfono para dictar y boton para foto). Paso 3 publicar. La categoria la pone la IA. Funciona sin internet: se guarda y se sube solo. Tu ubicacion se publica aproximada (celda de 300 m), nunca exacta.
MI NEGOCIO [/publicar?tipo=NEGOCIO]: Publicar → Mi negocio: nombre, rubro, horario, WhatsApp, descripcion, logo, foto del local y ubicacion exacta (arrastrar el pin). Puedes tener varios negocios. Desde Ajustes se editan, se quitan del mapa o se eliminan.
DETALLE DE PUBLICACION [/publicacion/ID]: texto, foto, autor con estrellas, WhatsApp, "Ver en el mapa", comentarios. Si es tuya, "Quitar publicacion".
PERFIL DE VECINO [/vecino/ID]: estrellas, recomendaciones de otros vecinos, sus publicaciones. Puedes recomendarlo con 1 a 5 estrellas: el recomendado gana +2 puntos.
PAGINA DE NEGOCIO [/negocio/ID]: estrellas, opiniones, comentarios, WhatsApp, "Ver en el mapa". Opinar con estrellas da +2 puntos a quien opina (una vez por negocio).
PUNTOS [/puntos]: tu saldo de puntos Ayni y recompensas de negocios del barrio para canjear (codigo de 6 digitos que muestras en el negocio; un canje por negocio por semana). Se ganan puntos: ayuda confirmada en Minka +20, recomendar a un vecino le da +2 a el, opinar un negocio +2 para ti.
MODO MINKA [/minka] (emergencia: sismo, incendio, inundacion): se entra con el boton EMERGENCIA. Tres botones grandes: ESTOY BIEN (avisas que estas bien), NECESITO AYUDA (eliges agua, comida, medicina, albergue, rescate u otro y la urgencia: Puede esperar / Hoy / Ahora) y PUEDO AYUDAR (ofreces agua, comida, botiquin, enfermera, espacio, vehiculo u otro). Se hace match automatico con el vecino mas cercano y aparece "Coordinar por WhatsApp". Cuando se encuentran, quien ayudo muestra un codigo de 4 digitos, quien recibio lo escribe y el que ayudo gana +20 puntos. Mapa de necesidades (rojo) y recursos (verde) a 3 km, parte de zona escrito por IA y avisos de la municipalidad. Funciona sin señal. Puedes cancelar tu pedido o retirar tu ayuda en "Tus pedidos y ayudas". Para salir: boton SALIR arriba.
AJUSTES [/ajustes] (tocar el avatar): foto de perfil, celular para entrar (boton Cambiar, pide tu PIN), Mi WhatsApp (cambiarlo y si se muestra a los vecinos), tus puntos, Mi negocio, Accesibilidad e idioma (Letra grande, Alto contraste, Modo para daltonicos, idioma Español / Español con frases en quechua / Quechua), Ubicacion demo en Surquillo, Cerrar sesion.
CUENTA: se crea con nombre, celular, DNI (validado en RENIEC; solo se guarda una huella, nunca el numero) y un PIN de 4 a 6 digitos. Se entra con celular + PIN. Si olvidaste el PIN: "Crear cuenta" con tu mismo celular y DNI y eliges un PIN nuevo.
SIN INTERNET: la app abre igual (instalable en el celular), se ve lo ya cargado y lo que publicas se guarda y se sube solo cuando vuelve la señal.
`.trim()

// Respaldo local: preguntas frecuentes por palabras clave (sin tildes, minusculas)
const normal = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const FAQ = [
  { claves: ['emergencia', 'minka', 'sismo', 'temblor', 'incendio', 'ayuda urgente', 'necesito ayuda', 'puedo ayudar', 'estoy bien'], ruta: '/minka', texto: 'Toca el botón rojo Emergencia arriba. Verás tres botones: Estoy bien, Necesito ayuda (eliges qué y la urgencia) y Puedo ayudar. La app te conecta con el vecino más cercano y pueden coordinar por WhatsApp. Al encontrarse, el código de 4 dígitos confirma la ayuda y quien ayudó gana +20 puntos.' },
  { claves: ['publicar', 'publico', 'ofrezco', 'ofrecer', 'necesito', 'pedir algo', 'prestado', 'anuncio', 'aviso'], ruta: '/publicar', texto: 'Toca el botón amarillo Publicar (abajo a la derecha del mapa). Elige Ofrezco, Necesito o Recomiendo, escribe o dicta tu texto, pon una foto si quieres y toca Publicar. Son 3 toques y funciona sin internet.' },
  { claves: ['negocio', 'tienda', 'bodega', 'mi local', 'registrar mi'], ruta: '/publicar?tipo=NEGOCIO', texto: 'Ve a Publicar → Mi negocio: pon nombre, rubro, horario, WhatsApp, descripción, logo o foto y arrastra el pin a la ubicación exacta. Aparece en el mapa y en Vecinos → Negocios. Desde Ajustes lo editas, lo quitas del mapa o lo eliminas.' },
  { claves: ['punto', 'canje', 'canjear', 'recompensa', 'premio', 'saldo', 'ganar'], ruta: '/puntos', texto: 'En la pestaña Puntos ves tu saldo y las recompensas de los negocios del barrio. Ganas +20 por una ayuda confirmada en Minka y +2 por opinar sobre un negocio; si recomiendas a un vecino, él gana +2. Para canjear eliges la recompensa y muestras el código de 6 dígitos en el negocio.' },
  { claves: ['estrella', 'opinar', 'opinion', 'recomendar', 'calificar', 'resena', 'reseña'], ruta: '/vecinos', texto: 'En Vecinos → Negocios toca Opinar en un negocio (o entra a su página) y elige de 1 a 5 estrellas: ganas +2 puntos. Para recomendar a un vecino, toca su nombre y usa las estrellas de su perfil: él gana +2.' },
  { claves: ['whatsapp', 'contactar', 'escribir', 'hablar con', 'mensaje'], ruta: '/vecinos', texto: 'Cada publicación y negocio tiene un botón WhatsApp que abre el chat con un mensaje listo. Tu propio WhatsApp lo cambias en Ajustes → Mi WhatsApp, y ahí decides si se muestra a los vecinos.' },
  { claves: ['celular', 'numero', 'número', 'telefono', 'teléfono', 'pin', 'contrasena', 'contraseña', 'entrar', 'olvide', 'olvidé'], ruta: '/ajustes', texto: 'Se entra con celular + PIN. Para cambiar el celular: Ajustes → Celular para entrar → Cambiar (pide tu PIN). Si olvidaste el PIN: cierra sesión, toca "Crear cuenta" con tu mismo celular y DNI y elige un PIN nuevo.' },
  { claves: ['filtro', 'filtrar', 'buscar', 'busco', 'encontrar', 'categoria', 'categoría', 'cerca'], ruta: '/', texto: 'En el Mapa usa el buscador o el botón de filtros a su derecha: Todo / Negocios / Publicaciones, tipo de publicación (Ofrezco, Necesito, Recomiendo) y categorías de negocio. Arriba eliges el radio: 500 m, 1 km, 2 km o 5 km.' },
  { claves: ['mapa', 'pin', 'ubicacion', 'ubicación', 'donde esta', 'dónde está'], ruta: '/', texto: 'El Mapa muestra los negocios (pines verdes) y las publicaciones (círculos; el número indica cuántas hay en esa zona) a la distancia que elijas. Toca un pin para ver la tarjeta con WhatsApp. Tu ubicación siempre se publica aproximada, nunca exacta.' },
  { claves: ['letra', 'grande', 'contraste', 'daltonic', 'daltónic', 'quechua', 'idioma', 'runasimi', 'accesib'], ruta: '/ajustes', texto: 'Toca tu avatar (arriba a la derecha) → Ajustes → Accesibilidad e idioma: Letra grande, Alto contraste, Modo para daltónicos y el idioma (Español, Español con frases en quechua o Quechua).' },
  { claves: ['foto de perfil', 'avatar', 'mi foto', 'perfil'], ruta: '/ajustes', texto: 'Toca tu avatar arriba a la derecha: en Ajustes puedes poner o cambiar tu foto de perfil, tu WhatsApp, tu celular para entrar y tus negocios.' },
  { claves: ['sin internet', 'sin senal', 'sin señal', 'offline', 'conexion', 'conexión', 'instalar'], ruta: null, texto: 'Ayni funciona sin internet: abre igual, ves lo ya cargado y lo que publicas se guarda en tu celular y se sube solo cuando vuelve la señal. Puedes instalarla desde el menú del navegador → "Agregar a pantalla de inicio".' },
  { claves: ['comentar', 'comentario'], ruta: '/vecinos', texto: 'En Vecinos toca una publicación (o su botón Comentar) para abrir el detalle y escribir un comentario abajo. En la página de un negocio también hay comentarios.' },
  { claves: ['quitar', 'borrar', 'eliminar', 'cancelar'], ruta: '/vecinos', texto: 'Tus publicaciones: ábrelas desde Vecinos y toca "Quitar publicación". Tu negocio: Ajustes → Quitar del mapa o Eliminar. En Minka: "Tus pedidos y ayudas" → Cancelar o Retirar.' },
  { claves: ['salir', 'cerrar sesion', 'cerrar sesión'], ruta: '/ajustes', texto: 'Toca tu avatar → Ajustes → Cerrar sesión (al final). Para salir del Modo Minka usa el botón Salir de la barra.' },
]
const GENERAL = { ruta: null, texto: 'Ayni tiene 3 pestañas: Mapa (negocios y publicaciones cerca de ti), Vecinos (lista de publicaciones y negocios) y Puntos (tu saldo y recompensas). El botón amarillo Publicar sirve para Ofrezco, Necesito o Recomiendo. El botón rojo Emergencia entra al Modo Minka. Tu avatar abre Ajustes. Pregúntame por ejemplo: "¿cómo publico?", "¿cómo gano puntos?" o "¿cómo pido ayuda?".' }

/** Respuesta local por palabras clave: siempre funciona, incluso sin internet. */
export function responderLocal(pregunta) {
  const q = normal(pregunta)
  const hit = FAQ.find((f) => f.claves.some((c) => q.includes(normal(c))))
  return { ...(hit || GENERAL), fuente: 'local' }
}

/** Pregunta a Gemini con la guia; historial = [{ rol: 'usuario'|'ayni', texto }]. Timeout 8 s; si falla, respaldo local. */
export async function preguntarGuia(historial, pregunta, idioma = 'es') {
  const local = responderLocal(pregunta)
  if (!genAI || !navigator.onLine) return local
  try {
    const model = genAI.getGenerativeModel({ model: MODELO })
    const lengua = idioma === 'qu' ? 'Responde primero en quechua sureño sencillo y luego la misma respuesta en español.' : 'Responde en español peruano, sencillo y amable (tutea).'
    const prompt = `Eres el asistente de ayuda de la app Ayni. Explicas SOLO cómo usar la app, con los pasos exactos (qué botón tocar y dónde está), basándote únicamente en esta guía. No inventes funciones que no estén en la guía; si algo no está, dilo y sugiere lo más parecido. ${lengua} Máximo 70 palabras, sin emojis ni listas largas. Al final, en una línea aparte, escribe "RUTA: " seguida de la ruta de la guía más útil para esa pregunta (por ejemplo RUTA: /publicar) o "RUTA: -" si ninguna aplica.\n\nGUÍA:\n${GUIA}\n\nCONVERSACIÓN:\n${historial.slice(-6).map((m) => `${m.rol === 'usuario' ? 'Vecino' : 'Ayni'}: ${m.texto}`).join('\n')}\nVecino: ${pregunta}\nAyni:`
    const res = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
    ])
    const salida = res.response.text().trim()
    const m = salida.match(/RUTA:\s*(\S+)\s*$/i)
    const ruta = m && m[1].startsWith('/') ? m[1].replace(/[.,)]+$/, '') : null
    const texto = salida.replace(/\n?RUTA:.*$/i, '').trim()
    return texto ? { texto, ruta, fuente: 'gemini' } : local
  } catch (e) {
    console.warn('Gemini (guia) fallo, uso respaldo', e.message)
    return local
  }
}

/** Nombre corto de la pantalla a la que lleva una ruta (para el boton "Ir a ..."). */
export function nombreRuta(ruta) {
  if (!ruta) return ''
  if (ruta.startsWith('/publicar?tipo=NEGOCIO')) return 'Mi negocio'
  const base = ruta.split('?')[0].split('/')[1] || ''
  return { '': 'Mapa', vecinos: 'Vecinos', puntos: 'Puntos', publicar: 'Publicar', minka: 'Modo Minka', ajustes: 'Ajustes' }[base] || ''
}
