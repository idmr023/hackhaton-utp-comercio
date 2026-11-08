# Ayni – Todo lo que necesitas para las diapositivas
*Hackathon UTP – El Comercio 2026 · actualizado dom 8 nov, 17:50 (versión final publicada en https://ayni-xpertimpact.vercel.app) · para quien arma las slides.*

> **Regla de oro:** todo lo que está en las secciones 1 a 6 **ya funciona en la app** y se puede mostrar en vivo. Lo de la sección 8 es **siguiente paso** (roadmap): se presenta como plan, nunca como si ya estuviera hecho.

---

## 1. La idea en una frase
**Ayni – tu barrio se ayuda.** Una app para el celular donde los vecinos encuentran negocios y servicios recomendados por otros vecinos a menos de 1 km, se ayudan entre ellos y, cuando hay una emergencia, la app se convierte en **Modo Minka** para coordinar quién necesita qué y quién puede ayudar.

### Qué significan Ayni y Minka (para explicarlo en la slide 1 o 3)
Los dos nombres vienen del quechua y nombran dos formas de ayuda mutua que existen desde hace siglos en las comunidades andinas del Perú y siguen vivas hoy.

- **Ayni** es la **reciprocidad entre personas**: yo te ayudo hoy con tu cosecha, tu techo o tu mudanza, y tú me ayudas mañana cuando yo lo necesite. Es una relación de uno a uno, entre vecinos o familias, que se devuelve con trabajo o con un favor equivalente. "Hoy por ti, mañana por mí". En la app, Ayni es el **día a día del barrio**: ofrezco, necesito, recomiendo, y los puntos Ayni son la forma de que esa reciprocidad quede registrada y vuelva al que ayudó.
- **Minka** (también escrita *mink'a* o *minga*) es el **trabajo colectivo por un bien común**: toda la comunidad se junta para algo que nadie puede hacer solo, como abrir un camino, construir una escuela o limpiar un canal. No se devuelve persona a persona, sino que todos aportan porque todos se benefician. En la app, Minka es el **modo de emergencia**: cuando hay un sismo o una inundación, el barrio entero se organiza (quién está bien, quién necesita, quién puede ayudar) y la app reparte las tareas con el match automático.

La relación entre los dos es la tesis de la app: **una comunidad que practica el ayni todos los días es la que puede hacer una minka cuando llega la emergencia.** Por eso es una sola app con dos modos, y no dos apps.

**Nombre de los modos en las slides:** la app en pantalla dice **"Ayni – tu barrio se ayuda"** en el modo normal y **"Modo Minka – emergencia en tu zona"** en emergencia. En las slides usar **Modo Ayni** y **Modo Minka**. (En el código y en documentos internos el modo normal se llamaba "barrio"; ese nombre no aparece en ninguna pantalla y no debe usarse frente al jurado.)

## 2. El reto y cómo lo cumplimos
> *Crear en 48 horas un aplicativo que sirva a los ciudadanos para obtener con costos mínimos, y sin necesidad de transporte mayor, productos y servicios avalados por recomendaciones de vecinos. La aplicación debe integrar mecanismos de intercambios solidarios y evolucionar en situaciones de emergencia para coordinar soporte a los vecinos.*

| Lo que pide el reto | Cómo lo hace Ayni (funciona hoy) |
|---|---|
| Productos y servicios recomendados cerca de casa | Mapa con radio de 500 m a 5 km y filtros por categoría de negocio y tipo de publicación. Cada negocio tiene estrellas y *"Recomendado por N vecinos de tu zona"*, con opiniones, resumen y horario |
| Promover servicios y compartir recomendaciones | Publicar **Ofrezco** o **Recomiendo** |
| Pedir y ofrecer ayuda (intercambio solidario) | Publicar **Necesito**, contactar por **WhatsApp** con el mensaje ya escrito, y **puntos Ayni** canjeables en negocios del barrio |
| Apoyo durante emergencias | **Modo Minka**: 3 botones gigantes, mapa de necesidades y recursos, boletín de avisos |
| Coordinar necesidades y recursos | **Match automático**: une al que necesita con el recurso más cercano que le sirve |
| Geolocalización | Mapa OpenStreetMap con búsqueda por cercanía (geohash) |
| Tutorial | 3 pantallas la primera vez |
| Móvil, máximo 3 clics para publicar | **+** → tipo → escribir, foto o voz → Publicar |
| Online y offline | Funciona sin señal: guarda en el celular y sube solo al volver la conexión, **sin duplicar** |
| Intuitivo y accesible | Botones grandes, letra grande, alto contraste, modo para daltónicos, toda la interfaz en quechua, dictado por voz, fuente para baja visión y un **asistente de ayuda con IA** ("¿Cómo uso Ayni?") que explica dónde tocar y te lleva a la pantalla |

## 3. Qué hace la app, pantalla por pantalla
**Barrio de la demo:** Surquillo, Lima. Tiene **15 negocios reales del barrio**, como Panadería La Espiga de Oro, Pollería El Dorado, Farmacia San Juan y Gasfitería Don Carlos, y **10 vecinos** de ejemplo. Los datos los preparó Bruce.

### 3.1 Registro e identidad
- Te registras con **nombre, celular, DNI y un PIN** de 4 a 6 números. Después entras con **celular + PIN**; si olvidas el PIN, lo recuperas con tu DNI.
- El DNI se envía a **Didit**, que lo **valida contra RENIEC** (DNI existente y nombre que coincide). La integración está hecha y probada; el código rechaza la cuenta si RENIEC dice que no coincide.
- **Estado en la demo (importante para no afirmar de más):** Didit exige una **recarga mínima de 50 USD** para activar la validación en producción, y el equipo decidió no pagarla. Por eso las cuentas **nuevas** quedan con el chip **"DNI en verificación con RENIEC"** y la app sigue funcionando. Las cuentas del equipo (Jessica, Eduardo) sí muestran **"Validado en RENIEC"** porque se crearon cuando estaba la clave de prueba. Si algún día se recarga el saldo, valida de verdad sin cambiar código.
- **Privacidad:** la app guarda solo una "huella" del DNI (un hash), **nunca el número**. Pide consentimiento antes de validar.
- Si ya tienes cuenta, escribes el mismo celular y DNI y **entras directo**, sin duplicar cuentas.
- En **Ajustes** puedes **cambiar el celular con el que entras** (pide tu PIN) y **tu WhatsApp** por separado (y si se muestra a los vecinos).
- **No hay login por SMS:** el equipo lo descartó por tiempo y riesgo en vivo. En producción iría Firebase Auth.

### 3.2 Modo Ayni (el día a día; en pantalla: "Ayni – tu barrio se ayuda")
- **Mapa** con tu posición y los negocios con el **ícono de su rubro** (o su logo): panadería (croissant), farmacia (pastilla), gasfitero, veterinaria, pollería… Arriba, **buscador** y **panel Filtrar**: Todo / Negocios / Publicaciones, **tipo de publicación** (Ofrezco, Necesito, Recomiendo) y **categorías de negocio**, cada opción con su cantidad; con "Publicaciones" el panel lista las cercanas y al tocar una el mapa la enfoca.
- **Lista Vecinos** (pestaña): dos sub-pestañas. **Vecinos**: lo que publican cerca, lo más reciente arriba, con foto, filtro Ofrezco / Necesito / Recomiendo, botones Mapa / Comentar / WhatsApp. **Negocios**: por categoría (Comida, Salud, Hogar y oficios, Belleza, Tiendas), con **estrellas** y *"N vecinos lo recomiendan"*. En PC es un feed centrado.
- **Página de cada negocio**: estrellas y opiniones de los vecinos (**opinar da +2 puntos** a quien opina), comentarios, horario, WhatsApp y "Ver en el mapa". Las estrellas de los 15 negocios de ejemplo son **datos de demo** (el promedio inicial es ficticio); cada opinión real suma 1 a la cantidad y mueve el promedio.
- Cualquier vecino **registra su negocio u oficio** desde Publicar → Mi negocio: nombre, rubro, horario, WhatsApp, descripción, **logo**, foto del local y **ubicación exacta** arrastrando el pin. Puede tener **varios negocios**; desde Ajustes los edita, los quita del mapa o los elimina.
- **Foto de perfil** desde Ajustes; se ve en la barra, en Vecinos, comentarios y perfiles.
- **Asistente "¿Cómo uso Ayni?"** (botón redondo con signo de pregunta, flotante): un chat con **Gemini** que explica cómo hacer cualquier cosa en la app, con los pasos exactos, y un botón **"Ir a …"** que te lleva a esa pantalla. Solo responde sobre la app (no inventa funciones). Sin internet responde un ayudante local por palabras clave. En quechua responde en quechua y español.
- **Cada publicación tiene su página** con comentarios de los vecinos, y cada vecino un **perfil público**: validación RENIEC, estrellas y recomendaciones de otros vecinos, puntos Ayni, galería con las fotos de sus publicaciones y lo que ofrece o pide. Recomendar a un vecino le da +2 puntos (una vez por persona).
- **Ficha del negocio:** recomendaciones, resumen, distancia, horario y **botón de WhatsApp**.
- **Publicar en 3 toques:** Ofrezco / Necesito / Recomiendo, con foto o **dictado por voz**.
  - La **IA (Gemini)** clasifica sola cada publicación en Oficios, Alimentos, Salud, Hogar, Transporte, Educación, Mascotas u Otro.
  - Si no hay IA o internet, un clasificador por palabras clave hace el trabajo.
- **Publicaciones en el mapa:** se ven como círculos de color según el tipo, con contador si hay varias en la misma zona, y cada una con **WhatsApp del vecino** (solo si aceptó mostrarlo). Desde una publicación o un negocio, **"Ver en el mapa"** centra el mapa y resalta justo esa publicación.
- **Sin señal:** activas el modo avión, publicas, la app avisa *"Sin internet: guardado, se subirá solo"*, y al volver la señal se sube **una sola vez**.

### 3.3 Modo Minka (emergencia)
- Un botón **Emergencia** (sirena) cambia toda la app a rojo con **3 botones gigantes**. Desde el barrio, el botón muestra una **burbuja roja con cuántos vecinos piden ayuda** en Minka a 3 km (se actualiza cada minuto), así nadie se entera tarde:
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
- **Cómo se ganan (todo funciona hoy):** ayuda confirmada en Minka **+20** para quien ayudó · **recomendar a un vecino** con estrellas: **+2 para el recomendado** (una vez por pareja) · **opinar sobre un negocio** con estrellas: **+2 para quien opina** (una vez por negocio). La ayuda confirmada en el barrio (+10) queda como siguiente paso (sección 8).
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
4. **Identidad con DNI integrada a RENIEC (vía Didit)**, guardando solo una huella del DNI. (Decir "integrada", no "validada": ver 3.1.)
5. **IA útil y visible, tres veces:** clasifica publicaciones, escribe el resumen de zona en Minka y responde "¿cómo uso Ayni?" llevándote a la pantalla. **Nunca depende de ella:** siempre hay respaldo.
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
 ├─ IA: Gemini (clasifica, resume la zona, asistente de ayuda) · respaldo por palabras clave
 └─ Voz: dictado del navegador (es-PE)
        │
        ├──► Firebase Cloud Firestore (base de datos con modo offline) · plan gratuito, sin tarjeta
        ├──► Gemini API (nivel gratuito)
        └──► Funciones serverless en Vercel (/api) ──► Didit ──► RENIEC (validación de DNI)
```
- **Publicada en Vercel** (https://ayni-xpertimpact.vercel.app): la app y las funciones `/api` viven ahí; para la demo no hace falta nada corriendo en la PC.
- **Tecnologías:** React 19, Vite, vite-plugin-pwa (Workbox), Firebase Firestore, Leaflet, geofire-common, Gemini (`gemini-3.5-flash-lite`), Vercel (hosting + funciones serverless; Express solo en desarrollo), Didit.
- **Fotos:** se comprimen en el celular, sin servicios de pago.
- **Repositorio:** github.com/idmr023/hackhaton-utp-comercio

**Costo total: S/ 0**
| Pieza | Servicio | Costo |
|---|---|---|
| App | React + Vite | 0 |
| Base de datos | Firebase plan Spark (sin tarjeta) | 0 |
| Mapa | OpenStreetMap + Leaflet | 0 |
| IA | Gemini, nivel gratuito | 0 |
| Validación DNI | Didit: integrado; activarlo en producción requiere una recarga mínima de 50 USD (no pagada en la demo) | 0 hoy |
| Hosting y funciones | Vercel, plan gratuito | 0 |

**Diagramas:** en `docs/` están `Ayni_1_arquitectura_datos.png`, `Ayni_2_flujos_usuario.png` y el editable `Ayni_diagrama.drawio`. **Atención:** se hicieron el viernes y todavía muestran **login por SMS**, que ya no existe. Hay que quitarlo antes de ponerlos en una slide (editar el `.drawio` en diagrams.net) o usar el esquema de arriba.

## 6. Flujos que se pueden mostrar en vivo (y capturar)
| Flujo | Qué se ve |
|---|---|
| **A. Registro y entrada** | Tutorial → nombre, celular, DNI y PIN → chip "DNI en verificación con RENIEC" (o entrar con celular + PIN a la cuenta de Eduardo/Jessica, que muestran "Validado en RENIEC") |
| **B. Publicar en 3 toques** | + → Necesito → escribir o dictar → Publicar → aparece en el mapa del otro celular |
| **C. Sin señal** | Modo avión → publicar → *"Sin internet: guardado"* → quitar modo avión → se sube sola, una vez |
| **D. Negocio + WhatsApp + opinión** | Tocar el pin de la panadería → estrellas y *"Recomendado por 24 vecinos"* → WhatsApp con mensaje listo → Opinar con 5 estrellas → la cantidad sube a 25 y Puntos muestra +2 |
| **D2. Filtros del mapa** | Botón de filtros → "Necesito" → solo quedan los pedidos de vecinos; → "Comida" → solo negocios de comida |
| **D3. Mi negocio** | Publicar → Mi negocio → nombre, rubro, logo, arrastrar el pin → aparece en el mapa y en Negocios |
| **E. Minka con 2 celulares** | Emergencia → celular A pide comida (¡Ahora!) → celular B ofrece comida → "¡Match!" en los dos → WhatsApp → código de 4 dígitos → +20 puntos |
| **F. Canje** | Puntos → Canjear "1 pan francés gratis" → código de 6 dígitos → saldo baja |
| **G. Inclusión** | Ajustes → letra grande, alto contraste, modo para daltónicos, Quechua → toda la app en quechua |
| **H. Asistente de ayuda** | Botón con signo de pregunta → "¿Cómo pido ayuda en una emergencia?" → respuesta con los pasos → botón "Ir a Modo Minka" |

**Capturas para las slides:**
- Lo mejor es sacarlas **desde el celular**, en https://ayni-xpertimpact.vercel.app/?demo=1 (`?demo=1` fija la ubicación en Surquillo).
- Para borradores rápidos, en la PC (con `npm run dev` corriendo): `node scripts/capturas.mjs capturas`. Saca capturas tamaño celular y PC de todas las pantallas en la carpeta `capturas/`. Las más útiles: `mapa`, `mapa_filtros_tipos`, `mapa_necesito`, `vecinos`, `vecinos_negocios`, `negocio`, `publicacion`, `vecino`, `publicar`, `publicar_negocio`, `minka`, `minka_abajo`, `puntos`, `ajustes`, `quechua_minka`, `daltonico`, `offline`, `ayuda`, `registro`; en PC `pc_mapa_filtros`, `pc_minka`, `pc_ayuda`.

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
  | Cuentas falsas | DNI contrastado con RENIEC vía Didit (integrado; activo al recargar saldo) + PIN |
  | Puntos inflados | Antifraude: pareja 100/50/0, tope diario, confirmación en persona, libro de movimientos |
  | Privacidad | Hash del DNI y ubicación aproximada |
  | Caída de servicios | Respaldo en IA, en Didit y sin señal |

## 8. Siguiente paso / roadmap (presentarlo como plan, NO como hecho)
- **Ayuda confirmada +10** en el Modo Ayni (hoy la confirmación con código existe solo en Minka; las recomendaciones +2 ya funcionan).
- **Avales:** "Vecino verificado" con 2 avales de vecinos ya verificados; puntos "pendientes" los primeros 7 días.
- **Insignia "Negocio solidario"** y **"negocio que dona" +30** en emergencias.
- **Trueque y préstamo** entre vecinos; **3 reportes ocultan una publicación**.
- **Minka automático:** se activa solo con una alerta oficial o cuando 3 o más vecinos de distintas zonas reportan.
- **Conexión con fuentes oficiales:** IGP (sismos), Senamhi, Indeci y El Comercio como fuente de avisos.
- **Para producción:**
  - Validación de puntos y códigos en el servidor (Cloud Functions).
  - Reglas de seguridad más estrictas.
  - Activar la validación de DNI con RENIEC (recarga de Didit, 50 USD) y, como siguiente nivel, selfie con prueba de vida para probar que el DNI es tuyo.
  - Firebase Auth en lugar del PIN propio.
  - Detección de grupos de cuentas que solo se ayudan entre sí.
  - Publicar en la tienda como app instalable.

## 8b. Escalabilidad: cómo crece Ayni (para la slide 14 y para preguntas)
Todo lo de esta sección es **propuesta**, no está hecho. Se presenta como "así escala", apoyado en que la base técnica ya lo permite.

**1. Boletín Minka conectado a El Comercio y a fuentes oficiales.** Hoy el boletín tiene dos partes: avisos de un moderador (en la demo son de ejemplo, cargados a mano) y el resumen de zona que la IA escribe con lo que reportan los vecinos. El siguiente paso es que los avisos lleguen solos:
- **El Comercio como fuente verificada:** la redacción publica avisos de emergencia por zona (cierres de vías, puntos de acopio, albergues, alertas de Indeci) desde un panel de moderador, o por una conexión directa con su sistema de noticias, y Ayni los muestra en el boletín del barrio afectado en segundos. El mismo canal sirve al revés: el **resumen de zona** de cada barrio, con cifras agregadas y anónimas (cuántos piden agua, cuántos ofrecen ayuda, dónde), es un insumo para la cobertura periodística en vivo de la emergencia.
- **Fuentes oficiales automáticas:** IGP (sismos), Senamhi (lluvias, huaicos), Indeci y las municipalidades distritales. Una alerta oficial para la zona **activa el Modo Minka sola** en los celulares del barrio y entra al boletín, sin que nadie tenga que tocar el botón Emergencia.
- **Minka automática por los vecinos:** si 3 o más vecinos de distintas zonas reportan "Necesito ayuda" en pocos minutos, la app propone entrar en Minka a todo el barrio.

**2. De un barrio a todo el país.** La búsqueda por cercanía (geohash) funciona igual en Surquillo, en Arequipa o en Iquitos: no hay nada configurado para un barrio. Para abrir una zona nueva basta con que los vecinos publiquen y registren sus negocios, o cargar una base inicial con la municipalidad. El radio de 500 m a 5 km se adapta solo a la densidad del lugar.

**3. Confianza a escala.** Con miles de usuarios, lo que hoy es una demo se refuerza: validación de DNI con RENIEC activa (recarga de Didit) y, después, selfie con prueba de vida; **avales** entre vecinos ("Vecino verificado" con 2 avales); reportes de la comunidad (3 reportes ocultan una publicación); moderadores por distrito. Firebase Auth en lugar del PIN propio.

**4. Puntos y antifraude en el servidor.** Hoy el código de confirmación y los puntos se calculan en el celular, suficiente para la demo. A escala pasan a **Cloud Functions**: el servidor emite y valida los códigos, aplica el antifraude y detecta grupos de cuentas que solo se ayudan entre sí. El libro de movimientos ya está diseñado para eso (no se edita, solo se agrega).

**5. Negocios y municipios como aliados.** Cada negocio administra su página y sus recompensas; plan **Destacado** para aparecer primero en su categoría. Las municipalidades reciben un **tablero por distrito**: qué se pide, qué se ofrece y dónde, en tiempo real durante una emergencia y como mapa de necesidades el resto del año. **"Negocio solidario"**: insignia para el que dona en emergencias (+30 puntos para su clientela).

**6. Costos al crecer.** Firebase cobra por uso (lecturas y escrituras), la app está hecha para leer poco: una consulta por radio, caché en el celular, fotos comprimidas sin servicio de archivos. Gemini se usa en tres puntos con respaldo local, así que si se corta el presupuesto de IA la app sigue igual. OpenStreetMap y Vercel no cobran a este volumen. El único costo fijo nuevo sería la validación de DNI (USD 0,20 por cuenta nueva), que se paga una sola vez por vecino.

**7. Accesibilidad y lenguas.** La interfaz ya está traducida por completo al quechua; el mismo mecanismo permite aimara, shipibo o asháninka con un archivo de traducción por lengua, validado con hablantes.

## 9. Preguntas probables del jurado (con respuesta honesta)
| Pregunta | Respuesta |
|---|---|
| ¿La validación con RENIEC es real? | La integración con Didit, que consulta RENIEC, está hecha y probada: el código acepta solo si el DNI existe y el nombre coincide. Didit exige una **recarga mínima de 50 USD** para activarla en producción y decidimos no pagarla para una demo; por eso las cuentas nuevas quedan "DNI en verificación con RENIEC". Con la recarga funciona sin cambiar código. |
| ¿Y si alguien usa el DNI de otra persona? | RENIEC confirma que el DNI existe y que el nombre le corresponde, no que quien escribe sea el dueño. El siguiente nivel es selfie con prueba de vida (Didit lo ofrece); está en el roadmap. |
| ¿El chatbot de ayuda puede inventar cosas? | Responde solo a partir de una guía de la app que le damos como contexto; si algo no existe, lo dice. Y si no hay internet, responde un ayudante local por palabras clave. |
| ¿Qué pasa si no hay internet? | La app abre, permite pedir y ofrecer ayuda, y guarda todo en el celular. Al volver la señal se sube solo, sin duplicar. |
| ¿Y si falla la IA? | Hay un clasificador por palabras clave y un resumen automático con los mismos datos. La app nunca depende de la IA. |
| ¿Cómo evitan que dos amigos se regalen puntos? | Misma pareja: 20, luego 10, luego 0 puntos en el mes. Máximo 3 ayudas y 30 puntos al día. Confirmación con código estando juntos. Todo queda registrado y no se puede editar. |
| ¿Cómo se verifica que estén juntos? | La app compara las ubicaciones. Por privacidad solo guardamos la zona (~300 m), así que la verificación tiene ese margen. En producción se haría en el servidor. |
| ¿Se ve dónde vivo? | No. Se guarda una zona aproximada de unos 300 m, nunca la casa exacta. Del DNI solo se guarda una huella, no el número. |
| ¿Cuánto cuesta? | Hoy S/ 0: todo en niveles gratuitos, sin tarjeta. Al escalar: Firebase por uso y Didit a USD 0,20 por verificación de DNI (con recarga inicial de 50 USD). |
| ¿Por qué no hay login con SMS? | Lo descartamos para no depender en vivo de un servicio con pocos mensajes gratis. La identidad la da el DNI validado con RENIEC, y el SMS queda como mejora. |
| ¿Cómo escala a otros barrios? | La búsqueda por cercanía (geohash) funciona igual en cualquier ciudad. Basta cargar los negocios del barrio, o que los vecinos los recomienden. Detalle en la sección 8b. |
| ¿Qué gana El Comercio? | Un canal de contenido útil en emergencias (Boletín Minka), presencia diaria en el barrio y datos agregados por zona. El plan es que sus avisos verificados entren solos al boletín y que el resumen de zona de cada barrio sea insumo para su cobertura en vivo. |
| ¿De dónde salen los avisos del boletín (Municipalidad, Serenazgo)? | En la demo son avisos de ejemplo cargados por un moderador. El resumen de zona sí es real: la IA lo escribe con lo que los vecinos reportan en ese momento. Conectar fuentes oficiales y El Comercio es el siguiente paso (sección 8b). |
| ¿Qué significan Ayni y Minka? | Ayni es la reciprocidad entre vecinos (hoy por ti, mañana por mí): el día a día. Minka es el trabajo colectivo por un bien común: la emergencia. Una comunidad que practica el ayni es la que puede hacer una minka. |

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
- **Logo (del equipo, dom 8 nov 15:30):** una casa verde con una sonrisa (dos ojos y una sonrisa dentro de la casa) sobre fondo maíz: el barrio que sonríe porque se ayuda. Fuente: `public/icon.svg`; en la app va como imagen (`public/logo-ayni.png`, componente `Logo`) recortada en círculo, y es el ícono de la app instalada (cuadrado maíz).
- **Tipografías** (gratis en Google Fonts):
  - **Big Shoulders Display** (extra negrita) para títulos y números.
  - **Atkinson Hyperlegible** para el texto.
- **Íconos:** **Lucide** (lucide.dev, trazo 2 px), los mismos de la app: mapa, sirena, monedas, persona; mano que ofrece / megáfono / estrella para Ofrezco / Necesito / Recomiendo. **Nada de emojis.**
- **Estilo:** fondo marfil o verde profundo, paneles planos con borde, sin degradados ni violeta, frases en minúscula normal (mayúsculas solo en los 3 botones de Minka).

## 11. Estructura de la presentación: 15 slides
Cada slide tiene **un solo mensaje**. Las capturas se sacan desde el celular, con el link del túnel y `?demo=1` (sección 6). La columna "Dato que se queda" es lo que el jurado debería recordar.

| # | Título sugerido | Qué va (máx. 3 puntos) | Visual | Dato que se queda |
|---|---|---|---|---|
| 1 | **Ayni: tu barrio se ayuda** | Nombre y lema · nombre del equipo · Hackathon UTP – El Comercio 2026 | Logo del equipo (casa verde con sonrisa sobre maíz) sobre verde profundo + faja abajo | Ayni = hoy por ti, mañana por mí |
| 2 | **El problema** | No sabemos en quién confiar para un gasfitero o una bodega cerca · los emprendimientos del barrio no se hacen ver · en un sismo nadie sabe quién necesita qué | Foto o ilustración simple del barrio (sin texto encima) | La ayuda existe, pero no se encuentra |
| 3 | **Nuestra respuesta: una app, dos modos** | **Modo Ayni** para el día a día (reciprocidad entre vecinos) · **Modo Minka** para emergencias (trabajo colectivo) · funciona en el celular, sin descargar de una tienda | Dos capturas lado a lado: mapa (verde) y Minka (rojo) | Ayni todos los días hace posible la Minka en la emergencia |
| 4 | **Cumplimos todo el reto** | Lista con check de lo que pedía el reto (tabla de la sección 2) | Checklist en dos columnas | 10 de 10 pedidos cubiertos |
| 5 | **Vecinos de verdad** | Cuenta con celular + DNI + PIN · DNI contrastado con **RENIEC** (Didit), se guarda solo una huella · ubicación aproximada (~300 m), nunca tu casa | Capturas: registro + Ajustes de Eduardo o Jessica con "Validado en RENIEC" (no crear cuenta nueva para la captura: saldría "en verificación") | Identidad real, privacidad cuidada |
| 6 | **Tu barrio en un mapa** | Negocios a menos de 1 km con su ícono o logo · estrellas y *"Recomendado por 24 vecinos de tu zona"* · filtros por categoría y tipo · WhatsApp con mensaje listo | Captura del mapa con el panel Filtrar + ficha de Panadería La Espiga de Oro | Recomendaciones de vecinos, no de desconocidos |
| 7 | **Publicar en 3 toques** | + → Ofrezco / Necesito / Recomiendo → escribir, foto o voz · la IA (Gemini) la clasifica sola · y si no sabes cómo, el asistente **"¿Cómo uso Ayni?"** te lo explica y te lleva | Tres capturas en fila: +, tipo, publicar; pequeña, el chat del asistente | 3 toques (y un ayudante con IA) |
| 8 | **Funciona sin internet** | Modo avión → publicas igual → *"Sin internet: guardado, se subirá solo"* · al volver la señal se sube una sola vez | Captura con el aviso amarillo "Sin internet" | Sin señal también funciona |
| 9 | **Modo Minka: emergencia** | 3 botones gigantes: Estoy bien / Necesito ayuda / Puedo ayudar · urgencia: Puede esperar · Hoy · ¡Ahora! · mapa de necesidades y recursos · resumen de zona escrito por IA | Captura de los 3 botones + boletín con el resumen | Toda la app cambia en un toque |
| 10 | **Match automático** | Pides agua → *"Juan P., a 2 cuadras, tiene agua"* · Coordinar por WhatsApp · se confirma en persona con un código de 4 dígitos | Captura de la tarjeta verde de match con el código | La app une al que necesita con el que puede |
| 11 | **Puntos que traen clientes** | Ayudar en Minka +20, opinar un negocio +2, ser recomendado +2 · se canjean en negocios del barrio (pan gratis, descuento) con código de 6 dígitos · antifraude: 20 → 10 → 0 por pareja, máx. 3 ayudas al día | Captura de Puntos (saldo + recompensas) + página de negocio con estrellas | El emprendimiento gana clientes sin pagar |
| 12 | **Para todos los vecinos** | Toda la app en **quechua** · letra grande, alto contraste y **modo para daltónicos** · fuente para baja visión, voz, botones grandes, asistente de ayuda | Captura de Minka en quechua + Ajustes con los interruptores | Inclusión de verdad |
| 13 | **Cómo está hecho · S/ 0** | App instalable (React + Vite) publicada en Vercel · Firebase con modo offline · Gemini, OpenStreetMap, Didit/RENIEC · todo en niveles gratuitos | Esquema de la sección 5 + tabla de costos | Costo S/ 0 |
| 14 | **Cómo crece Ayni** | Boletín conectado a El Comercio y a IGP / Senamhi / Indeci: la alerta oficial activa Minka sola · de un barrio al país sin reconfigurar (geohash) · confianza a escala: RENIEC activo, avales, moderadores · negocios y municipios como aliados (plan Destacado, tablero por distrito) | Tres columnas: vecinos · El Comercio · municipios, y una línea de tiempo corta (sección 8b) | Sostenible y escalable |
| 15 | **Equipo y demo en vivo** | Eduardo y Jessica: desarrollo y Modo Ayni · Bruce: Minka y datos · Iván: cuentas, demo y presentación · "Ahora, en vivo" | Fotos o nombres del equipo + faja; luego se pasa al celular | La app funciona de verdad |

**Consejos:**
- **Demo en vivo al final** (slide 15) con dos celulares, desde https://ayni-xpertimpact.vercel.app: publicar, modo avión y match en Minka (flujos B, C y E de la sección 6); si sobra tiempo, el asistente (H). Tener el **video de respaldo** listo por si falla la red.
- **No crear una cuenta nueva frente al jurado** esperando ver "Validado en RENIEC": saldrá "DNI en verificación con RENIEC" (ver 3.1). Entrar con las cuentas del equipo y, si preguntan, dar la respuesta de la sección 9.
- En las slides 6 a 12, una captura grande vale más que mucho texto: **máximo 3 puntos por slide**.
- Usar los colores y fuentes de la sección 10 para que las slides se vean igual que la app.

## 12. Fechas
- **Entrega:** domingo 8 nov (plazo original 17:00, ampliado por la organización).
- **Presentaciones:** 10–12 nov, 7 p.m.
- **Finalistas:** 13 nov.
- **Sustentación y premiación:** martes 17 nov, 6:00–8:30 p.m.
