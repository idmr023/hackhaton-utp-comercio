// Capturas de la app en tamano celular con Chrome headless + CDP (sin dependencias).
// Uso (con npm run dev corriendo): node scripts/capturas.mjs capturas [mapa,minka,...]
// Usa un usuario FALSO solo en localStorage del Chrome headless: no escribe en Firestore.
// Pantallas: tutorial, registro, mapa, publicar, puntos, perfil, minka, minka_acc, perfil_acc, offline, minka_abajo
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:5173'
const PUERTO = 9333
const salida = process.argv[2] || 'capturas'
const solo = process.argv[3]?.split(',')
mkdirSync(salida, { recursive: true })
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${salida}/_perfil`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })
let pagina
for (let i = 0; i < 40 && !pagina; i++) {
  try { pagina = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((t) => t.type === 'page') } catch { await dormir(250) }
}
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
  ['mapa', '/', () => estado(true, true)],
  ['publicar', '/publicar', () => estado(true, true)],
  ['puntos', '/puntos', () => estado(true, true)],
  ['perfil', '/perfil', () => estado(true, true)],
  ['minka', '/minka', () => estado(true, true, 'minka')],
  ['minka_acc', '/minka', () => estado(true, true, 'minka', "localStorage.setItem('ayni_prefs', JSON.stringify({ letraGrande: true, altoContraste: true, quechua: true }))")],
  ['perfil_acc', '/perfil', () => estado(true, true, 'barrio', "localStorage.setItem('ayni_prefs', JSON.stringify({ letraGrande: true, altoContraste: true, quechua: true }))")],
  ['offline', '/', () => estado(true, true), "window.dispatchEvent(new Event('offline'))"],
  ['minka_abajo', '/minka', () => estado(true, true, 'minka'), 'window.scrollTo(0, 99999); document.querySelector(".contenido")?.scrollTo(0, 99999)'],
]
for (const [nombre, ruta, prep, despues] of PANTALLAS) {
  if (solo && !solo.includes(nombre)) continue
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
