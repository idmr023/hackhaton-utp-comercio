# Ayni – Todo lo que necesitas para las diapositivas
*Hackathon UTP – El Comercio 2026 · actualizado sáb 7 nov, 20:45 · para quien arma las slides.*

> **Regla de oro:** todo lo que está en las secciones 1 a 6 **ya funciona en la app** y se puede mostrar en vivo. Lo de la sección 8 es **siguiente paso** (roadmap): se presenta como plan, nunca como si ya estuviera hecho.

---

## 1. La idea en una frase
**Ayni – tu barrio se ayuda.** Una app para el celular donde los vecinos encuentran negocios y servicios recomendados por otros vecinos a menos de 1 km, se ayudan entre ellos y, cuando hay una emergencia, la app se convierte en **Modo Minka** para coordinar quién necesita qué y quién puede ayudar.

**Por qué esos nombres:**
- **Ayni** = reciprocidad andina: hoy por ti, mañana por mí.
- **Minka** = trabajo colectivo por la comunidad.

Los ganadores de ediciones anteriores usaron nombres en quechua y al jurado le gustó.

## 2. El reto y cómo lo cumplimos
> *Crear en 48 horas un aplicativo que sirva a los ciudadanos para obtener con costos mínimos, y sin necesidad de transporte mayor, productos y servicios avalados por recomendaciones de vecinos. La aplicación debe integrar mecanismos de intercambios solidarios y evolucionar en situaciones de emergencia para coordinar soporte a los vecinos.*

| Lo que pide el reto | Cómo lo hace Ayni (funciona hoy) |
|---|---|
| Productos y servicios recomendados cerca de casa | Mapa con radio de 500 m a 5 km. Cada negocio dice *"Recomendado por N vecinos de tu zona"*, con un resumen de opiniones y su horario |
| Promover servicios y compartir recomendaciones | Publicar **Ofrezco** o **Recomiendo** |
| Pedir y ofrecer ayuda (intercambio solidario) | Publicar **Necesito**, contactar por **WhatsApp** con el mensaje ya escrito, y **puntos Ayni** canjeables en negocios del barrio |
| Apoyo durante emergencias | **Modo Minka**: 3 botones gigantes, mapa de necesidades y recursos, boletín de avisos |
| Coordinar necesidades y recursos | **Match automático**: une al que necesita con el recurso más cercano que le sirve |
| Geolocalización | Mapa OpenStreetMap con búsqueda por cercanía (geohash) |
| Tutorial | 3 pantallas la primera vez |
| Móvil, máximo 3 clics para publicar | **+** → tipo → escribir, foto o voz → Publicar |
| Online y offline | Funciona sin señal: guarda en el celular y sube solo al volver la conexión, **sin duplicar** |
| Intuitivo y accesible | Botones grandes, letra grande, alto contraste, frases en quechua, dictado por voz, fuente para baja visión |

## 3. Qué hace la app, pantalla por pantalla
**Barrio de la demo:** Surquillo, Lima. Tiene **15 negocios reales del barrio**, como Panadería La Espiga de Oro, Pollería El Dorado, Farmacia San Juan y Gasfitería Don Carlos, y **10 vecinos** de ejemplo. Los datos los preparó Bruce.

### 3.1 Registro e identidad
- Te registras con **celular + DNI**. El DNI se **valida contra RENIEC** a través de **Didit** y aparece el sello **"Validado en RENIEC"**.
- **Privacidad:** la app guarda solo una "huella" del DNI (un hash), **nunca el número**. Pide consentimiento antes de validar.
- Si ya tienes cuenta, escribes el mismo celular y DNI y **entras directo**, sin duplicar cuentas.
- Si el servicio de RENIEC no responde, la cuenta queda *"Pendiente de verificación"* y **la app sigue funcionando**.
- **No hay login por SMS:** el equipo lo descartó por tiempo y riesgo en vivo. Celular + DNI validado al crear la cuenta, y celular + PIN para entrar después (la huella del PIN se guarda con el DNI de sal). En producción iría Firebase Auth.

