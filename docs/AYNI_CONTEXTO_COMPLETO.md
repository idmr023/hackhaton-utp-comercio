# AYNI – "Tu barrio se ayuda"
### Documento de contexto completo · Hackathon UTP – El Comercio 2026
*Versión 1 · viernes 6 nov 2026, 23:10 · Léelo completo antes de tocar tu parte (15 min).*

---

## 0. Resumen en 10 líneas

- **Reto:** app para que los vecinos consigan productos y servicios cerca de casa, recomendados por otros vecinos, con intercambios solidarios y un modo de emergencia para coordinar ayuda. Plazo: 48 h (vie 6 – dom 8 nov).
- **Nuestra respuesta:** **Ayni**, una web app instalable (PWA) con dos modos: **Modo Barrio** (día a día: mapa de 1 km, recomendaciones vecinales, ofrezco/necesito, trueque, puntos canjeables en negocios del barrio) y **Modo Minka** (emergencia: toda la pantalla cambia a 3 botones y un mapa de necesidades vs recursos).
- **Diferenciadores frente al jurado:** publicar en 3 toques, funciona offline, IA (Gemini) que clasifica y resume, identidad validada con DNI en RENIEC, sistema antifraude, botón de WhatsApp, puntos que le dan clientes a los emprendimientos, quechua y voz.
- **Costo de la demo: S/ 0.** Todo en niveles gratuitos. No se despliega nada obligatorio; corre en la PC de P1 y se abre desde el celular con un link.
- **Equipo:** 4 personas, una sola PC con Claude (P1 pilota, los demás navegan por turnos y prueban en celular).
- **Entrega:** domingo 8 en la noche. Presentaciones 10–12 nov 7 p.m. Finalistas 13 nov. Sustentación y premiación martes 17 nov 6:00–8:30 p.m.
- **Nombres:** *Ayni* = reciprocidad andina (hoy por ti, mañana por mí). *Minka* = trabajo colectivo por la comunidad. Los ganadores anteriores usaron nombres en quechua y al jurado le gustó.

---

## 1. El reto (de las diapositivas de la inducción)

> Crear en 48 horas un aplicativo que sirva a los ciudadanos para obtener con costos mínimos, y sin necesidad de transporte mayor, productos y servicios avalados por recomendaciones de vecinos. La aplicación debe integrar mecanismos de intercambios solidarios y evolucionar en situaciones de emergencia para coordinar soporte a los vecinos.

**Características funcionales pedidas (todas las cubrimos):**

| Pedido por el reto | Dónde lo cubre Ayni |
|---|---|
| Información recomendada de productos y servicios cerca de la zona de residencia | Mapa de 1 km con "recomendado por N vecinos de tu zona" |
| Promover servicios y compartir recomendaciones vecinales | Publicación "Ofrezco" / "Recomiendo", perfil de negocio |
| Solicitar y ofrecer ayuda e intercambios solidarios | Publicación "Necesito", trueque/préstamo, puntos Ayni |
| Servicios y grupos de apoyo durante emergencias | Modo Minka: necesidades, recursos, brigadas, acopio, boletín |
| Coordinación de necesidades y recursos en emergencia | Match automático necesidad ↔ recurso más cercano |
| Geolocalización de servicios, recursos y necesidades | Leaflet + OpenStreetMap + geohash |
| Tutorial | 3 pantallas al primer ingreso |
| Enfoque móvil, máximo 3 clics para publicar | (+) → tipo → foto/voz y Publicar |
| Online y offline | PWA + service worker + cola local + Firestore offline |
| Intuitivo y accesible para cualquier vecino | Botones grandes, voz, quechua, letra grande |

**Criterios de evaluación (funcionalidad):** usabilidad, confiabilidad, escalabilidad, propuesta (riesgos/beneficios para la institución), código y programa (interfaz + funcionalidad completas), innovación y creatividad.
**Criterios de evaluación (presentación):** comunicación y rol del equipo, manejo del tiempo, recursos audiovisuales, organización (propósito y conclusiones), capacidad de respuesta a preguntas.

---

