// Genera los PNG del icono de la app (instalable) a partir de public/icon.svg con Chrome headless + CDP.
// Uso: node scripts/iconos.mjs   -> public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, logo-ayni.png (marca en la app)
// public/icon.svg es el logo del equipo (dom 8 nov 15:30: casa verde con sonrisa sobre fondo maiz, cuadrado completo;
// SVG con un PNG de 1254 px incrustado, ~1,2 MB): por eso la app y el favicon usan los PNG.
// "any": cuadrado maiz con esquinas redondeadas transparentes. "maskable" y Apple: cuadrado lleno (el sistema recorta la forma;
// la casa ocupa ~60 % del lado y queda dentro de la zona segura del 80 %). logo-ayni.png: cuadrado lleno que la app recorta en circulo.
import { spawn } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PUERTO = 9334
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

const svgUrl = pathToFileURL(resolve('public/icon.svg')).href
const tmp = mkdtempSync(join(tmpdir(), 'ayni-icono-'))
// escala > 1 acerca la casa (y tapa el borde de 0,25 px que deja el viewBox del SVG); radio = esquinas redondeadas (% del lado)
const pagina = (escala, radio) => {
  const archivo = join(tmp, `logo_${escala}_${radio}.html`)
  writeFileSync(archivo, `<!doctype html><html><body style="margin:0;background:transparent;width:100vw;height:100vh;overflow:hidden">
<div style="position:relative;width:100vw;height:100vh;overflow:hidden;border-radius:${radio}%">
<img src="${svgUrl}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${escala * 100}vw;height:${escala * 100}vh;max-width:none;display:block"></div></body></html>`)
  return pathToFileURL(archivo).href
}

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${tmp}/_perfil`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' })
let destino
for (let i = 0; i < 40 && !destino; i++) {
  try { destino = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((t) => t.type === 'page') } catch { await dormir(250) }
}
const ws = new WebSocket(destino.webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let n = 0
const pend = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m); pend.delete(m.id) } }
const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })) })

await cdp('Page.enable')
await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }) // esquinas transparentes

// [archivo, lado en px, escala, radio de las esquinas en %]
const SALIDAS = [
  ['icon-192.png', 192, 1.1, 22], ['icon-512.png', 512, 1.1, 22],
  ['icon-maskable-512.png', 512, 1.02, 0], ['apple-touch-icon.png', 180, 1.1, 0], ['logo-ayni.png', 256, 1.15, 0],
]
for (const [nombre, lado, escala, radio] of SALIDAS) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: lado, height: lado, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url: pagina(escala, radio) }); await dormir(1500)
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: lado, height: lado, scale: 1 } })
  writeFileSync(`public/${nombre}`, Buffer.from(data, 'base64'))
  console.log('icono:', nombre)
}
ws.close(); chrome.kill()
process.exit(0)
