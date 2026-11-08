// Capturas de la app en tamano celular con Chrome headless + CDP (sin dependencias).
// Uso (con npm run dev corriendo): node scripts/capturas.mjs capturas [mapa,minka,...]
// Usa un usuario FALSO solo en localStorage del Chrome headless: no escribe en Firestore.
// Pantallas: tutorial, registro, mapa, vecinos, publicar, puntos, ajustes, minka, minka_acc, ajustes_acc, offline, minka_abajo, pc_*
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:5173'
const PUERTO = Number(process.env.PUERTO_CDP) || 9333 // otro puerto si quedo un Chrome colgado: PUERTO_CDP=9335
const salida = process.argv[2] || 'capturas'
const solo = process.argv[3]?.split(',')
mkdirSync(salida, { recursive: true })
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${resolve(salida, '_perfil')}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })
let pagina, lista = []
for (let i = 0; i < 120 && !pagina; i++) {
  try { lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json(); pagina = lista.find((t) => t.type === 'page') } catch { /* Chrome aun no responde */ }
  if (!pagina) await dormir(250)
}
if (!pagina) { console.error('Chrome no abrio ninguna pagina. Targets:', JSON.stringify(lista)); chrome.kill(); process.exit(1) }
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let n = 0
const pend = new Map()
const errores = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m); pend.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0])
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map((a) => a.value || a.description).join(' ').slice(0, 160))
}
const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })) })
const js = (expr) => cdp('Runtime.evaluate', { expression: expr, awaitPromise: true })

await cdp('Page.enable'); await cdp('Runtime.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1.5, mobile: true })
await cdp('Emulation.setTouchEmulationEnabled', { enabled: true })
await cdp('Page.navigate', { url: BASE + '/?demo=1' }); await dormir(2500)

const USUARIO = JSON.stringify({ id: 'prueba_visual', nombre: 'Vecina Demo', telefono: '900000000', whatsappVisible: true, verificacion: 'reniec', avales: [] })
const estado = (tutorial, usuario, modo = 'barrio', extra = '') => js(`localStorage.clear(); localStorage.setItem('ayni_ubicacion_demo','1');`
  + (tutorial ? `localStorage.setItem('ayni_tutorial','1');` : '') + (usuario ? `localStorage.setItem('ayni_usuario', ${JSON.stringify(USUARIO)});` : '')
  + `localStorage.setItem('ayni_modo','${modo}');` + extra)

const PANTALLAS = [
  ['tutorial', '/', () => estado(false, false)],
  ['registro', '/', () => estado(true, false)],
  ['entrar', '/', () => estado(true, false, 'barrio', "localStorage.setItem('ayni_ultimo_celular','987654321')")],
  ['mapa', '/', () => estado(true, true)],
  ['mapa_filtros', '/', () => estado(true, true), "document.querySelector('.buscador button')?.click(); const i=document.querySelector('.buscador input'); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; set.call(i,'poller'); i.dispatchEvent(new Event('input',{bubbles:true}))"],
  ['publicar', '/publicar', () => estado(true, true)],
  ['puntos', '/puntos', () => estado(true, true)],
  ['vecinos', '/vecinos', () => estado(true, true)],
  ['ajustes', '/ajustes', () => estado(true, true)],
  ['publicacion', '/publicacion/pub_01', () => estado(true, true)],
  ['vecino', '/vecino/vec_03', () => estado(true, true)],
  ['negocio', '/negocio/neg_01', () => estado(true, true)],
  ['publicar_negocio', '/publicar?tipo=NEGOCIO', () => estado(true, true)],
  ['publicar_negocio_abajo', '/publicar?tipo=NEGOCIO', () => estado(true, true), 'document.querySelector(".contenido")?.scrollTo(0, 99999)'],
  ['minka', '/minka', () => estado(true, true, 'minka')],
  ['minka_acc', '/minka', () => estado(true, true, 'minka', "localStorage.setItem('ayni_prefs', JSON.stringify({ letraGrande: true, altoContraste: true, idioma: 'mixto' }))")],
  ['ajustes_acc', '/ajustes', () => estado(true, true, 'barrio', "localStorage.setItem('ayni_prefs', JSON.stringify({ letraGrande: true, altoContraste: true, idioma: 'mixto' }))")],
  ['quechua', '/vecinos', () => estado(true, true, 'barrio', "localStorage.setItem('ayni_prefs', JSON.stringify({ idioma: 'qu' }))")],
  ['quechua_minka', '/minka', () => estado(true, true, 'minka', "localStorage.setItem('ayni_prefs', JSON.stringify({ idioma: 'qu' }))")],
  ['daltonico', '/vecinos', () => estado(true, true, 'barrio', "localStorage.setItem('ayni_prefs', JSON.stringify({ daltonico: true }))")],
  ['daltonico_minka', '/minka', () => estado(true, true, 'minka', "localStorage.setItem('ayni_prefs', JSON.stringify({ daltonico: true }))")],
  ['offline', '/', () => estado(true, true), "window.dispatchEvent(new Event('offline'))"],
  ['minka_abajo', '/minka', () => estado(true, true, 'minka'), 'window.scrollTo(0, 99999); document.querySelector(".contenido")?.scrollTo(0, 99999)'],
  // Pantalla ancha (PC / tablet): riel de navegacion a la izquierda, contenido centrado
  ['pc_mapa', '/', () => estado(true, true), '', 1280],
  // En PC el panel Filtrar ya arranca abierto
  ['pc_mapa_filtros', '/', () => estado(true, true), '', 1280],
  ['pc_mapa_pubs', '/', () => estado(true, true), "[...document.querySelectorAll('.panel-filtros .segmentos button')].find((b) => b.textContent.includes('Publicaciones'))?.click(); setTimeout(() => document.querySelectorAll('.item-pub-panel')[4]?.click(), 300)", 1280],
  ['pc_vecinos', '/vecinos', () => estado(true, true), '', 1280],
  ['pc_publicacion', '/publicacion/pub_01', () => estado(true, true), '', 1280],
  ['pc_vecino', '/vecino/vec_03', () => estado(true, true), '', 1280],
  ['pc_minka', '/minka', () => estado(true, true, 'minka'), '', 1280],
  ['pc_puntos', '/puntos', () => estado(true, true), '', 1280],
  ['pc_registro', '/', () => estado(true, false), '', 1280],
  ['pc_ajustes', '/ajustes', () => estado(true, true), '', 1280],
  ['pc_publicar', '/publicar', () => estado(true, true), '', 1280],
]
let anchoActual = 390
for (const [nombre, ruta, prep, despues, ancho = 390] of PANTALLAS) {
  if (solo && !solo.includes(nombre)) continue
  if (ancho !== anchoActual) {
    anchoActual = ancho
    await cdp('Emulation.setDeviceMetricsOverride', ancho > 600
      ? { width: ancho, height: 800, deviceScaleFactor: 1, mobile: false }
      : { width: 390, height: 844, deviceScaleFactor: 1.5, mobile: true })
  }
  await prep()
  await cdp('Page.navigate', { url: BASE + ruta }); await dormir(4500)
  if (despues) { await js(despues); await dormir(800) }
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${salida}/${nombre}.png`, Buffer.from(data, 'base64'))
  console.log('captura:', nombre)
}
if (errores.length) console.log('ERRORES EN CONSOLA:\n  ' + [...new Set(errores)].join('\n  '))
ws.close(); chrome.kill()
process.exit(0)