## 2. Qué hicieron los ganadores anteriores y qué copiamos

| Edición | Reto | Ganador | Por qué ganó |
|---|---|---|---|
| 2.ª (2020) | Voto informado | DvCIX (Chiclayo) – *Tupay* | Cuestionario tipo juego, nombre en quechua, app operativa en la demo |
| 3.ª (2021) | Alerta para mujeres en riesgo | Atipax (Arequipa) – *NanSuyai* | Pulsera inteligente, quechua, asistente virtual; "se pusieron en el lugar de la víctima" |
| 4.ª (2022) | Ciudadanos ↔ municipios | Equipo Flores/Melgarejo/Quispe/Berrios | Datos abiertos, mapa de obras, reportes con seguimiento; enfoque práctico a un problema cotidiano |
| 6.ª (2024) | Inseguridad ciudadana | Equipo de Chimbote | Botón de pánico, chat vecinal, bot IA online/offline, reportes por zona; presentaron Gantt de 8 meses |
| 7.ª (2025) | Información electoral | Loop (Chimbote) – *Tu voto manda* | Asistente IA en WhatsApp, quechua/aymara, audio, 3 juegos; "llevarla al canal que usan millones" |

**Patrones que repetimos a propósito:**
1. Diseñar desde el vecino real (empatía).
2. Inclusión: quechua, voz, letra grande.
3. Canal sin fricción: WhatsApp, 3 toques.
4. **La app funciona en vivo en la demo** (no solo pantallas).
5. IA como diferenciador visible.
6. Mapa y datos georreferenciados.
7. Roadmap y valor para la institución (El Comercio y municipalidades).

---

## 3. La propuesta en detalle

### 3.1 Modo Barrio (Ayni) – el día a día
- **Mapa en radio caminable.** Por defecto **1 km** (≈ 12–15 min a pie, 8–10 cuadras en Lima). Selector 500 m / 1 km / 2 km / 5 km. Se calcula desde la ubicación del vecino; no es una zona fija.
- **Negocios y oficios** (bodega, gasfitero, costurera, técnico) con la etiqueta **"Recomendado por 12 vecinos de tu zona"** en vez de estrellas anónimas, y un **resumen IA** de los comentarios ("rápido, cobra justo, atiende domingos").
- **Tres tipos de publicación:** `OFREZCO` (servicio/producto), `NECESITO` (ayuda/producto), `RECOMIENDO` (un negocio u oficio).
- **Publicar en 3 toques:** botón (+) → elegir tipo → foto o nota de voz + Publicar. La ubicación sale sola (GPS → celda aproximada) y Gemini asigna la categoría. Meta: menos de 20 segundos.
- **Intercambios solidarios:** trueque, préstamo de herramientas, ayuda (1 hora de ayuda confirmada = puntos Ayni).
- **Botón WhatsApp:** abre `https://wa.me/51XXXXXXXXX?text=Hola, te vi en Ayni como gasfitero en Surquillo...`. Solo aparece si el usuario/negocio marcó "mostrar mi WhatsApp" (opt-in). No usa API ni cuesta.

### 3.2 Modo Minka – la emergencia
- **Disparador:** alerta de autoridad (rol moderador) **o** ≥ 3 vecinos verificados de distintas celdas reportan (evita falsas alarmas).
- **Toda la interfaz cambia** a 3 botones grandes que funcionan offline:
  - **ESTOY BIEN** → marca al vecino a salvo; sus contactos lo ven.
  - **NECESITO AYUDA** → tipo (agua / medicina / albergue / rescate / comida) + urgencia 1-3.
  - **PUEDO AYUDAR** → recurso (enfermera / botiquín / generador / vehículo / espacio).
