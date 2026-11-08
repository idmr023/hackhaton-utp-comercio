# Ayni – Textos de pantallas (guía de P2)
*Versión 3 · sáb 7 nov (rediseño "tejido verde": sin emojis, íconos Lucide, etiquetas visibles en los campos). Regla de voz: hablamos como vecino, no como app. Tú (no usted). Frases cortas. Verbos en los botones. Nada de "usuario", "sistema", "transacción".*

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

## 2. Entrar / Crear cuenta
- Dos pestañas arriba de la tarjeta: **Entrar** (ícono entrar) y **Crear cuenta** (ícono persona+). Si el celular ya entró antes en este dispositivo se abre en Entrar con el celular puesto; si no, en Crear cuenta. Título de la portada: **Entra a tu barrio** / **Crea tu cuenta de vecino**.
- **Entrar**: campos **Celular** y **PIN** *(4 a 6 números, para entrar después)* con botón de ojo para ver/ocultar · botón **Entrar** (cargando: *Entrando…*) · botón secundario **¿Olvidaste tu PIN? Crea uno nuevo con tu DNI** (pasa a Crear cuenta)
  - Errores: *No hay ninguna cuenta con ese celular. Crea una.* · *El PIN no coincide. Si lo olvidaste, crea uno nuevo con tu DNI en "Crear cuenta".* · *Esta cuenta aún no tiene PIN. Toca "Crear cuenta", escribe tu mismo celular y DNI y elige tu PIN.* · *No pudimos entrar. Revisa tu internet e intenta de nuevo.*
  - Aviso al entrar: *¡Hola de nuevo, {nombre}!*
- **Crear cuenta**: lo de abajo más el campo **PIN**. Si el celular + DNI ya tienen cuenta, la recupera y guarda el PIN nuevo (así se recupera un PIN olvidado): aviso *¡Hola de nuevo, {nombre}! Tu PIN quedó guardado.* · nota bajo el botón: *¿Ya tienes cuenta? Con el mismo celular y DNI la recuperas y eliges un PIN nuevo.*
- Seguridad (para el jurado): el PIN se guarda como huella con el DNI de sal, en la colección `accesos`; con las reglas abiertas de la demo un atacante podría leer las huellas, la protección real llega con Firebase Auth (mejora futura).

### 2a. Campos de Crear cuenta
- Portada (verde profundo, faja arriba): marca **Ayni** / *tu barrio se ayuda* · título **Crea tu cuenta de vecino** · subtítulo *Con tu celular y tu DNI entras a tu barrio. Lo que necesitas está a unas cuadras.*
- Título: **Crea tu cuenta de vecino**
- Campos con etiqueta visible y ejemplo: **Tu nombre** (`Ej: Rosa Quispe`) · **Celular** (`9 dígitos`) · **DNI** (`8 dígitos`)
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
- Estado en Ajustes: chip **Validado en RENIEC** / chip amarillo **Pendiente de verificación**

## 3. Barra superior
- Marca a la izquierda: logo (casa verde con sonrisa en un círculo maíz) + **Ayni** / *tu barrio se ayuda* · en emergencia: el mismo logo + **Modo Minka** / *emergencia en tu zona* (se recorta con … si no hay espacio)
- Conexión: con internet no se muestra nada (dom 16:10 se quitó el punto maíz de "En línea") · sin internet: píldora amarilla con ícono en dos líneas `Sin internet,` / `se guarda local`
- Botón derecha (blanco, letra roja, ícono de sirena): **Emergencia** (en barrio) / **Salir** (en Minka, ícono de salida). Es el **interruptor del Modo Minka**, no una sección. En el barrio lleva una **burbuja roja con la cantidad de necesidades abiertas de Minka a 3 km** (la misma cifra que *N necesidades abiertas* de Minka; se actualiza cada minuto; lector de pantalla: *Emergencia: entrar a Modo Minka. 2 necesidades abiertas*). Sin internet en un celular angosto queda solo el ícono y la burbuja pasa a la esquina.
- **Avatar** (círculo maíz con iniciales, a la derecha del todo): abre **Ajustes** (aria: *Ajustes y perfil*).
- Secciones (3 pestañas): **Mapa · Vecinos · Puntos**. En celular van abajo; en PC van dentro de la barra, al centro. En Minka la navegación se oculta: quedan solo **Salir** y el avatar.

