// Modo Barrio: carga publicaciones y negocios cercanos una sola vez y los reparte entre sus dos secciones,
// Mapa ("/") y Vecinos ("/vecinos"). Tocar algo en la lista lleva al mapa, lo centra y abre su popup.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useEstado } from '../lib/estado'
import { listarCerca } from '../lib/db'
import { pendientes } from '../lib/offlineQueue'
import { cargarResenasNegocios, negocioVisible } from '../lib/negocios'
import Mapa from './Mapa'
import Vecinos from './Vecinos'

export default function Barrio({ vista }) {
  const { ubicacion, radioKm, t } = useEstado()
  const nav = useNavigate()
  const [pubs, setPubs] = useState([])
  const [negocios, setNegocios] = useState([])
  const [nPend, setNPend] = useState(0)
  const [cargado, setCargado] = useState(false)
  const [resenasNeg, setResenasNeg] = useState({}) // estrellas reales por negocio (una consulta)
  const [foco, setFoco] = useState(null) // { k, lat, lng, n }: lo elegido en la lista, para centrarlo en el mapa
  const loc = useLocation()
  // "Ver en el mapa" desde el detalle de una publicacion llega como state de la navegacion
  // Se usa una vez y se borra del historial: si no, recargar la pagina volvia a abrir ese popup
  useEffect(() => {
    if (!loc.state?.foco) return
    setFoco({ ...loc.state.foco, n: Date.now() })
    nav(loc.pathname, { replace: true, state: null })
  }, [loc.state]) // eslint-disable-line

  useEffect(() => {
    if (!ubicacion) return
    // Las publicaciones que su autor quito (estado "retirada") no se muestran
    listarCerca('publicaciones', ubicacion, radioKm).then((l) => setPubs(l.filter((p) => p.estado !== 'retirada'))).catch(console.error).finally(() => setCargado(true))
    listarCerca('negocios_oficios', ubicacion, radioKm).then((l) => setNegocios(l.filter(negocioVisible))).catch(console.error)
    pendientes().then((l) => setNPend(l.length))
    cargarResenasNegocios().then(setResenasNeg).catch(() => {})
  }, [ubicacion, radioKm])

  if (!ubicacion) return (
    <div className="cargando" role="status">
      <div className="ficha grande teal"><MapPin aria-hidden="true" /></div>
      <p>{t('Buscando tu ubicación…')}</p>
    </div>
  )

  // Ambas rutas renderizan este mismo componente, asi que el foco sobrevive al cambio de pestana
  const elegir = (f) => { setFoco({ ...f, n: Date.now() }); nav('/') }
  const datos = { pubs, negocios, nPend, cargado, resenasNeg }
  return (
    <div className={`barrio vista-${vista}`}>
      {vista === 'lista'
        ? <div className="barrio-lista"><Vecinos {...datos} onElegir={elegir} /></div>
        : <div className="barrio-mapa"><Mapa {...datos} foco={foco} /></div>}
    </div>
  )
}