- **Mapa Minka:** necesidades en rojo, recursos en verde, puntos de acopio y brigadas por cuadra.
- **Match automático:** recurso más cercano del mismo tipo según urgencia (ej. "enfermera a 2 cuadras"). Notifica a ambos y abre chat/WhatsApp. La necesidad pasa a "atendida".
- **Boletín Minka (noticias locales):** colección `avisos_minka` que alimenta un moderador (municipio / serenazgo / El Comercio) + "parte de zona" que Gemini resume cada hora con los reportes vecinales ("Cuadra 5: 3 familias sin agua, 1 herido leve"). En la demo se cargan 3–4 avisos de ejemplo. **Escalabilidad:** ingestión automática de IGP (sismos), Senamhi, Indeci y El Comercio como socio de contenido. **No hacemos scraping de portales** (frágil).
- Al terminar la emergencia la app vuelve a Modo Barrio y quienes ayudaron reciben puntos.

### 3.3 Puntos Ayni – recompensas que traen clientes al negocio
**Cómo se ganan**

| Acción | Puntos |
|---|---|
| Ayuda confirmada por quien la recibió | 10 |
| Recomendación verificada | 2 |
| Ayudar en Modo Minka | 20 |
| Negocio que dona en emergencia | 30 |

**Cómo se canjean:** los negocios del barrio publican recompensas con su propio producto ("10% de descuento", "1 pan gratis con tu compra", "2x1 en menú") con costo en puntos, stock y vigencia. El vecino canjea en la app, recibe un **código de 6 dígitos**, lo muestra en el local y el negocio lo valida en su pantalla. Los puntos vencen a los 6 meses.

**Por qué le conviene al emprendimiento (rentabilidad):** no paga dinero, pone producto; cada canje lleva un cliente nuevo al local; gana la insignia **"Negocio solidario"**, aparece destacado en el mapa y tiene botón de WhatsApp. **Roadmap de negocio:** plan "Destacado" de pago, auspicio de municipalidades / El Comercio para recompensas comunitarias.

### 3.4 Confianza, identidad y antifraude
**Identidad (en la demo):**
- Registro con **teléfono + código SMS** (Firebase Auth) y **DNI de 8 dígitos**. 1 cuenta por DNI y por teléfono.
- El DNI se **valida en RENIEC vía Didit** (`POST /v3/database-validation/`, `services=per_dni`; 500 verificaciones gratis/mes, luego $0.20). Se guarda **solo el hash** del DNI, nunca el número, y hay pantalla de consentimiento.
- La API key de Didit **no va en la app**: la llama un **mini servidor Node/Express local** en la PC de P1 (Cloud Functions exige tarjeta, por eso no).
- **Respaldo:** si Didit no responde, la cuenta queda "pendiente de verificación" (puede ver, no gana puntos). La demo nunca se cae.
- **Vecino verificado** = DNI validado + 2 avales de vecinos ya verificados (botón "Lo conozco").

**Límite de ayudas (contra amigos que se ayudan en bucle y cuentas falsas):**
- Misma pareja A→B: **10, 5, 0** puntos dentro del mes.
- Máximo **3 ayudas confirmadas y 30 puntos por día**.
- **Confirmación presencial:** quien recibe escribe el código de 4 dígitos del que ayuda y la app verifica que ambos celulares estén a **< 200 m**.
- Cuentas nuevas: puntos de los primeros 7 días quedan "pendientes" hasta tener 2 avales.
- Canje: 1 por negocio por semana por usuario; el negocio controla stock.
- 3 reportes ocultan una publicación.

**Privacidad:** la ubicación guardada es una celda aproximada de ~300 m; nunca se expone la casa exacta. Reglas de Firestore: solo el autor edita lo suyo.

**Escalabilidad (se menciona, no se construye):** detección de clústeres de cuentas que solo se ayudan entre sí.

### 3.5 Accesibilidad
Tutorial de 3 pantallas al primer ingreso · notas de voz (Gemini transcribe) · 3 frases clave en quechua · letra grande y contraste alto · botones grandes en Minka.

---

## 4. Arquitectura técnica