## 4. Mapa (Modo Barrio)
- Etiqueta radio: `Radio` + botones `500 m · 1 km · 2 km · 5 km`
- Debajo, **buscador** (`Buscar negocio o publicación`, busca sin tildes en nombre, rubro, descripción, texto, categoría y autor) con botón de filtros (ícono de controles). El botón abre el **panel Filtrar** (tarjeta vertical, con X para cerrar): segmentos `Todo · Negocios · Publicaciones` (volver a tocar el activo regresa a Todo; al pasar a uno se borran los filtros del otro lado) · **Tipo de publicación** (en Todo y Publicaciones; dom 16:10): `Ofrezco · Necesito · Recomiendo` con su cantidad y el ícono del color de cada tipo, y en Publicaciones además `Todas las publicaciones` arriba; en Todo, elegir solo un tipo oculta los negocios (y elegir solo una categoría oculta las publicaciones); con un tipo y una categoría a la vez se ven las dos cosas, cada una filtrada · **Categorías de negocio**: solo las que tienen negocios en el radio, con la cantidad a la derecha (`Comida · Salud · Hogar y oficios · Belleza · Tiendas`; si no hay: *Ningún negocio a 1 km de ti.*) · `Con opiniones` con su cantidad (negocios con estrellas de vecinos) · **Borrar filtros**. Con **Publicaciones** elegido, el panel lista las publicaciones (*Publicaciones, de la más cercana a la más lejana*) agrupadas por zona como los pines del mapa: cabecera *A 150 m de ti* con la cantidad si son varias, y debajo cada publicación (ícono del tipo, texto, *autor · tipo*); tocar una centra el mapa, abre su popup desplazado hasta esa publicación y la resalta unos segundos (en celular además cierra el panel). En PC el panel Filtrar está abierto desde el inicio (sin X; el botón de filtros lo pliega). Vacío: *Ninguna publicación a 1 km de ti.* Todo es interruptor: tocar de nuevo lo quita. Elegir una categoría o "Con opiniones" oculta las publicaciones (son filtros de negocios). Con el panel cerrado y algún filtro activo aparece el chip rojo **Borrar filtros** junto a los contadores. Vacío con filtro: *Nada coincide con «pollería» a 1 km de ti.* / *Nada con esos filtros a 1 km de ti.*
- Cargando: *Buscando tu ubicación…*
- Sin permiso de ubicación: *Sin tu ubicación no podemos mostrar tu barrio. Actívala en el candado de la barra del navegador.*
- Chip pendientes: `2 publicaciones pendientes de subir`
- Vacío (tarjeta flotante abajo del mapa): *Aún no hay publicaciones a {radio} de ti. Sé el primero: toca Publicar.*
- Publicaciones de la misma zona (~300 m) = un solo ícono con contador rojo. Popup: **{n} publicaciones en esta zona** + lista (la más reciente arriba); si es tuya dice `Tú` en vez del nombre.
- Popup de negocio:
  - Nombre, rubro
  - **Recomendado por 12 vecinos de tu zona** (con estrella)
  - Resumen IA entre comillas: *"Rápido, cobra justo y atiende domingos."*
  - Distancia y horario: `A 350 m de ti` y `Atiende 7am-10pm` (en publicaciones: `Eduardo Brito, a 151 m`) · flotando sobre el mapa, etiquetas `15 negocios` (tienda) y `11 publicaciones` (megáfono)
  - Botones: **WhatsApp** (ícono de mensaje) · **Recomendar** (solo vecinos verificados; si no: *Necesitas 2 avales de vecinos para recomendar*)
- Popup de publicación: chips `Necesito` (terracota) `Oficios` · texto · `Lucía P., a 200 m`
- Botón flotante maíz: **Publicar** (con el signo +)

