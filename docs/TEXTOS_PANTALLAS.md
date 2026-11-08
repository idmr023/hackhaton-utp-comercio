# Ayni – Textos de pantallas (guía de P2)
*Versión 1 · vie 6 nov. Regla de voz: hablamos como vecino, no como app. Tú (no usted). Frases cortas. Verbos en los botones. Nada de "usuario", "sistema", "transacción".*

## Principios
1. **Botones con verbo:** "Publicar", "Entrar a mi barrio", "Canjear". Nunca "OK" ni "Aceptar".
2. **Máximo 2 líneas** en cualquier aviso. Si no cabe, se corta.
3. **Primero qué pasó, luego qué hacer:** "Sin internet. Se guardó y se subirá solo."
4. **Siempre decir dónde:** "en tu barrio", "a 2 cuadras", "de tu zona". Es el diferenciador.
5. **En emergencia, menos palabras y más grandes.** Mayúsculas solo en los 3 botones Minka.
6. **Sin tecnicismos:** no "geolocalización", "sincronizar", "verificación RENIEC vía API". Sí: "tu ubicación", "se subirá solo", "validar tu DNI".

---

## 1. Tutorial (3 pantallas, solo la primera vez)
| # | Título | Texto | Botón |
|---|---|---|---|
| 1 | Tu barrio en un mapa | Mira negocios, oficios y vecinos a menos de 1 km. Cada uno dice cuántos vecinos de tu zona lo recomiendan. | Siguiente |
| 2 | Publica en 3 toques | Toca el **+**, elige si Ofreces, Necesitas o Recomiendas, agrega foto o voz y listo. Funciona sin internet. | Siguiente |
| 3 | Modo Minka en emergencias | Si hay un sismo o incendio, la app cambia a 3 botones: Estoy bien, Necesito ayuda, Puedo ayudar. Los vecinos se coordinan solos. | Empezar |
Enlace secundario en las 3: **Saltar**.

## 2. Registro
- Portada: logo 🤝 · título **Crea tu cuenta de vecino** · subtítulo *Ayni, tu barrio se ayuda* (faja tejida arriba)
- Título: **Crea tu cuenta de vecino**
- Campos (placeholder): `Tu nombre` · `Celular (9 dígitos)` · `DNI (8 dígitos)`
- Casilla 1: *Autorizo validar mi DNI en RENIEC. Ayni guarda solo una huella (hash), nunca mi número de DNI.*
- Casilla 2: *Mostrar mi WhatsApp a los vecinos que quieran contactarme*
- Botón: **Entrar a mi barrio** · mientras carga: **Verificando…**
- Nota al pie: *Tu ubicación se guarda aproximada (~300 m). Nadie ve tu casa exacta.*
- Errores:
  - DNI no coincide: *El DNI no coincide con RENIEC. Revísalo.*
  - Error inesperado al crear la cuenta: *No pudimos crear tu cuenta. Intenta de nuevo.*
- Ya tiene cuenta (mismo celular + DNI): ayuda bajo el botón *¿Ya tienes cuenta? Escribe el mismo celular y DNI y entras directo.* · aviso al entrar: *¡Hola de nuevo, {nombre}! Entraste a tu cuenta*
  - Celular inválido: *El celular debe tener 9 dígitos y empezar con 9.*
  - Ya existe: *Ya hay una cuenta con ese DNI. ¿Es tuya? Entra con tu celular.*
  - Sin internet / Didit caído (no es error, es aviso): *No pudimos validar tu DNI ahora. Puedes entrar; lo validamos cuando vuelva la señal.*
- Estado en perfil: chip **Validado en RENIEC** / chip amarillo **Pendiente de verificación**

## 3. Barra superior
- Marca a la izquierda: logo 🤝 + **Ayni** / *tu barrio se ayuda* · en emergencia: logo 🆘 + **Modo Minka** / *emergencia en tu zona* (se recorta con … si no hay espacio)
- Conexión: con internet solo un punto verde (el texto `En línea` queda para lector de pantalla) · sin internet: píldora amarilla en dos líneas `Sin internet` / `se guarda local`
- Botón derecha (blanco, letra roja): **🆘 Emergencia** (en barrio) / **Salir** (en Minka)