```
CELULAR DEL VECINO (PWA React + Vite)
 ├─ Pantallas: Mapa · Publicar · Perfil · Minka · Puntos
 ├─ Leaflet + OpenStreetMap (tiles gratis, sin API key)
 ├─ Geolocalización (navigator.geolocation) → celda ~300 m + geohash
 ├─ Service Worker (Workbox): cachea app y tiles vistos, detecta online/offline
 ├─ IndexedDB: cola de publicaciones pendientes + último estado del mapa
 ├─ Sincronizador: envía la cola a Firestore al volver la señal (FIFO, reintentos)
 └─ Clasificador de respaldo por palabras clave (si no hay IA o internet)
          │
          ├──► Firebase Auth (SMS)            [plan Spark, sin tarjeta]
          ├──► Cloud Firestore (offline ON)   [50K lecturas / 20K escrituras por día gratis]
          ├──► Gemini API (nivel gratuito)    clasifica · resume · transcribe voz
          └──► Mini servidor Node/Express (local, PC de P1) ──► Didit API ──► RENIEC
```

**Stack:** React + Vite · vite-plugin-pwa (Workbox) · Firebase JS SDK (Auth, Firestore con `enableIndexedDbPersistence`) · Leaflet + `geofire-common` · `@google/generative-ai` · Express para el proxy de Didit.

**Fotos:** no usamos Firebase Storage (no está en el plan gratuito para proyectos nuevos). La foto se comprime en el navegador (~50 KB) y va en base64 dentro del documento.

**Offline, dos trampas conocidas:**
1. El service worker solo se registra en `localhost` o HTTPS. Para probar en celular usar un túnel HTTPS (`cloudflared tunnel --url http://localhost:5173`) o Firebase Hosting (gratis).
2. Los tiles del mapa solo quedan en caché si ya se vieron con internet. Antes de la demo, recorrer la zona con conexión.

**Plan B para la IA:** si Gemini da error o límite (nivel gratuito ≈ 5–10 solicitudes por minuto), entra el clasificador por palabras clave. La demo no depende de Gemini.

---

## 5. Modelo de datos (Firestore)

| Colección | Campos principales |
|---|---|
| `usuarios` | id, nombre, teléfono, whatsappVisible (bool), dniHash, verificado (bool), avales [ids], zonaAprox (celda ~300 m), puntosAyni, idioma, creadoEn |
| `publicaciones` | tipo (OFREZCO/NECESITO/RECOMIENDO), categoria (IA), texto, fotoBase64, audioTexto, geo (aprox), geohash, autorId, fecha, estado (activa/resuelta/enCola) |
| `recomendaciones` | negocioId, autorId, zonaAutor, comentario, fecha |
| `negocios_oficios` | nombre, rubro, geo (aprox), geohash, horario, whatsapp, nRecomendaciones, resumenIA, insignias [Recomendado, Solidario] |
| `ayudas_intercambios` | tipo (AYUDA/TRUEQUE/PRÉSTAMO), ayudaId, recibeId, horas, codigo4, confirmadoPorReceptor (bool), fecha |
| `recompensas` | negocioId, titulo, costoPuntos, stock, vigencia |
| `canjes` | usuarioId, recompensaId, codigo6, estado (pendiente/canjeado/vencido), fecha |
| `emergencias` | activa (bool), tipo (sismo/incendio/inundación), inicio, fin, zona, origen (autoridad/vecinos), reportes [ids] |
| `necesidades` | emergenciaId, autorId, tipo, urgencia 1-3, geo, estado, asignadoA |
| `recursos` | emergenciaId, autorId, tipo, disponible (bool), geo, asignadoA |
| `avisos_minka` | emergenciaId, autorRol (moderador), texto, zona, fecha, resumenIA |

---

## 6. Flujos clave (los que se muestran en la demo)

**A. Publicar en 3 toques:** abre mapa → (+) → tipo → foto/voz + Publicar → ubicación automática → ¿internet? sí: Gemini clasifica → Firestore · no: clasificador local → cola IndexedDB → aparece en el mapa de los vecinos del radio.

**B. Offline:** se va la señal → la app sigue abriendo (caché) → publicaciones a la cola con marca "pendiente" → vuelve la señal → sincronizador sube la cola → Gemini clasifica → mapa se actualiza. *En la demo: activar modo avión en vivo, publicar, reactivar y ver que sube.*