## 4b. Vecinos (dos pestañas: Vecinos y Negocios)
- Título: **Vecinos cerca de ti** o **Negocios cerca de ti** · subtítulo: *A 1 km de tu casa, 11 publicaciones* (o *…, 15 negocios*) · botón **Publicar**
- Pestañas (segmentos): **Vecinos** (ícono personas) · **Negocios** (ícono tienda)
- En Vecinos, filtros (píldoras): `Todo · Ofrezco · Necesito · Recomiendo` (lo de persona a persona)
- En Negocios, categorías: `Todo · Comida · Salud · Hogar y oficios · Belleza · Tiendas` (se deducen del rubro) · vacío: *Aún no hay negocios de esta categoría a 1 km de ti.*
- Cada publicación (la más reciente arriba): chips `Ofrezco` `Oficios` · hace cuánto: `ahora` / `hace 4 min` / `hace 4 h` / `ayer` / `hace 3 días` · texto · **foto** si la subió · `Eduardo Brito, a 151 m` (o `Tú`) · botón **WhatsApp** (si no es tuya y el autor lo mostró)
- Cada negocio (los más recomendados arriba): nombre, rubro, estrellas `4.9 (42)` = las de ejemplo de la semilla (los N vecinos de *N vecinos lo recomiendan*, promedio ficticio por negocio en lib/negocios.js) + las opiniones reales, que suben la cantidad y mueven el promedio; *Sin estrellas aún* solo si no tiene ninguna, *12 vecinos lo recomiendan* (los de la semilla más las recomendaciones reales), foto si la puso el dueño, descripción o resumen entre comillas, `A 350 m` y horario, botones **Mapa** · **Opinar** · **WhatsApp**. Tocar el item abre la página del negocio (§4e).
- Vacío: *Aún no hay publicaciones a 1 km de ti. Sé el primero: toca Publicar.* · con filtro Negocios: *Aún no hay negocios recomendados a 1 km de ti.*
- Cada item muestra el avatar (iniciales) y el nombre del autor (tocarlos abre su perfil), y abajo los botones **Mapa** (centra y abre el popup en el Mapa), **Comentar** y **WhatsApp**. Tocar el resto del item abre el **detalle de la publicación**. En PC la lista es un feed centrado de tarjetas; el Mapa ocupa toda la pantalla.

## 4c. Detalle de publicación (`/publicacion/{id}`)
- Cabecera: flecha Atrás + ficha del tipo + título **Ofrezco** / **Necesito** / **Recomiendo**
- Autor (tocar abre su perfil): avatar, nombre (`Carlos M.`, o `Carlos M. (tú)`), chip `RENIEC` si está validado, `hace 6 h, a 151 m de ti`, estrellas con `4.8 (12)` o *Sin recomendaciones*
- Chips `Ofrezco` `Oficios` · texto grande · foto grande si la subió
- Botones: **WhatsApp** (si no es tuya y el autor lo mostró) · **Ver en el mapa**
- **Comentarios (n)** · vacío: *Nadie ha comentado todavía. Sé el primero.* · cada comentario: avatar, nombre (`Tú` si es tuyo), `hace 5 min`, texto · campo `Escribe un comentario` (máx. 300) + botón **Comentar**
- Avisos: *Comentario publicado* · *Sin señal: tu comentario se guardó y se enviará solo.* · *No se pudo comentar. Intenta de nuevo.*
- No existe: *Esta publicación ya no está disponible.* + botón **Volver a Vecinos**
- Si la publicación es tuya, abajo: botón **Quitar publicación** (confirmación: *¿Quitar tu publicación? Dejará de verse en el barrio.* → aviso *Publicación quitada.*). No se borra: pasa a estado "retirada" y desaparece del mapa, de Vecinos y de tu perfil; si alguien abre el enlace ve *Esta publicación ya no está disponible.*

## 4e. Página de negocio (`/negocio/{id}`)
- Título: **Negocio del barrio** · ficha con ícono del rubro, nombre, chips `Tu negocio` (si es mío) · rubro · categoría, estrellas (*Sin estrellas aún*), *Recomendado por 18 vecinos de tu zona*, foto, descripción o resumen, `A 134 m de ti`, `Atiende 7am-12am` · botones **WhatsApp** · **Ver en el mapa** · si es mío: **Editar mi negocio** y **Quitar del mapa**
- **Opiniones de vecinos**: tarjeta **¿Conoces este negocio? Recomiéndalo** (o **Tu recomendación**) con 5 estrellas, `Cuenta cómo te fue (opcional)`, botón **Recomendar** / **Actualizar recomendación** · nota: *Recomendar te da +2 puntos Ayni, una sola vez por negocio.* (el dueño no puede recomendar su propio negocio) · lista de opiniones con estrellas · vacío: *Aún nadie opinó sobre este negocio.* · aviso: *Gracias. Ganaste +2 puntos Ayni por recomendar a {negocio}.*
- **Comentarios (n)**: igual que en una publicación.
- No existe: *Este negocio ya no está disponible.* + **Volver a Vecinos**