### 3.2 Modo Barrio
- **Mapa** con tu posición (punto azul) y los negocios con el **ícono de su rubro**: panadería (croissant), farmacia (pastilla), gasfitero, veterinaria, pollería…
- **Lista Vecinos** (pestaña al lado del mapa): lo que publican los vecinos cerca, lo más reciente arriba, con foto, filtro Ofrezco / Necesito / Recomiendo / Negocios y WhatsApp. En PC es un feed centrado.
- **Negocios por categoría** (Comida, Salud, Hogar y oficios, Belleza, Tiendas), cada uno con su **página**: estrellas y opiniones de los vecinos (opinar da +2 puntos), comentarios, horario y WhatsApp. Cualquier vecino **registra su negocio u oficio** desde Publicar → Mi negocio, con foto, y aparece en el mapa.
- **Entrar con celular + PIN** (4 a 6 números) elegido al crear la cuenta; el DNI validado en RENIEC sirve para recuperar el PIN.
- **Cada publicación tiene su página** con comentarios de los vecinos, y cada vecino un **perfil público**: validación RENIEC, estrellas y recomendaciones de otros vecinos, puntos Ayni, galería con las fotos de sus publicaciones y lo que ofrece o pide. Recomendar a un vecino le da +2 puntos (una vez por persona).
- **Ficha del negocio:** recomendaciones, resumen, distancia, horario y **botón de WhatsApp**.
- **Publicar en 3 toques:** Ofrezco / Necesito / Recomiendo, con foto o **dictado por voz**.
  - La **IA (Gemini)** clasifica sola cada publicación en Oficios, Alimentos, Salud, Hogar, Transporte, Educación, Mascotas u Otro.
  - Si no hay IA o internet, un clasificador por palabras clave hace el trabajo.
- **Publicaciones en el mapa:** se ven como círculos de color según el tipo, con contador si hay varias en la misma zona, y cada una con **WhatsApp del vecino** (solo si aceptó mostrarlo).
- **Sin señal:** activas el modo avión, publicas, la app avisa *"Sin internet: guardado, se subirá solo"*, y al volver la señal se sube **una sola vez**.

### 3.3 Modo Minka (emergencia)
- Un botón **Emergencia** (sirena) cambia toda la app a rojo con **3 botones gigantes**:
  - **Estoy bien** (avisa que estás a salvo)
  - **Necesito ayuda**: agua, medicina, albergue, rescate, comida u otro, con urgencia *Puede esperar / Hoy / ¡Ahora!*
  - **Puedo ayudar**: enfermera/o, botiquín, agua, comida, generador, vehículo o espacio
- **Mapa de emergencia (radio de 3 km):** pastillas rojas con sirena (necesidades) y verdes con manos (recursos) por zona.
- **Match automático:**
  - Si pides **agua**, la app encuentra al vecino más cercano que tiene agua y avisa *"¡Match! Juan P., a 2 cuadras, tiene agua"*.
  - Si ofreces ayuda, te asigna la necesidad **más urgente** cercana.
  - Los dos ven una tarjeta verde con **"Coordinar por WhatsApp"**.
- **Confirmar la ayuda en persona:** quien ayudó muestra un **código de 4 dígitos**; quien recibió lo escribe estando juntos, y quien ayudó gana **+20 puntos**.
- **Boletín Minka:**
  - Avisos de la municipalidad y el serenazgo.
  - Un **"Resumen de tu zona" escrito por IA** a partir de los reportes, por ejemplo: *"4 pedidos abiertos (2 urgentes de agua), 4 vecinos ofreciendo ayuda…"*. Si la IA falla, sale un resumen automático con los mismos números.
- **Funciona sin señal**, que es justo lo que pasa en una emergencia real.

### 3.4 Puntos Ayni (lo que gana el negocio del barrio)
- **Cómo se ganan:** ayuda confirmada en Minka **+20** (en el documento se plantean también ayuda en el barrio +10 y recomendación +2, ver sección 8).
- **Cómo se canjean:** en negocios del barrio, que ponen su propio producto. Por ejemplo:
  - *1 pan francés gratis* (10 pts, Panadería La Espiga de Oro)
  - *10 % de descuento* (20 pts, Bodega Don Lucho)
  - *Porción de papas* (25 pts, Pollería El Dorado)
  - *Revisión de fuga gratis* (30 pts, Gasfitería Don Carlos)
- **El canje** da un **código de 6 dígitos** que se muestra en el local y vence en 7 días.
- **Antifraude funcionando:**
  - Misma pareja que se ayuda en el mes: **20 → 10 → 0** puntos.
  - Máximo **3 ayudas y 30 puntos por día**.
  - Confirmación solo **estando juntos**.
  - **Un canje por negocio por semana**.
  - Stock controlado.
  - Todo queda registrado como un **libro de movimientos que no se puede editar**.