**C. Modo Minka:** disparador → 3 botones → necesidad o recurso → mapa Minka → match automático → notificación + WhatsApp → "atendida" → boletín de zona.

**D. Recomendación + WhatsApp + canje:** busca "gasfitero" → ve "recomendado por 12 vecinos" + resumen IA → botón WhatsApp → después de la ayuda, quien la recibió confirma (+10) → catálogo de recompensas → canje con código de 6 dígitos → el negocio valida y gana insignia.

**E. Registro:** tutorial → teléfono + SMS → DNI + consentimiento → mini servidor → Didit/RENIEC → coincide: cuenta creada (hash) · no responde: "pendiente" → 2 avales → vecino verificado.

*Los diagramas completos están en `Ayni_diagrama.drawio` (2 páginas) y los PNG `Ayni_1_arquitectura_datos.png` y `Ayni_2_flujos_usuario.png`.*

---

## 7. Costo: S/ 0

| Pieza | Servicio | Costo |
|---|---|---|
| Frontend | Vite en la PC de P1 | 0 |
| Login y base de datos | Firebase plan Spark (no pide tarjeta) | 0 |
| Mapa | Leaflet + OpenStreetMap | 0 |
| IA | Gemini API nivel gratuito | 0 |
| Validación DNI | Didit, 500 verificaciones/mes | 0 |
| Proxy de Didit | Node/Express local | 0 |
| Hosting (opcional) | Firebase Hosting / túnel cloudflared | 0 |

**Regla:** nadie vincula una tarjeta a Firebase ni a Google Cloud. Mientras no haya tarjeta, es imposible que cobren.

---

## 8. Equipo, roles y cómo trabajamos con una sola PC

**Una sola PC tiene Claude (la de P1).** P1 pilota: es el único que escribe y corre código. Los demás son **navegantes**: se sientan junto a P1 en el bloque de su módulo y dictan el QUÉ (qué debe hacer la pantalla); P1 le pide el CÓMO a Claude. Cuando no están de turno, **prueban en su celular** (P1 comparte un link por túnel o Wi-Fi; no se descarga nada de una tienda) y preparan datos, demo o slides.

| Rol | Responsable de |
|---|---|
| **P1 · Piloto** | Repo GitHub, generar e integrar todo el código con Claude, correr la app, build final, entrega |
| **P2 · Navegante Barrio + QA celular** | UX de mapa, publicar y offline; probar cada versión en Android; bugs con captura; maneja el celular en la demo; graba video de respaldo |
| **P3 · Navegante Minka + datos semilla** | Barrio real de la demo; 15 negocios + 10 vecinos + recompensas + avisos cargados en Firestore; UX de Minka, puntos, canje y WhatsApp; 3 frases en quechua; escenario de sismo |
| **P4 · Cuentas, demo y sustentación** | Firebase, key de Gemini, cuenta Didit y prueba con curl (sáb 9:00); guion de demo (5 min); slides; lista de preguntas del jurado; coordina syncs; narra la demo |

**Reglas de trabajo**
1. Nunca dos personas pidiéndole cosas a Claude a la vez.
2. "Listo" = probado en un celular, no en la laptop.
3. Syncs de 10 min: 10:00 · 16:00 · 22:00 (terminé / sigo / me bloquea).
4. Un bloqueo se avisa al instante por WhatsApp, no en el siguiente sync.
5. Hoy viernes solo produce P1; P2, P3 y P4 hacen trabajo previo que no necesita la app.

---

## 9. Cronograma (detalle en `Ayni_cronograma_48h.png`)

