// SHA-256 en hex. Usa crypto.subtle si existe; si no (app abierta por IP con http = contexto
// no seguro, el navegador apaga crypto.subtle), usa la version en JS puro. Mismo resultado.

const aHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

export async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto)
  if (globalThis.crypto?.subtle) return aHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
  return aHex(sha256Puro(bytes))
}

/** SHA-256 (FIPS 180-4) sobre bytes. Devuelve Uint8Array de 32 bytes. */
export function sha256Puro(bytes) {
  // Constantes: fraccion de raiz cuadrada (H) y cubica (K) de los primeros primos
  const H = [], K = []
  for (let n = 2, i = 0; i < 64; n++) {
    let primo = true
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { primo = false; break }
    if (!primo) continue
    if (i < 8) H[i] = ((Math.pow(n, 1 / 2) % 1) * 2 ** 32) | 0
    K[i++] = ((Math.pow(n, 1 / 3) % 1) * 2 ** 32) | 0
  }

  // Relleno: 0x80, ceros y largo en bits (big-endian) al final del ultimo bloque de 64 bytes
  const l = bytes.length
  const w = new Uint32Array(((l + 9 + 63) >> 6) * 16)
  for (let i = 0; i < l; i++) w[i >> 2] |= bytes[i] << (24 - 8 * (i & 3))
  w[l >> 2] |= 0x80 << (24 - 8 * (l & 3))
  w[w.length - 2] = Math.floor((l * 8) / 2 ** 32)
  w[w.length - 1] = l * 8

  const rotr = (x, n) => (x >>> n) | (x << (32 - n))
  const W = new Uint32Array(64)
  for (let blq = 0; blq < w.length; blq += 16) {
    for (let t = 0; t < 64; t++) {
      if (t < 16) { W[t] = w[blq + t]; continue }
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3)
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10)
      W[t] = W[t - 16] + s0 + W[t - 7] + s1
    }
    let [a, b, c, d, e, f, g, h] = H
    for (let t = 0; t < 64; t++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0
    }
    ;[a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0 })
  }

  const out = new Uint8Array(32)
  H.forEach((v, i) => { for (let j = 0; j < 4; j++) out[i * 4 + j] = (v >>> (24 - 8 * j)) & 0xff })
  return out
}