### 3.5 Accesibilidad e inclusión
- En **Ajustes** (avatar de la barra): **toda la interfaz en quechua** (Runasimi) o español con frases en quechua, **modo para daltónicos** (azul y naranja en vez de verde y rojo, en toda la app) y estos interruptores:
  - **Letra grande** (toda la app +25 %)
  - **Alto contraste**
  - **Frases en quechua**: *Allinllachu?* / *Yanapaway!* (¡ayúdame!) / *Yanapasqayki* (te ayudo) en los botones de Minka; *Sulpayki* (gracias); *Wasimasi* (vecino/a)
- **Letra Atkinson Hyperlegible:** la diseñó el Braille Institute para personas con **baja visión**, pensando en vecinos de todas las edades.
- Dictado por voz, botones grandes y colores que cumplen la norma de contraste **WCAG AA**.
- *Ojo:* las frases en quechua debía validarlas Bruce con un hablante.

## 4. Diferenciadores (para la slide de "¿por qué nosotros?")
1. **Funciona en vivo**, no son solo pantallas: la app real corre con datos reales de Surquillo.
2. **Funciona sin internet**, también en emergencia.
3. **Publicar en 3 toques**, con voz.
4. **Identidad validada con RENIEC**, guardando solo una huella del DNI.
5. **IA útil y visible:** clasifica publicaciones y escribe el resumen de zona. **Nunca depende de ella:** siempre hay respaldo.
6. **Match automático** en emergencias, más WhatsApp, el canal que todos usan.
7. **Puntos que llevan clientes** al emprendimiento del barrio, con antifraude.
8. **Inclusión real:** quechua, letra grande, alto contraste, fuente para baja visión.
9. **Privacidad desde el diseño:** la ubicación se guarda aproximada (~300 m), nunca la casa exacta.
10. **Costo S/ 0.**

## 5. Cómo está construida (slide técnica)
```
CELULAR DEL VECINO (app web instalable / PWA: React + Vite)
 ├─ Mapa: Leaflet + OpenStreetMap (gratis, sin clave) · búsqueda por cercanía con geohash
 ├─ Funciona sin señal: caché de la app + cola en el celular + base de datos con modo offline
 ├─ IA: Gemini (clasifica, resume la zona) · respaldo por palabras clave
 └─ Voz: dictado del navegador (es-PE)
        │
        ├──► Firebase Cloud Firestore (base de datos con modo offline) · plan gratuito, sin tarjeta
        ├──► Gemini API (nivel gratuito)
        └──► Mini servidor Node/Express ──► Didit ──► RENIEC (validación de DNI)
```
- **Tecnologías:** React 19, Vite, vite-plugin-pwa (Workbox), Firebase Firestore, Leaflet, geofire-common, Gemini (`gemini-3.5-flash-lite`), Express, Didit.
- **Fotos:** se comprimen en el celular, sin servicios de pago.
- **Repositorio:** github.com/idmr023/hackhaton-utp-comercio

**Costo total: S/ 0**
| Pieza | Servicio | Costo |
|---|---|---|
| App | React + Vite | 0 |
| Base de datos | Firebase plan Spark (sin tarjeta) | 0 |
| Mapa | OpenStreetMap + Leaflet | 0 |
| IA | Gemini, nivel gratuito | 0 |
| Validación DNI | Didit (500 verificaciones gratis al mes) | 0 |
| Servidor de Didit | Node/Express | 0 |

**Diagramas:** en `docs/` están `Ayni_1_arquitectura_datos.png`, `Ayni_2_flujos_usuario.png` y el editable `Ayni_diagrama.drawio`. **Atención:** se hicieron el viernes y todavía muestran **login por SMS**, que ya no existe. Hay que quitarlo antes de ponerlos en una slide (editar el `.drawio` en diagrams.net) o usar el esquema de arriba.

## 6. Flujos que se pueden mostrar en vivo (y capturar)
| Flujo | Qué se ve |
|---|---|
| **A. Registro** | Tutorial → celular + DNI → "Validado en RENIEC" |
| **B. Publicar en 3 toques** | + → Necesito → escribir o dictar → Publicar → aparece en el mapa del otro celular |
| **C. Sin señal** | Modo avión → publicar → *"Sin internet: guardado"* → quitar modo avión → se sube sola, una vez |
| **D. Negocio + WhatsApp** | Tocar el pin de la panadería → *"Recomendado por 24 vecinos"* → WhatsApp con mensaje listo |
| **E. Minka con 2 celulares** | Emergencia → celular A pide comida (¡Ahora!) → celular B ofrece comida → "¡Match!" en los dos → WhatsApp → código de 4 dígitos → +20 puntos |
| **F. Canje** | Puntos → Canjear "1 pan francés gratis" → código de 6 dígitos → saldo baja |
| **G. Inclusión** | Ajustes → letra grande, alto contraste, quechua → Minka con las frases en quechua |