| Bloque | P1 (PC + Claude) | P2 | P3 | P4 |
|---|---|---|---|---|
| **Vie 23–01** | Repo + esqueleto Vite/PWA/Firebase; lo corre | Textos de pantallas; dormir temprano | Elegir barrio; lista de 15 negocios y 10 vecinos | Crear Firebase (Spark), key Gemini, cuenta Didit |
| **Sáb 9–13** | Con P2: mapa 1 km, publicar 3 toques, registro | Abre link en celular; navega mapa/publicar | Datos semilla en hoja (negocios, recompensas, avisos) | 9:00 probar Didit con curl y su DNI |
| **Sáb 13–16** | Con P4: servidor Didit + reglas. Con P2: offline | Prueba modo avión real; bugs con captura | Diseña Minka en papel; carga semilla en Firestore | Navega servidor Didit; guion de demo |
| **Sáb 16:00** | **INTEGRACIÓN 1: registro → mapa → publicar en 2 celulares** | | | Coordina sync |
| **Sáb 16–20** | Corrige bugs. Con P3: Minka 3 botones + mapa | Lista de bugs priorizada | Navega Minka; prueba 3 botones | Slides: problema, solución, ganadores anteriores |
| **Sáb 20–24** | Con P3: match, puntos, canje | Prueba Barrio completo con cronómetro | Navega puntos/canje; 3 recompensas de prueba | Slides: arquitectura, modelo de negocio, roadmap |
| **Dom 9–13** | Con P3: WhatsApp, tutorial, avisos. Con P4: Gemini + respaldo | Prueba Minka + canje; cachea tiles | Navega WhatsApp/tutorial; frases en quechua | Navega Gemini; preguntas del jurado |
| **Dom 13–14** | **FREEZE: solo bugs** | Prueba final completa | Prueba Minka final | Cierra slides |
| **Dom 14–18** | Corrige lo reportado; build final | **Ensayo de demo x3** (maneja celular); video de respaldo | Escenario de sismo para la demo | **Ensayo de demo x3** (narra); capturas reales en slides |
| **Dom 18–22** | Entrega: repo, link/APK, video | Ensayo final | Ensayo final | Checklist y envío |

Lunes 9: ensayar la sustentación, no programar.

---

## 10. Guion de la demo (5 minutos)

1. **Problema (30 s):** "¿A quién le pides un gasfitero de confianza? Al vecino. Y en un sismo, ¿quién llega primero? El vecino."
2. **Registro (30 s):** teléfono, DNI validado en RENIEC en vivo, tutorial.
3. **Modo Barrio (90 s):** mapa de 1 km con negocios recomendados → publicar "Necesito gasfitero" en 3 toques (contar en voz alta) → aparece en el mapa clasificado por IA → botón WhatsApp.
4. **Offline (45 s):** modo avión en vivo → publicar → reactivar → sube solo.
5. **Modo Minka (90 s):** activar emergencia → 3 botones → "Necesito agua" en un celular, "Tengo botiquín/agua" en el otro → match → boletín de zona resumido por IA.
6. **Puntos y negocio (30 s):** confirmar ayuda → +10 → canjear "1 pan gratis" con código → el negocio valida.
7. **Cierre (30 s):** costo S/ 0, antifraude, roadmap (Didit a escala, IGP/Senamhi, plan Destacado, El Comercio como socio de contenido).

**Preguntas probables del jurado y respuesta corta:**
- *¿Y si dos amigos se ayudan en bucle?* → puntos decrecientes 10/5/0, tope diario, confirmación presencial a < 200 m, DNI único.
- *¿Cómo evitan alertas falsas de emergencia?* → ≥ 3 vecinos verificados de distintas celdas, o autoridad.
- *¿Cómo gana el negocio?* → clientes nuevos por cada canje, sin pagar dinero; plan Destacado a futuro.
- *¿Privacidad?* → DNI en hash, ubicación en celda de 300 m, WhatsApp opt-in.
- *¿Cuánto cuesta escalar?* → Firestore y Gemini por uso; Didit $0.20 por DNI pasadas 500/mes.

---

## 11. Checklist de entrega (domingo)
- [ ] Repo en GitHub con README (cómo correr: `npm i`, `.env`, `npm run dev`, servidor Didit).
- [ ] App funcionando en 2 celulares desde un link.
- [ ] Datos semilla cargados (barrio real, 15 negocios, recompensas, avisos).
- [ ] Video de respaldo de la demo completa (por si falla internet en la presentación).
- [ ] Slides con capturas reales.
- [ ] Diagramas (arquitectura y flujos) y este documento en el repo.