## 4d. Perfil de vecino (`/vecino/{id}`)
- Título: **Perfil de vecino** (o **Tu perfil público** si eres tú)
- Tarjeta: avatar grande, nombre, chips **Validado en RENIEC** / **Vecino verificado** / `Vecino de la demo` (si no tiene cuenta en `usuarios`), estrellas `4.8 (12)` · tres cifras: `3 publicaciones` · `12 recomendaciones` · `40 puntos Ayni` · botón **WhatsApp** si lo mostró
- **Fotos**: galería con las fotos de sus publicaciones (tocar abre la publicación)
- **Lo que ofrece y pide**: sus publicaciones (`Ofrezco, Oficios, hace 6 h`) · vacío: *Aún no tiene publicaciones.*
- **Recomendaciones de vecinos**: tarjeta **¿Conoces a Carlos? Recomiéndalo** (o **Tu recomendación** si ya lo hiciste) con 5 estrellas para tocar, campo `Cuenta cómo te fue (opcional)` y botón **Recomendar** / **Actualizar recomendación** · nota: *Tu recomendación le da +2 puntos Ayni, una sola vez.* · lista: avatar, nombre, estrellas, `hace 2 días`, texto · vacío: *Aún nadie lo recomendó.*
- Avisos: *Elige de 1 a 5 estrellas.* · *Gracias. Carlos recibió +2 puntos Ayni por tu recomendación.* · *Recomendación actualizada.* · *No se pudo guardar. Intenta de nuevo.*

## 5. Publicar (3 toques)
**Toque 2 – elegir tipo.** Arriba, barra de 3 pasos (1 hecho, 2 actual). Título: **¿Qué quieres publicar?** · *Tus vecinos de hasta 1 km lo verán en el mapa.*
| Botón | Subtítulo |
|---|---|
| **Ofrezco** (mano que ofrece, verde) | un servicio o producto |
| **Necesito** (megáfono, terracota) | ayuda o algo del barrio |
| **Recomiendo** (estrella, maíz) | un negocio u oficio |
| **Mi negocio** (tienda, teal) | pon tu negocio u oficio en el mapa (o *editar o registrar otro* si ya tiene) |
Secundario: **Cancelar**

**Mis negocios (toque 3, si ya tengo alguno).** Título **Mis negocios** · *Toca uno para editarlo o registra otro* · lista de mis negocios (logo o tienda, nombre, rubro, *· Quitado del mapa* si está oculto) · botón **Registrar otro negocio**. Se puede tener varios negocios por cuenta.
**Formulario del negocio (toque 3).** Título **Nuevo negocio** / **Editar negocio** · subtítulo *Aparecerá en el mapa y en Negocios* / *Edita los datos y guarda* · campos: **Nombre del negocio u oficio** (`Ej: Bodega Don Lucho`) · **Rubro** (lista: Abarrotes / Bodega, Panadería / Pastelería, Restaurante / Menú, Pollería, Frutas y Verduras, Salud / Farmacia, Veterinaria / Mascotas, Ferretería, Gasfitería / Electricidad, Técnico / Reparaciones, Costura / Enmiendas, Lavandería, Mecánica / Llantas, Reparación de Calzado, Peluquería / Barbería, Bazar / Regalos, Otro → **¿Cuál?**) · **Horario** (`Ej: 8am-8pm, lunes a sábado`) · **WhatsApp del negocio** (viene con el del vecino) · **¿Qué ofreces? (corto)** (máx. 160) · **Logo del negocio** / **Cambiar logo** (cuadrado; nota: *Cuadrado. Se ve en el mapa y en la lista en vez del ícono del rubro.*) · botón **Foto del local** / **Cambiar foto del local** · **Ubicación del local**: mapa con un pin arrastrable (*Arrastra el pin o toca el mapa hasta el punto exacto. Los negocios se muestran con su ubicación real.*) + botón **Usar mi ubicación actual**; a diferencia de las publicaciones, el negocio se guarda con su ubicación **exacta** (es un lugar público) · botones **Quitar logo** y **Quitar foto del local** cuando las hay · botón **Poner mi negocio en el mapa** / **Guardar cambios** (cargando: *Guardando…*) · si ya está en el mapa, botón rojo **Quitar mi negocio del mapa** (confirmación: *¿Quitar tu negocio del mapa? Podrás volver a ponerlo cuando quieras.* → aviso *Negocio quitado del mapa.*; no se borra: estado "retirado", desaparece de mapa y lista, y volver a guardar lo reactiva; su página muestra el chip `Quitado del mapa` al dueño) · avisos: *Tu negocio ya está en el mapa del barrio.* · *Negocio actualizado.* · *Sin señal: tu negocio se guardó y se subirá solo.* Un negocio por cuenta.
Dos botones rojos al final (si ya tengo negocio): **Quitar mi negocio del mapa** (solo si está visible; estado `retirado`, los datos se guardan y el botón principal pasa a *Poner mi negocio en el mapa*) y **Eliminar mi negocio** (estado `eliminado`, datos y fotos en blanco; no se puede deshacer; *Registrar mi negocio* empieza de cero). Nota: *Quitar del mapa lo oculta y guarda tus datos para volver a ponerlo. Eliminar lo borra para siempre.* Confirmación: *¿Eliminar tu negocio por completo? Se borran sus datos y fotos y no volverá a aparecer. No se puede deshacer.* Aviso: *Negocio eliminado.* En Ajustes el negocio quitado se muestra con el chip **Quitado del mapa** y los mismos botones (**Quitar del mapa** / **Eliminar mi negocio**); en la página del negocio el dueño tiene **Editar mi negocio** · **Quitar del mapa** · **Eliminar**.