**Capturas para las slides:**
- Lo mejor es sacarlas **desde el celular**, con el link del túnel y `?demo=1`, que fija la ubicación en Surquillo.
- Para borradores rápidos, en la PC (con `npm run dev` corriendo): `node scripts/capturas.mjs capturas`. Saca capturas tamaño celular de todas las pantallas en la carpeta `capturas/`.

## 7. Modelo de negocio y valor para la institución (criterio "propuesta")
- **Para el emprendimiento del barrio:**
  - No paga dinero: pone producto (un pan, un descuento).
  - **Cada canje le lleva un cliente nuevo.**
  - Aparece en el mapa con sus recomendaciones y botón de WhatsApp.
- **Ingresos futuros:**
  - Plan **"Destacado"** de pago para negocios.
  - **Auspicio** de municipalidades y de El Comercio para recompensas comunitarias.
- **Para El Comercio:**
  - Socio de contenido del **Boletín Minka** en emergencias.
  - Presencia en la vida diaria del barrio y datos agregados (anónimos) de necesidades por zona.
- **Para las municipalidades:**
  - Canal directo para avisos de emergencia, ya conectado al boletín.
  - Mapa en tiempo real de qué falta y dónde.
- **Riesgos y cómo se mitigan:**

  | Riesgo | Mitigación |
  |---|---|
  | Cuentas falsas | DNI validado con RENIEC |
  | Puntos inflados | Antifraude: pareja 100/50/0, tope diario, confirmación en persona, libro de movimientos |
  | Privacidad | Hash del DNI y ubicación aproximada |
  | Caída de servicios | Respaldo en IA, en Didit y sin señal |

## 8. Siguiente paso / roadmap (presentarlo como plan, NO como hecho)
- **Ayuda confirmada +10** y **recomendación +2** también en el Modo Barrio (hoy los puntos se ganan en Minka).
- **Avales:** "Vecino verificado" con 2 avales de vecinos ya verificados; puntos "pendientes" los primeros 7 días.
- **Insignia "Negocio solidario"** y **"negocio que dona" +30** en emergencias.
- **Trueque y préstamo** entre vecinos; **3 reportes ocultan una publicación**.
- **Minka automático:** se activa solo con una alerta oficial o cuando 3 o más vecinos de distintas zonas reportan.
- **Conexión con fuentes oficiales:** IGP (sismos), Senamhi, Indeci y El Comercio como fuente de avisos.
- **Para producción:**
  - Validación de puntos y códigos en el servidor (Cloud Functions).
  - Reglas de seguridad más estrictas.
  - Clave "live" de Didit.
  - Detección de grupos de cuentas que solo se ayudan entre sí.
  - Publicar en la tienda como app instalable.

## 9. Preguntas probables del jurado (con respuesta honesta)
| Pregunta | Respuesta |
|---|---|
| ¿La validación con RENIEC es real? | Usamos Didit, que consulta RENIEC. En la demo usamos su **clave de prueba**, que aprueba aunque el nombre no coincida; en producción se usa la clave real (500 gratis al mes). |
| ¿Qué pasa si no hay internet? | La app abre, permite pedir y ofrecer ayuda, y guarda todo en el celular. Al volver la señal se sube solo, sin duplicar. |
| ¿Y si falla la IA? | Hay un clasificador por palabras clave y un resumen automático con los mismos datos. La app nunca depende de la IA. |
| ¿Cómo evitan que dos amigos se regalen puntos? | Misma pareja: 20, luego 10, luego 0 puntos en el mes. Máximo 3 ayudas y 30 puntos al día. Confirmación con código estando juntos. Todo queda registrado y no se puede editar. |
| ¿Cómo se verifica que estén juntos? | La app compara las ubicaciones. Por privacidad solo guardamos la zona (~300 m), así que la verificación tiene ese margen. En producción se haría en el servidor. |
| ¿Se ve dónde vivo? | No. Se guarda una zona aproximada de unos 300 m, nunca la casa exacta. Del DNI solo se guarda una huella, no el número. |
| ¿Cuánto cuesta? | Hoy S/ 0: todo en niveles gratuitos, sin tarjeta. Al escalar: Firebase por uso y Didit a USD 0,20 por verificación después de las 500 gratis. |
| ¿Por qué no hay login con SMS? | Lo descartamos para no depender en vivo de un servicio con pocos mensajes gratis. La identidad la da el DNI validado con RENIEC, y el SMS queda como mejora. |
| ¿Cómo escala a otros barrios? | La búsqueda por cercanía (geohash) funciona igual en cualquier ciudad. Basta cargar los negocios del barrio, o que los vecinos los recomienden. |
| ¿Qué gana El Comercio? | Un canal de contenido útil en emergencias (Boletín Minka), presencia diaria en el barrio y datos agregados por zona. |

