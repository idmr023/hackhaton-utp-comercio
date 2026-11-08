// Validacion de DNI con Didit (RENIEC). Logica compartida por el servidor local (server/index.js)
// y la funcion serverless de Vercel (api/verificar-dni.js). La API key nunca llega al navegador.
const cacheDni = new Map() // evita gastar verificaciones repetidas (vive mientras dure el proceso)

/** @returns {Promise<{ coincide: boolean|null, fuente: string, match_type?: string|null }>} */
export async function verificarDni(dni, nombre, key) {
  if (!/^\d{8}$/.test(dni || '')) return { coincide: null, fuente: 'dni_invalido' }
  if (!key) return { coincide: null, fuente: 'sin_clave' } // respaldo: la app marca "pendiente"
  const primerNombre = (nombre || '').trim().split(/\s+/)[0] || ''
  const claveCache = `${dni}|${primerNombre.toLowerCase()}` // mismo DNI con otro nombre = otra consulta
  if (cacheDni.has(claveCache)) return { coincide: cacheDni.get(claveCache), fuente: 'cache' }
  try {
    const form = new FormData()
    form.append('issuing_state', 'PER')
    form.append('services', 'per_dni')
    form.append('personal_number', dni)
    if (primerNombre) form.append('first_name', primerNombre)
    const r = await fetch('https://verification.didit.me/v3/database-validation/', {
      method: 'POST', headers: { 'x-api-key': key }, body: form, signal: AbortSignal.timeout(10000),
    })
    const j = await r.json()
    // 403 con la clave live y sin saldo: "database validation is disabled until your organization's first top-up"
    // (comprobado dom 8 nov). Con la sk_test_ no pasa, pero esa aprueba cualquier DNI. Respaldo: pendiente.
    if (!r.ok) { console.warn(`Didit HTTP ${r.status}:`, j.detail || JSON.stringify(j).slice(0, 200)); return { coincide: null, fuente: 'error', detalle: j.detail || `HTTP ${r.status}` } }
    // Didit v3 responde { database_validation: { status: Approved|Declined, match_type: full_match|partial_match|no_match } }
    const v = j.database_validation || j
    const coincide = v.match_type === 'full_match' || v.match_type === 'partial_match' ? true
      : v.match_type === 'no_match' ? false
        : v.status === 'Approved' ? true : v.status === 'Declined' ? false : null
    if (coincide !== null) cacheDni.set(claveCache, coincide)
    return { coincide, fuente: 'didit', match_type: v.match_type ?? null }
  } catch (e) {
    console.warn('Didit no respondio:', e.message)
    return { coincide: null, fuente: 'error' } // respaldo: pendiente
  }
}
