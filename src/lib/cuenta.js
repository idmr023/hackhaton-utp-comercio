// Cuenta: el celular para ENTRAR y el PIN viven en `accesos` (id = usuario.id, autorId = usuario.id, editable).
// `usuarios.telefono` es el celular con el que se registro y no se puede editar (sin autorId): si la persona cambia
// su celular en Ajustes, solo cambia `accesos.telefono`, y el de registro deja de servir para entrar.
import { listar, obtener } from './db'
import { sha256 } from './hash'

export const hashPin = (pin, dniHash) => sha256(`${pin}|${dniHash}`) // el hash del DNI hace de sal

/** Cuentas que entran con este celular: [{ u, acceso }], con u.telefono = celular para entrar.
 *  1) las que lo tienen en accesos (incluye las que lo cambiaron en Ajustes);
 *  2) las viejas que lo tienen en usuarios, salvo que ya lo hayan cambiado por otro (deDni: tambien esas, para recuperar con DNI). */
export async function cuentasConCelular(telefono, { deDni = false } = {}) {
  const [porAcceso, porUsuario] = await Promise.all([
    listar('accesos', { telefono }, 10).catch(() => []),
    listar('usuarios', { telefono }, 10),
  ])
  const res = new Map()
  for (const a of porAcceso) {
    const u = await obtener('usuarios', a.usuarioId || a.id).catch(() => null)
    if (u) res.set(u.id, { u: { ...u, id: u.id, telefono }, acceso: a })
  }
  for (const u of porUsuario) {
    if (res.has(u.id)) continue
    const acceso = await obtener('accesos', u.id).catch(() => null)
    const cambio = acceso?.telefono && acceso.telefono !== telefono // ya entra con otro celular
    if (cambio && !deDni) continue
    res.set(u.id, { u: { ...u, telefono: cambio ? acceso.telefono : telefono }, acceso })
  }
  return [...res.values()]
}