## 9b. Dónde está la app
- **URL fija (producción):** https://ayni-xpertimpact.vercel.app. Se instala desde el celular (Chrome → Agregar a pantalla de inicio) y abre sin internet. Para la demo no hace falta nada corriendo en la PC: solo internet en el celular.
- La URL con ubicación de demo fija en Surquillo: https://ayni-xpertimpact.vercel.app/?demo=1

## 10. Identidad visual (para que las slides combinen con la app)
- **Concepto:** **"tejido verde"**: Ayni es reciprocidad, y la identidad es el verde andino sobre un fondo marfil cálido. El maíz marca lo que suma (puntos, publicar) y la terracota lo que se pide. El **rojo queda solo para Minka**. El único gesto decorativo es la **faja** (franja tejida) delgada: en la app va bajo la barra, en la portada y en la tarjeta de puntos; en las slides, una franja arriba o abajo. No llenar de patrones.
- **Colores** (los mismos de `docs/PALETA_COLORES.md`):

  | Nombre | Hex | Uso |
  |---|---|---|
  | Verde andino | `#2F6B4F` | marca, botones, navegación activa |
  | Verde profundo | `#24543E` | títulos, fondos oscuros (portada, tarjeta de puntos) |
  | Verde suave | `#E6F0E9` | fondos de etiquetas y fichas |
  | Teal | `#2F7C78` | ubicación, información, botón "Estoy bien" |
  | Marfil | `#F7F5EF` | fondo general |
  | Maíz | `#E6B84A` | puntos, botón Publicar, acentos (texto oscuro encima) |
  | Terracota | `#C66A4A` | "Necesito" (para texto usar la oscura `#8E4530`) |
  | Rojo Minka | `#B33A3A` | solo emergencia |
  | Tinta | `#26332C` | texto |

- **Faja:** franjas repetidas de verde profundo, maíz, marfil, terracota, maíz, marfil.
- **Logo (del equipo, dom 8 nov):** tres vecinos tomados de la mano formando un corazón (terracota, teal y verde) dentro de un aro maíz con hojas. Fuente: `public/icon.svg`; en la app va como imagen (`public/logo-ayni.png`, componente `Logo`) sobre un círculo marfil.
- **Tipografías** (gratis en Google Fonts):
  - **Big Shoulders Display** (extra negrita) para títulos y números.
  - **Atkinson Hyperlegible** para el texto.
- **Íconos:** **Lucide** (lucide.dev, trazo 2 px), los mismos de la app: mapa, sirena, monedas, persona; mano que ofrece / megáfono / estrella para Ofrezco / Necesito / Recomiendo. **Nada de emojis.**
- **Estilo:** fondo marfil o verde profundo, paneles planos con borde, sin degradados ni violeta, frases en minúscula normal (mayúsculas solo en los 3 botones de Minka).

## 11. Estructura de la presentación: 15 slides
Cada slide tiene **un solo mensaje**. Las capturas se sacan desde el celular, con el link del túnel y `?demo=1` (sección 6). La columna "Dato que se queda" es lo que el jurado debería recordar.