## 4. Mapa (Modo Barrio)
- Etiqueta radio: `Radio` + botones `500 m · 1 km · 2 km · 5 km`
- Cargando: *Buscando tu ubicación…*
- Sin permiso de ubicación: *Sin tu ubicación no podemos mostrar tu barrio. Actívala en el candado de la barra del navegador.*
- Chip pendientes: `2 publicaciones pendientes de subir`
- Vacío: *Aún no hay publicaciones a {radio} de ti. Sé el primero: toca el +.*
- Publicaciones de la misma zona (~300 m) = un solo ícono con contador rojo. Popup: **{n} publicaciones en esta zona** + lista (la más reciente arriba); si es tuya dice `Tú` en vez del nombre.
- Popup de negocio:
  - Nombre, rubro
  - **⭐ Recomendado por 12 vecinos de tu zona**
  - Resumen IA entre comillas: *"Rápido, cobra justo y atiende domingos."*
  - Distancia y horario: `A 350 m de ti, atiende 7am-10pm` (en publicaciones: `Eduardo Brito, a 151 m`) · arriba del mapa, etiquetas `🏪 15 negocios` y `📝 11 publicaciones`
  - Botones: **💬 WhatsApp** · **⭐ Recomendar** (solo vecinos verificados; si no: *Necesitas 2 avales de vecinos para recomendar*)
- Popup de publicación: chips `NECESITO` `Oficios` · texto · `Lucía P. · a 200 m`
- Botón flotante: **+** (aria: "Publicar")

## 5. Publicar (3 toques)
**Toque 2 – elegir tipo.** Título: **¿Qué quieres publicar?**
| Botón | Subtítulo |
|---|---|
| 🛠️ **Ofrezco** | un servicio o producto |
| 🙋 **Necesito** | ayuda o algo del barrio |
| ⭐ **Recomiendo** | un negocio u oficio |
Secundario: **Cancelar**

**Toque 3 – contenido.** Placeholder según tipo:
- Ofrezco: *Ej: Arreglo lavadoras a domicilio, S/ 30 la visita*
- Necesito: *Ej: Necesito gasfitero para una fuga hoy*
- Recomiendo: *Ej: La bodega de Doña Rosa fía y abre temprano*
Botones: **🎙️ Hablar** (escuchando: *🎙️ Escuchando…*) · **📷 Foto** · **Publicar** (cargando: *Publicando…*) · **Atrás**
Nota: *📍 Se publica con tu ubicación aproximada.* Si está offline, se agrega: *Estás sin internet: se guardará y subirá solo.*
Sin dictado disponible: *Tu navegador no tiene dictado por voz; escribe el texto.*

**Avisos (toast, 4 s):**
- Online: *Publicado en tu barrio ✔*
- Offline: *Sin internet: guardado, se subirá solo*
- Señal débil (hay red pero no responde en 6 s): *Señal débil: guardado, se subirá solo*
- Al reconectar: *Se subieron 2 publicaciones pendientes*