**Toque 3 – contenido.** Flecha Atrás + ficha del tipo. Etiqueta del campo: **¿Qué quieres decir?** Placeholder según tipo:
- Ofrezco: *Ej: Arreglo lavadoras a domicilio, S/ 30 la visita*
- Necesito: *Ej: Necesito gasfitero para una fuga hoy*
- Recomiendo: *Ej: La bodega de Doña Rosa fía y abre temprano*
Botones: **Hablar** (micrófono; escuchando: *Escuchando…*) · **Foto** (cámara) · **Publicar** (cargando: *Publicando…*)
Nota (ícono de ubicación): *Se publica con tu ubicación aproximada.* Si está offline, se agrega: *Estás sin internet: se guardará y subirá solo.*
Sin dictado disponible: *Tu navegador no tiene dictado por voz; escribe el texto.* Si el navegador tiene la API pero falla (en PC solo Chrome y Edge dictan; Opera, Brave y Firefox no): *El dictado no funciona en este navegador; en PC usa Chrome o Edge, o escribe el texto.* Otros avisos: *Permite el micrófono en el navegador para dictar* · *No se escuchó nada; intenta otra vez cerca del micrófono* · *No se encontró micrófono*.

**Avisos (toast, 4 s):**
- Online: *Publicado en tu barrio*
- Offline: *Sin internet: guardado, se subirá solo*
- Señal débil (hay red pero no responde en 6 s): *Señal débil: guardado, se subirá solo*
- Al reconectar: *Se subieron 2 publicaciones pendientes*