| # | Título sugerido | Qué va (máx. 3 puntos) | Visual | Dato que se queda |
|---|---|---|---|---|
| 1 | **Ayni: tu barrio se ayuda** | Nombre y lema · nombre del equipo · Hackathon UTP – El Comercio 2026 | Logo del equipo (vecinos en corazón, aro maíz) sobre verde profundo + faja abajo | Ayni = hoy por ti, mañana por mí |
| 2 | **El problema** | No sabemos en quién confiar para un gasfitero o una bodega cerca · los emprendimientos del barrio no se hacen ver · en un sismo nadie sabe quién necesita qué | Foto o ilustración simple del barrio (sin texto encima) | La ayuda existe, pero no se encuentra |
| 3 | **Nuestra respuesta: una app, dos modos** | **Modo Barrio** para el día a día · **Modo Minka** para emergencias · funciona en el celular, sin descargar de una tienda | Dos capturas lado a lado: mapa (verde) y Minka (rojo) | Barrio + Minka |
| 4 | **Cumplimos todo el reto** | Lista con check de lo que pedía el reto (tabla de la sección 2) | Checklist en dos columnas | 10 de 10 pedidos cubiertos |
| 5 | **Vecinos de verdad** | Registro con celular + DNI validado en **RENIEC** · se guarda solo una huella del DNI · ubicación aproximada (~300 m), nunca tu casa | Capturas: registro + Ajustes con "Validado en RENIEC" | Identidad real, privacidad cuidada |
| 6 | **Tu barrio en un mapa** | Negocios a menos de 1 km con su ícono · *"Recomendado por 24 vecinos de tu zona"* + resumen · WhatsApp con mensaje listo | Captura del mapa + ficha de Panadería La Espiga de Oro | Recomendaciones de vecinos, no de desconocidos |
| 7 | **Publicar en 3 toques** | + → Ofrezco / Necesito / Recomiendo → escribir, foto o voz · la IA (Gemini) la clasifica sola · aparece en el mapa de los vecinos | Tres capturas en fila: +, tipo, publicar | 3 toques |
| 8 | **Funciona sin internet** | Modo avión → publicas igual → *"Sin internet: guardado, se subirá solo"* · al volver la señal se sube una sola vez | Captura con el aviso amarillo "Sin internet" | Sin señal también funciona |
| 9 | **Modo Minka: emergencia** | 3 botones gigantes: Estoy bien / Necesito ayuda / Puedo ayudar · urgencia: Puede esperar · Hoy · ¡Ahora! · mapa de necesidades y recursos · resumen de zona escrito por IA | Captura de los 3 botones + boletín con el resumen | Toda la app cambia en un toque |
| 10 | **Match automático** | Pides agua → *"Juan P., a 2 cuadras, tiene agua"* · Coordinar por WhatsApp · se confirma en persona con un código de 4 dígitos | Captura de la tarjeta verde de match con el código | La app une al que necesita con el que puede |
| 11 | **Puntos que traen clientes** | Ayudar suma puntos · se canjean en negocios del barrio (pan gratis, descuento) con código de 6 dígitos · antifraude: 20 → 10 → 0 por pareja, máx. 3 ayudas al día | Captura de Puntos (saldo + recompensas) | El emprendimiento gana clientes sin pagar |
| 12 | **Para todos los vecinos** | Frases en quechua (*Yanapaway!*, *Sulpayki*) · letra grande y alto contraste · fuente para baja visión, voz, botones grandes | Captura de Minka con quechua + perfil con los interruptores | Inclusión de verdad |
| 13 | **Cómo está hecho · S/ 0** | App instalable (React + Vite) · Firebase con modo offline · Gemini, OpenStreetMap, Didit/RENIEC · todo en niveles gratuitos | Esquema de la sección 5 + tabla de costos | Costo S/ 0 |
| 14 | **Modelo de negocio y futuro** | Negocios ponen producto, ganan clientes · plan Destacado y auspicio de municipios / El Comercio · roadmap: avales, Minka automático, IGP / Senamhi / Indeci | Tres columnas: negocio · El Comercio · municipios, y una línea de tiempo corta | Sostenible y escalable |
| 15 | **Equipo y demo en vivo** | Eduardo y Jessica: desarrollo y Modo Barrio · Bruce: Minka y datos · Iván: cuentas, demo y presentación · "Ahora, en vivo" | Fotos o nombres del equipo + faja; luego se pasa al celular | La app funciona de verdad |

**Consejos:**
- **Demo en vivo al final** (slide 15) con dos celulares: publicar, modo avión y match en Minka (flujos B, C y E de la sección 6). Tener el **video de respaldo** listo por si falla la red.
- En las slides 6 a 12, una captura grande vale más que mucho texto: **máximo 3 puntos por slide**.
- Usar los colores y fuentes de la sección 10 para que las slides se vean igual que la app.

## 12. Fechas
- **Entrega:** domingo 8 nov, 22:00.
- **Presentaciones:** 10–12 nov, 7 p.m.
- **Finalistas:** 13 nov.
- **Sustentación y premiación:** martes 17 nov, 6:00–8:30 p.m.
