// Genera los PNG del icono de la app (instalable) a partir de public/icon.svg con Chrome headless + CDP.
// Uso: node scripts/iconos.mjs   -> public/icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, logo-ayni.png (marca en la app)
// public/icon.svg es el logo del equipo (SVG con la imagen incrustada, ~350 KB): por eso la app y el favicon usan los PNG.
// "any": esquinas redondeadas transparentes. "maskable" y Apple: cuadrado lleno (el sistema recorta la forma).
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
writeFileSync(join(tmp, 'lleno.html'), `<!doctype html><html><body style="margin:0;background:#F7F5EF;position:relative;width:100vw;height:100vh;overflow:hidden">
<img src="${svgUrl}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:130vw;height:130vh;display:block;object-fit:contain"></body></html>`)
const llenoUrl = pathToFileURL(join(tmp, 'lleno.html')).href
// El SVG del equipo trae width/height fijos (768): se envuelve en un HTML para que escale al tamano del icono
writeFileSync(join(tmp, 'trans.html'), `<!doctype html><html><body style="margin:0;background:transparent;position:relative;width:100vw;height:100vh;overflow:hidden">
<img src="${svgUrl}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:140vw;height:140vh;display:block;object-fit:contain"></body></html>`)
const transUrl = pathToFileURL(join(tmp, 'trans.html')).href

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${tmp}/_perfil`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' })
let pagina
for (let i = 0; i < 40 && !pagina; i++) {
  try { pagina = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((t) => t.type === 'page') } catch { await dormir(250) }
}
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let n = 0
const pend = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m); pend.delete(m.id) } }
const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })) })

await cdp('Page.enable')
await cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }) // esquinas transparentes

const SALIDAS = [
  ['icon-192.png', transUrl, 192], ['icon-512.png', transUrl, 512],
  ['icon-maskable-512.png', llenoUrl, 512], ['apple-touch-icon.png', llenoUrl, 180], ['logo-ayni.png', transUrl, 256],
]
for (const [nombre, url, lado] of SALIDAS) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: lado, height: lado, deviceScaleFactor: 1, mobile: false })
  await cdp('Page.navigate', { url }); await dormir(1200)
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: lado, height: lado, scale: 1 } })
  writeFileSync(`public/${nombre}`, Buffer.from(data, 'base64'))
  console.log('icono:', nombre)
}
ws.close(); chrome.kill()
process.exit(0)