## 6. Modo Minka
- Botones gigantes con ícono a la izquierda: **ESTOY BIEN** (check, teal) · **NECESITO AYUDA** (sirena, rojo) · **PUEDO AYUDAR** (manos, verde)
- Tras "Estoy bien": *Avisamos que estás bien*
- Pantalla necesito: título **¿Qué necesitas?** · opciones: `AGUA · MEDICINA · ALBERGUE · RESCATE · COMIDA · OTRO` · urgencia: `Puede esperar · Hoy · ¡Ahora!`
- Tras pedir: *Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.*
- Pantalla puedo: título **¿Con qué puedes ayudar?** · opciones: `ENFERMERA/O · BOTIQUÍN · AGUA · COMIDA · GENERADOR · VEHÍCULO · ESPACIO`
- Tras ofrecer: *Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).*
- Pantalla urgencia (tras elegir qué necesita): ficha con el ícono + título **AGUA: ¿qué tan urgente?** · botones grandes `Puede esperar · Hoy · ¡Ahora!`
- Sin señal (se guarda en el celular y se envía solo): *Sin señal: tu pedido se guardó y se enviará solo.* · *Sin señal: tu ayuda se guardó y se enviará sola.* · *Sin señal: tu aviso se guardó y se enviará solo.*
- Error al enviar: *No se pudo enviar. Intenta de nuevo.*
- Mapa Minka: una pastilla por zona (~300 m): roja (sirena) `n` = necesidades, verde (manos) `n` = recursos. Popup: **Necesitan ayuda** (AGUA, ¡Ahora!: María G.) / **Pueden ayudar** (BOTIQUÍN: Luis R.) · `a 150 m`
- Match automático (al pedir: recurso disponible más cercano que sirva; al ofrecer: necesidad abierta más urgente y luego más cercana). Qué sirve: agua→agua · comida→comida · medicina→botiquín/enfermera · albergue→espacio · rescate→vehículo/enfermera · otro→cualquiera.
- Aviso al hacer match: *¡Match! Juan P., a 2 cuadras, tiene agua.* / *¡Match! María G., a 1 cuadra, necesita agua (¡Ahora!).*
- Tarjeta verde arriba de los botones (la ven los dos, al entrar a Minka; máx. 3), título **Hay un vecino para ti**: *Lucía, a 2 cuadras, tiene botiquín. Toca para coordinar.* / *María G., a 1 cuadra, necesita agua (¡Ahora!). Toca para coordinar.* → botón **Coordinar por WhatsApp** · sin WhatsApp: *No compartió su WhatsApp: búscalo en el mapa de su zona.*
- Distancias: `a menos de 1 cuadra` · `a 1 cuadra` · `a N cuadras` (1 cuadra ≈ 100 m)
- Tarjeta cerca: título **Cerca de ti (3 km)** · etiquetas `3 necesidades abiertas` (roja) y `5 recursos disponibles` (verde)
- Boletín: título **Boletín Minka** (ícono de periódico) · vacío: *Sin avisos por ahora.*
- Parte de zona (arriba del boletín): **Resumen de tu zona, 7:05 p. m.:** {texto} · debajo: `Resumido con IA a partir de los reportes vecinales` (con chispas) (Gemini, máx. 35 palabras, sin inventar) o `Resumen automático de los reportes vecinales` (respaldo local: *4 pedidos de ayuda abiertos (2 de agua, 1 de medicina, 1 de albergue), 2 urgentes. 4 vecinos ofrecen ayuda (botiquín, agua, enfermera/o, vehículo). 2 ayudas ya coordinadas.*) · vacío: *Sin pedidos de ayuda abiertos.*
- Tarjeta **Tus pedidos y ayudas** (solo si tienes algo sin vecino): *Aún sin vecino. Puedes cancelarlos cuando quieras.* · fila `Pediste agua` / `¡Ahora!, hace 10 min` + botón **Cancelar** · fila `Ofreces botiquín` / `Disponible hace 1 h` + botón **Retirar**
- En la tarjeta verde de match, abajo: sin confirmar → **Cancelar pedido** / **Retirar ayuda** (confirmación del navegador: *¿Cancelar tu pedido de agua?* / *¿Retirar tu ayuda de botiquín?*; el otro vecino vuelve a quedar disponible/abierto) · ya confirmada → **Quitar de la lista** (solo deja de verse; los puntos ya entregados no cambian)
- Avisos: *Pedido cancelado.* · *Ayuda retirada.* · *Quitado de tu lista.*
- Salir de Minka (confirmación del navegador): *¿Terminó la emergencia en tu zona?* → Aceptar = **Sí, volver al barrio.** Cancelar = **Seguir en Minka**

