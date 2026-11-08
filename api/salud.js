// GET /api/salud -> { ok, didit, diditModo }: para comprobar que el despliegue en Vercel tiene la clave de Didit configurada.
// diditModo: 'prueba' (sk_test_: Didit NO consulta RENIEC y aprueba cualquier DNI) | 'produccion' (valida de verdad) | null.
// Nunca devuelve la clave.
export default function handler(_req, res) {
  const key = process.env.DIDIT_API_KEY
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ ok: true, didit: Boolean(key), diditModo: key ? (key.startsWith('sk_test_') ? 'prueba' : 'produccion') : null })
}