## 6. Modo Minka
- Botones gigantes: **✅ ESTOY BIEN** · **🆘 NECESITO AYUDA** · **🤝 PUEDO AYUDAR**
- Tras "Estoy bien": *Avisamos que estás bien ✔*
- Pantalla necesito: título **¿Qué necesitas?** · opciones: `AGUA · MEDICINA · ALBERGUE · RESCATE · COMIDA · OTRO` · urgencia: `Puede esperar · Hoy · ¡Ahora!`
- Tras pedir: *Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.*
- Pantalla puedo: título **¿Con qué puedes ayudar?** · opciones: `ENFERMERA/O · BOTIQUÍN · AGUA · COMIDA · GENERADOR · VEHÍCULO · ESPACIO`
- Tras ofrecer: *Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).*
- Pantalla urgencia (tras elegir qué necesita): título **💧 AGUA: ¿qué tan urgente?** · botones grandes `Puede esperar · Hoy · ¡Ahora!`
- Sin señal (se guarda en el celular y se envía solo): *Sin señal: tu pedido se guardó y se enviará solo.* · *Sin señal: tu ayuda se guardó y se enviará sola.* · *Sin señal: tu aviso se guardó y se enviará solo.*
- Error al enviar: *No se pudo enviar. Intenta de nuevo.*
- Mapa Minka: una pastilla por zona (~300 m): roja `🆘 n` = necesidades, verde `🤝 n` = recursos. Popup: **Necesitan ayuda** (💧 AGUA · ¡Ahora! — María G.) / **Pueden ayudar** (🩹 BOTIQUÍN — Luis R.) · `a 150 m`
- Match automático (al pedir: recurso disponible más cercano que sirva; al ofrecer: necesidad abierta más urgente y luego más cercana). Qué sirve: agua→agua · comida→comida · medicina→botiquín/enfermera · albergue→espacio · rescate→vehículo/enfermera · otro→cualquiera.
- Aviso al hacer match: *¡Match! Juan P., a 2 cuadras, tiene agua.* / *¡Match! María G., a 1 cuadra, necesita agua (¡Ahora!).*
- Tarjeta verde arriba de los botones (la ven los dos, al entrar a Minka; máx. 3): *Lucía, a 2 cuadras, tiene botiquín. Toca para coordinar.* / *María G., a 1 cuadra, necesita agua (¡Ahora!). Toca para coordinar.* → botón **💬 Coordinar por WhatsApp** · sin WhatsApp: *No compartió su WhatsApp: búscalo en el mapa de su zona.*
- Distancias: `a menos de 1 cuadra` · `a 1 cuadra` · `a N cuadras` (1 cuadra ≈ 100 m)
- Tarjeta cerca: título **Cerca de ti (3 km)** · etiquetas `🆘 3 necesidades abiertas` (roja) y `🤝 5 recursos disponibles` (verde)
- Boletín: título **📰 Boletín Minka** · vacío: *Sin avisos por ahora.*
- Parte de zona (arriba del boletín): **Resumen de tu zona, 7:05 p. m.:** {texto} · debajo: `✨ Resumido con IA a partir de los reportes vecinales` (Gemini, máx. 35 palabras, sin inventar) o `Resumen automático de los reportes vecinales` (respaldo local: *4 pedidos de ayuda abiertos (2 de agua, 1 de medicina, 1 de albergue), 2 urgentes. 4 vecinos ofrecen ayuda (botiquín, agua, enfermera/o, vehículo). 2 ayudas ya coordinadas.*) · vacío: *Sin pedidos de ayuda abiertos.*
- Salir de Minka (confirmación del navegador): *¿Terminó la emergencia en tu zona?* → Aceptar = **Sí, volver al barrio** / Cancelar = **Seguir en Minka**

## 7. Puntos Ayni
- Encabezado: `Tus puntos Ayni` · número grande · *Ayuda confirmada +10 · Recomendación +2 · Minka +20*
- Sección: **Canjea en negocios de tu barrio**
- Tarjeta: título de la recompensa · `Panadería San Martín · 10 puntos · quedan 20` · botón **Canjear**
- Faltan puntos: *Te faltan 6 puntos. Ayuda a un vecino para ganar más.*
- Canje hecho: *Tu código: **482 913**. Muéstralo en Panadería San Martín. Vence en 7 días.*
- Límite: *Ya canjeaste aquí esta semana. Prueba otro negocio.*
- Confirmar ayuda (dentro de la tarjeta verde de match en Minka): quien recibió ve **¿Te ayudaron?** *Pide a quien te ayudó su código de 4 dígitos.* · campo `Código` · botón **Confirmar ayuda** · éxito: *Gracias. Carlos recibió +20 puntos Ayni.* · lejos: *Tienen que estar juntos para confirmar (menos de 200 m).* · código mal: *Ese código no es. Pídeselo de nuevo a quien te ayudó.* · ya confirmada: `✔ Ayuda confirmada`
- Quien ayudó ve: *Cuando ayudes, dale este código para confirmar:* **6197** → luego `✔ Jessica confirmó tu ayuda: +20 puntos Ayni`
- Antifraude (misma pareja en el mes 100% / 50% / 0; máx. 3 ayudas y 30 puntos por día): *Gracias. Ayuda confirmada. Esta vez no suma puntos: ya se ayudaron varias veces este mes.* · *Gracias. Ayuda confirmada. Carlos ya llegó al máximo de puntos de hoy.*
- Agotado: botón `Agotado` · *Se agotó esta recompensa. Prueba otra.* · error: *No se pudo canjear. Intenta de nuevo.* · vacío: *Aún no hay recompensas en tu barrio.*
- Tarjeta verde **🎟️ Tus códigos de canje** (últimos 3): **482 913** · `1 pan francés gratis con tu compra, en Panadería La Espiga de Oro` · `Vence el 14 nov`