## 7. Puntos Ayni
- Encabezado: `Tus puntos Ayni` · número grande · *Ayuda confirmada +10 · Recomendación +2 · Minka +20*
- Sección: **Canjea en negocios de tu barrio**
- Tarjeta: título de la recompensa · `Panadería San Martín · 10 puntos · quedan 20` · botón **Canjear**
- Faltan puntos: *Te faltan 6 puntos. Ayuda a un vecino para ganar más.*
- Canje hecho: *Tu código: **482 913**. Muéstralo en Panadería San Martín. Vence en 7 días.*
- Límite: *Ya canjeaste aquí esta semana. Prueba otro negocio.*
- Confirmar ayuda (dentro de la tarjeta verde de match en Minka): quien recibió ve **¿Te ayudaron?** *Pide a quien te ayudó su código de 4 dígitos.* · campo `Código` · botón **Confirmar ayuda** · éxito: *Gracias. Carlos recibió +20 puntos Ayni.* · lejos: *Tienen que estar juntos para confirmar (menos de 200 m).* · código mal: *Ese código no es. Pídeselo de nuevo a quien te ayudó.* · ya confirmada: `Ayuda confirmada` (con check verde)
- Quien ayudó ve: *Cuando ayudes, dale este código para confirmar:* **6197** → luego `Jessica confirmó tu ayuda: +20 puntos Ayni`
- Antifraude (misma pareja en el mes 100% / 50% / 0; máx. 3 ayudas y 30 puntos por día): *Gracias. Ayuda confirmada. Esta vez no suma puntos: ya se ayudaron varias veces este mes.* · *Gracias. Ayuda confirmada. Carlos ya llegó al máximo de puntos de hoy.*
- Agotado: botón `Agotado` · *Se agotó esta recompensa. Prueba otra.* · error: *No se pudo canjear. Intenta de nuevo.* · vacío: *Aún no hay recompensas en tu barrio.*
- Tarjeta verde **Tus códigos de canje** (ícono de ticket) (últimos 3): **482 913** · `1 pan francés gratis con tu compra, en Panadería La Espiga de Oro` · `Vence el 14 nov`

## 8. Ajustes (se abre desde el avatar de la barra; `/perfil` redirige aquí)
- Título: **Ajustes** · tarjeta de tu cuenta (avatar con foto o iniciales, nombre, chip de verificación; botones **Poner foto de perfil** / **Cambiar foto** y **Quitar foto**, avisos *Foto actualizada.* / *Foto quitada.*; la foto se recorta cuadrada y se ve en la barra, en Vecinos, comentarios y perfiles; texto *Celular para entrar: 9xxxxxxxx* con botón **Cambiar** (abre: **Celular nuevo para entrar** + **Tu PIN actual (para confirmar)** + nota *Tu WhatsApp no cambia; si también es nuevo, cámbialo abajo.* + **Guardar celular** / **Cancelar**; avisos *Celular actualizado. Desde ahora entras con 9xxxxxxxx.* · *El PIN no coincide.* · *Ese celular ya es de otra cuenta.* · *Ese ya es tu celular para entrar.* · *Tu cuenta aún no tiene PIN...*; se guarda en accesos.telefono y el celular anterior deja de servir para entrar), avales, puntos; formulario **Mi WhatsApp** (campo de 9 dígitos que empieza con 9 + casilla *Mostrar mi WhatsApp a los vecinos que quieran contactarme* + nota *Se cambia también en lo que ya publicaste.* + botón **Guardar WhatsApp**, apagado si no hay cambios; aviso *WhatsApp actualizado.* o *El WhatsApp debe tener 9 dígitos y empezar con 9.*; se guarda en perfiles y actualiza autorWhatsapp de mis publicaciones; el celular de registro sigue siendo el de entrar) · sección **Mi negocio** (*¿Tienes un negocio u oficio? Ponlo en el mapa para que tus vecinos lo encuentren.* + botón **Registrar mi negocio**; si ya tiene: un bloque por negocio con nombre o logo, rubro, chip *Quitado del mapa* si corresponde y botones **Editar**, **Ver página**, **Quitar del mapa**, **Eliminar**; abajo **Registrar otro negocio**) · secciones **Accesibilidad e idioma** y **Ubicación y cuenta**. En PC, cuenta y negocio a la izquierda y secciones a la derecha.
- Chips: **Validado en RENIEC** (con check) / **Pendiente de verificación** · `Avales: 1 de 2` · `, vecino verificado`
- WhatsApp: `(WhatsApp visible)` / `(WhatsApp oculto)` · interruptor: *Mostrar mi WhatsApp*
- Botón en perfil de otro vecino: **Lo conozco (avalar)** · éxito: *Avalaste a Lucía. Le falta 1 aval más.*
- Reportar publicación: **Reportar** → *¿Qué pasa con esta publicación?* `Es falsa · Es ofensiva · No es de este barrio` → *Gracias. Con 3 reportes se oculta.*
- Ubicación de demo: botón **Fijar ubicación en Surquillo (demo)** / **Usar mi ubicación real** (ícono de mira) · aviso: *Ubicación fija en Surquillo* / *Usando tu ubicación real* · chip en el mapa: `Ubicación demo: Surquillo` · también con `?demo=1` / `?demo=0` en la URL
- **Cerrar sesión** (botón con borde, letra roja)

## 9. WhatsApp (mensaje precargado)
- Negocio: *Hola, te vi en Ayni como {rubro}. ¿Estás disponible?*
- Publicación (botón WhatsApp en el popup del mapa; solo si el autor aceptó mostrar su WhatsApp y no es tuya; texto corto = 40 caracteres):
  - Ofrezco: *Hola {nombre}, vi en Ayni que ofreces "{texto corto}". ¿Podemos coordinar?*
  - Necesito: *Hola {nombre}, vi en Ayni que necesitas "{texto corto}". ¿Te puedo ayudar?*
  - Recomiendo: *Hola {nombre}, vi tu recomendación en Ayni: "{texto corto}". ¿Me cuentas más?*
- Minka (quien pidió): *Hola {nombre}, soy {yo} de Ayni. Necesito {tipo} y estás a {distancia}. ¿Puedes ayudar?*
- Minka (quien ofrece): *Hola {nombre}, soy {yo} de Ayni. Vi que necesitas {tipo} y estoy a {distancia}. ¿Te ayudo?*
- Aviso bajo el botón (una vez): *Queda en un lugar público. Ayni no interviene en pagos.*

## 10. Accesibilidad e idioma
- Ajustes → tarjeta **Accesibilidad e idioma** con 3 interruptores (ícono + línea de ayuda): **Letra grande** (*Toda la letra un 25 % más grande*) · **Alto contraste** (*Colores oscuros y bordes marcados*) · **Modo para daltónicos** (*Azul y naranja en vez de verde y rojo*: el verde de Ayni pasa a azul, el rojo de Minka a bermellón, el teal de "Estoy bien" a índigo y la terracota de "Necesito" a magenta; los íconos ya son la segunda señal).
- Tarjeta **Idioma** con 3 opciones apiladas: **Español** · **Español con frases en quechua** (*Minka: Allinllachu? Yanapaway!*) · **Quechua (Runasimi)** (*Llapan runasimipi*). Debajo, si no es español: *Las traducciones al quechua son del equipo y faltan validar con un hablante.* Se recuerdan en el celular.
- **Quechua completo:** toda la interfaz se traduce con el diccionario de `src/lib/i18n.js` (barra, pestañas, Mapa, Vecinos, detalle, perfil, Publicar, Minka, Puntos, Ajustes, Registro, Tutorial y los avisos). Lo que escriben los vecinos (publicaciones, comentarios, avisos del boletín, categorías de la IA) queda como está. En Minka los 3 botones van en quechua con el español como subtítulo (*Allinllam kani / Estoy bien*, *Yanapaway / Necesito ayuda*, *Yanapasqayki / Puedo ayudar*). Ejemplos: Vecinos → *Wasimasikuna*, Puntos → *Puntukuna*, Emergencia → *Hatun llaki*, Salir → *Lluqsiy*, Publicar → *Willay*, Ofrezco / Necesito / Recomiendo → *Quni / Munani / Allinmi nini*, Negocios → *Qhatukuna*, Comentar → *Rimay*, Ajustes → *Allichaykuna*, AGUA / MEDICINA / COMIDA → *UNU / HAMPI / MIKHUNA*.

### 10a. Frases en quechua (modo "Español con frases en quechua")
- Con este modo el español se mantiene y se agregan frases en quechua (antes era el interruptor "Frases en quechua"; la preferencia vieja se migra sola).
- Con quechua activado (subtítulo en cursiva bajo el español): botones de Minka *Allinllachu?* / *Yanapaway!* / *Yanapasqayki* · agradecimientos de Minka empiezan *Sulpayki, gracias…* · en Ajustes bajo el nombre *Wasimasi (vecino/a)*
- Idioma completo en quechua: ver arriba (§10). Este modo mixto solo agrega estas frases:

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
- Lema corto: *Lo que necesitas está a unas cuadras.*
- Lema emergencia: *Cuando tiembla, el primero que llega es tu vecino.*