## 8. Perfil
- Chips: **Validado en RENIEC** / **Pendiente de verificación** · `Avales: 1 / 2` · **Vecino verificado ✔**
- WhatsApp: `(WhatsApp visible)` / `(WhatsApp oculto)` · interruptor: *Mostrar mi WhatsApp*
- Botón en perfil de otro vecino: **🤝 Lo conozco (avalar)** · éxito: *Avalaste a Lucía. Le falta 1 aval más.*
- Reportar publicación: **Reportar** → *¿Qué pasa con esta publicación?* `Es falsa · Es ofensiva · No es de este barrio` → *Gracias. Con 3 reportes se oculta.*
- Ubicación de demo: botón **📍 Fijar ubicación en Surquillo (demo)** / **📍 Usar mi ubicación real** · aviso: *Ubicación fija en Surquillo* / *Usando tu ubicación real* · chip en el mapa: `📍 Ubicación demo: Surquillo` · también con `?demo=1` / `?demo=0` en la URL
- **Cerrar sesión**

## 9. WhatsApp (mensaje precargado)
- Negocio: *Hola, te vi en Ayni como {rubro}. ¿Estás disponible?*
- Publicación (botón 💬 WhatsApp en el popup del mapa; solo si el autor aceptó mostrar su WhatsApp y no es tuya; texto corto = 40 caracteres):
  - Ofrezco: *Hola {nombre}, vi en Ayni que ofreces "{texto corto}". ¿Podemos coordinar?*
  - Necesito: *Hola {nombre}, vi en Ayni que necesitas "{texto corto}". ¿Te puedo ayudar?*
  - Recomiendo: *Hola {nombre}, vi tu recomendación en Ayni: "{texto corto}". ¿Me cuentas más?*
- Minka (quien pidió): *Hola {nombre}, soy {yo} de Ayni. Necesito {tipo} y estás a {distancia}. ¿Puedes ayudar?*
- Minka (quien ofrece): *Hola {nombre}, soy {yo} de Ayni. Vi que necesitas {tipo} y estoy a {distancia}. ¿Te ayudo?*
- Aviso bajo el botón (una vez): *Queda en un lugar público. Ayni no interviene en pagos.*

## 10. Accesibilidad y quechua
- Perfil → tarjeta **Accesibilidad e idioma** con 3 interruptores: **🔠 Letra grande** (toda la letra +25 %) · **🌓 Alto contraste** (colores oscuros, bordes negros) · **🗣️ Frases en quechua**. Se recuerdan en el celular.
- Con quechua activado (subtítulo en cursiva bajo el español): botones de Minka *Allinllachu?* / *Yanapaway!* / *Yanapasqayki* · agradecimientos de Minka empiezan *Sulpayki, gracias…* · en Perfil bajo el nombre *Wasimasi (vecino/a)*
- Idioma: **Español / Quechua** (en la demo, 5 frases; el resto queda en español)

| Español | Quechua (Cusco-Collao) | Dónde |
|---|---|---|
| Ayni = reciprocidad, hoy por ti mañana por mí | Ayni | nombre de la app |
| Minka = trabajo colectivo por la comunidad | Minka | modo emergencia |
| ¿Estás bien? | Allinllachu? | botón "Estoy bien" |
| ¡Ayúdame! | Yanapaway! | botón "Necesito ayuda" |
| Te ayudo | Yanapasqayki | botón "Puedo ayudar" |
| Gracias | Sulpayki | confirmaciones |
| Vecino / vecina | Wasimasi | textos |

> P3 valida estas frases con un hablante antes del domingo (hay variantes por región). Si hay duda, se dejan solo Ayni, Minka y Sulpayki.

## 11. Mensajes de error generales
- Sin internet al cargar: *Estás sin internet. Te mostramos lo último que vimos de tu barrio.*
- Falla rara: *Algo salió mal. Intenta de nuevo.* (nunca mostrar el error técnico)
- Sesión perdida: *Vuelve a entrar con tu celular.*

## 12. Nombre y lema (para slides y tienda)
- **Ayni – tu barrio se ayuda**
- Lema corto: *Lo que necesitas está a 10 cuadras.*
- Lema emergencia: *Cuando tiembla, el primero que llega es tu vecino.*
