// Traduccion de la interfaz: espanol (fuente, tal como esta en el codigo) -> quechua (Cusco-Collao, escritura trivocalica).
// Uso: const t = useT() (lib/estado) y luego t('Vecinos cerca de ti') o t('{n} publicaciones', { n: 3 }).
// Si una frase no esta en el diccionario, se muestra en espanol. Lo que escriben los vecinos nunca se traduce.
// OJO: traducciones hechas por el equipo tecnico; deben validarse con un hablante antes de la entrega (TEXTOS §10).
export const IDIOMAS = [['es', 'Español'], ['mixto', 'Español con frases en quechua'], ['qu', 'Quechua (Runasimi)']]

export const QU = {
  // Barra y navegacion
  'Ayni': 'Ayni', 'tu barrio se ayuda': 'llaqtayki yanapanakun', 'Modo Minka': 'Minka', 'emergencia en tu zona': 'hatun llaki llaqtaykipi',
  'Emergencia': 'Hatun llaki', 'Salir': 'Lluqsiy', 'En línea': 'Internetwan', 'Sin internet,': 'Mana internet,', 'se guarda local': 'kaypi waqaychakun',
  'Mapa': 'Mapa', 'Vecinos': 'Wasimasikuna', 'Puntos': 'Puntukuna', 'Ajustes y perfil': 'Allichaykuna, riqsichikuy', 'Secciones': 'T\'aqakuna',
  'Emergencia: entrar a Modo Minka': 'Hatun llaki: Minkaman yaykuy', 'Salir de Minka': 'Minkamanta lluqsiy',
  '¿Terminó la emergencia en tu zona?\n\nAceptar = Sí, volver al barrio. Cancelar = Seguir en Minka': 'Hatun llaki llaqtaykipi tukurqunñachu?\n\nAceptar = Arí, llaqtaman kutiy. Cancelar = Minkapi qipay',
  // Comunes
  'Atrás': 'Kutiy', 'Cancelar': 'Saqiy', 'Publicar': 'Willay', 'Siguiente': 'Qatiq', 'Empezar': 'Qallariy', 'Saltar': 'Pawariy', 'Tú': 'Qam',
  'WhatsApp': 'WhatsApp', 'Foto': 'Foto', 'Fotos': 'Fotokuna', 'Comentar': 'Rimay', 'Mapa (botón)': 'Mapa',
  'Buscando tu ubicación…': 'Maypi kasqaykita maskhachkani…', 'Cargando publicación…': 'Willakuyta apamuchkani…', 'Cargando perfil…': 'Riqsichikuyta apamuchkani…',
  'ahora': 'kunan', 'hace {n} min': '{n} min ñawpaq', 'hace {n} h': '{n} h ñawpaq', 'ayer': 'qayna', 'hace {n} días': '{n} p\'unchaw ñawpaq',
  'a {m} de ti': '{m} qammanta', 'A {m} de ti': '{m} qammanta', 'a {m}': '{m} karupi', 'A {m}': '{m} karupi', 'Atiende {h}': '{h} llamk\'an',
  'Ofrezco': 'Quni', 'Necesito': 'Munani', 'Recomiendo': 'Allinmi nini', 'Todo': 'Llapan', 'Negocios': 'Qhatukuna',
  'Recomendado por {n} vecinos de tu zona': '{n} wasimasikuna llaqtaykimanta allinmi ninku',
  // Mapa
  'Radio del barrio': 'Llaqtap muyuynin', '{n} negocios': '{n} qhatukuna', '{n} publicaciones': '{n} willakuykuna', '{n} publicación': '{n} willakuy',
  '{n} pendiente de subir': '{n} suyachkan', '{n} pendientes de subir': '{n} suyachkanku', 'Ubicación demo: Surquillo': 'Demo kiti: Surquillo',
  'Aún no hay publicaciones a {r} de ti. Sé el primero: toca Publicar.': 'Manaraq willakuykuna kanchu {r} qayllaykipi. Qam ñawpaq kay: Willay nisqata ñit\'iy.',
  '{n} publicaciones en esta zona': 'Kay kitipi {n} willakuykuna', 'Tú ({nombre})': 'Qam ({nombre})',
  // Vecinos
  'Vecinos cerca de ti': 'Wasimasikuna qayllaykipi', 'A {r} de tu casa': '{r} wasiykimanta', 'Filtrar': 'Akllay',
  'Aún no hay negocios recomendados a {r} de ti.': 'Manaraq allinmi nisqa qhatukuna kanchu {r} qayllaykipi.',
  'Perfil de {nombre}': '{nombre}pa riqsichikuynin',
  // Publicacion
  'Publicación': 'Willakuy', 'Esta publicación ya no está disponible.': 'Kay willakuy manañam kanchu.', 'Volver a Vecinos': 'Wasimasikunaman kutiy',
  'Ver en el mapa': 'Mapapi qhaway', 'Comentarios ({n})': 'Rimaykuna ({n})', 'Nadie ha comentado todavía. Sé el primero.': 'Manaraq pipas rimanchu. Qam ñawpaq kay.',
  'Escribe un comentario': 'Rimayniykita qillqay', 'Comentario publicado': 'Rimayniyki willasqa',
  'Sin señal: tu comentario se guardó y se enviará solo.': 'Mana señal: rimayniyki waqaychasqa, kikinmanta rinqa.',
  'No se pudo comentar. Intenta de nuevo.': 'Manam rimayta atikurqanchu. Huktawan ruway.', 'Foto de la publicación': 'Willakuypa foton',
  '{nombre} (tú)': '{nombre} (qam)', 'RENIEC': 'RENIEC',
  // Vecino (perfil)
  'Perfil de vecino': 'Wasimasip riqsichikuynin', 'Tu perfil público': 'Riqsichikuyniyki', 'Validado en RENIEC': 'RENIECpi chiqaqchasqa',
  'Vecino verificado': 'Chiqaq wasimasi', 'Vecino de la demo': 'Demo wasimasi', 'Sin recomendaciones': 'Mana allinmi niykuna', 'Sin recomendaciones aún': 'Manaraq allinmi niykuna kanchu',
  '{v} de 5, {n} recomendaciones': '{v} / 5, {n} allinmi niykuna', '{v} de 5, {n} recomendación': '{v} / 5, {n} allinmi niy',
  'publicación': 'willakuy', 'publicaciones': 'willakuykuna', 'recomendación': 'allinmi niy', 'recomendaciones': 'allinmi niykuna', 'puntos Ayni': 'Ayni puntukuna',
  'Lo que ofrece y pide': 'Imata qun, imata mañakun', 'Aún no tiene publicaciones.': 'Manaraq willakuyninkuna kanchu.',
  'Recomendaciones de vecinos': 'Wasimasikunap allinmi niyninkuna', '¿Conoces a {nombre}? Recomiéndalo': '{nombre}ta riqsinkichu? Allinmi niy',
  'Tu recomendación': 'Allinmi niyniyki', 'Estrellas': 'Ch\'askakuna', '{n} estrella': '{n} ch\'aska', '{n} estrellas': '{n} ch\'askakuna',
  'Cuenta cómo te fue (opcional)': 'Imaynam karqan, willay (munaspa)', 'Recomendar': 'Allinmi niy', 'Actualizar recomendación': 'Allinmi niyta musuqchay',
  'Tu recomendación le da +{p} puntos Ayni, una sola vez.': 'Allinmi niyniyki +{p} Ayni puntukunata qun, huk kutilla.',
  'Aún nadie lo recomendó.': 'Manaraq pipas allinmi ninchu.', 'Elige de 1 a 5 estrellas.': '1manta 5kama ch\'askakunata akllay.',
  'Recomendación actualizada.': 'Allinmi niy musuqchasqa.', 'Gracias. {nombre} recibió +{p} puntos Ayni por tu recomendación.': 'Sulpayki. {nombre} +{p} Ayni puntukunata chaskirqan allinmi niyniykirayku.',
  'No se pudo guardar. Intenta de nuevo.': 'Manam waqaychayta atikurqanchu. Huktawan ruway.',
  'Hola {nombre}, te vi en Ayni. ¿Podemos coordinar?': 'Napaykuyki {nombre}, Aynipi rikurqayki. Rimanakusunchu?',
  // Publicar
  '¿Qué quieres publicar?': 'Imatataq willayta munanki?', 'Tus vecinos de hasta 1 km lo verán en el mapa.': 'Wasimasiykikuna 1 km-kama mapapi qhawanqaku.',
  'un servicio o producto': 'huk llamk\'ay utaq ima', 'ayuda o algo del barrio': 'yanapay utaq llaqtamanta ima', 'un negocio u oficio': 'huk qhatu utaq llamk\'ay',
  'Paso {n} de 3': '{n} ñiqi ruway, 3manta', '¿Qué quieres decir?': 'Imatataq niyta munanki?', 'Hablar': 'Rimay', 'Escuchando…': 'Uyarichkani…',
  'Se publica con tu ubicación aproximada.': 'Maypi kasqaykiwan yaqalla willakun.', ' Estás sin internet: se guardará y subirá solo.': ' Mana internet kanchu: waqaychakunqa, kikinmanta rinqa.',
  'Publicando…': 'Willachkani…', 'Publicado en tu barrio': 'Llaqtaykipi willasqa', 'Foto que acompaña tu publicación': 'Willakuyniykip foton',
  'Señal débil: guardado, se subirá solo': 'Pisi señal: waqaychasqa, kikinmanta rinqa', 'Sin internet: guardado, se subirá solo': 'Mana internet: waqaychasqa, kikinmanta rinqa',
  'Guardado en cola, se subirá luego': 'Suyanapi waqaychasqa, qhipaman rinqa', 'Tu navegador no tiene dictado por voz; escribe el texto': 'Navegadorniyki mana kunkawan qillqayta atinchu; qillqay',
  'Ej: Arreglo lavadoras a domicilio, S/ 30 la visita': 'Ej: Lavadorakunata wasikunapi allichani, S/ 30 sapa kuti',
  'Ej: Necesito gasfitero para una fuga hoy': 'Ej: Gasfiterota munani kunan p\'unchaw unu sut\'uqpaq', 'Ej: La bodega de Doña Rosa fía y abre temprano': 'Ej: Doña Rosap bodegan manun, tutamanta kichan',
  // Minka
  'Estoy bien': 'Allinllam kani', 'Necesito ayuda': 'Yanapaway', 'Puedo ayudar': 'Yanapasqayki',
  '¿Qué necesitas?': 'Imatataq munanki?', '¿Con qué puedes ayudar?': 'Imawan yanapawaq?', '{tipo}: ¿qué tan urgente?': '{tipo}: hayk\'a usqhaylla?',
  'Puede esperar': 'Suyayta atin', 'Hoy': 'Kunan p\'unchaw', '¡Ahora!': 'Kunanpacha!',
  'AGUA': 'UNU', 'MEDICINA': 'HAMPI', 'ALBERGUE': 'QURPACHANA', 'RESCATE': 'QISPICHIY', 'COMIDA': 'MIKHUNA', 'OTRO': 'HUK',
  'ENFERMERA/O': 'HAMPIQ', 'BOTIQUÍN': 'HAMPI CH\'USPA', 'GENERADOR': 'GENERADOR', 'VEHÍCULO': 'AWTU', 'ESPACIO': 'KITI',
  'Hay un vecino para ti': 'Huk wasimasi qampaq kan', 'Coordinar por WhatsApp': 'WhatsAppwan rimanakuy',
  'No compartió su WhatsApp: búscalo en el mapa de su zona.': 'Manam WhatsAppninta rikuchirqanchu: kitinpa mapanpi maskhay.',
  'Ayuda confirmada': 'Yanapay chiqaqchasqa', '¿Te ayudaron?': 'Yanaparqasunkichu?', 'Pide a quien te ayudó su código de 4 dígitos.': 'Yanapaqniykita 4 yupayniyuq kodigonta mañay.',
  'Código': 'Kodigo', 'Código de 4 dígitos': '4 yupayniyuq kodigo', 'Confirmar ayuda': 'Yanapayta chiqaqchay',
  '{nombre} confirmó tu ayuda: +{p} puntos Ayni': '{nombre} yanapayniykita chiqaqcharqan: +{p} Ayni puntukuna',
  'Cuando ayudes, dale este código para confirmar:': 'Yanapaspayki, kay kodigota quy chiqaqchanapaq:',
  'Quitar de la lista': 'Listamanta hurquy', 'Cancelar pedido': 'Mañakuyta saqiy', 'Retirar ayuda': 'Yanapayta saqiy', 'Retirar': 'Saqiy',
  'Tus pedidos y ayudas': 'Mañakuyniykikuna, yanapayniykikuna', 'Aún sin vecino. Puedes cancelarlos cuando quieras.': 'Manaraq wasimasi kanchu. Munaspayki saqiyta atinki.',
  'Pediste {tipo}': '{tipo}ta mañakurqanki', 'Ofreces {tipo}': '{tipo}ta qunki', 'Disponible {hace}': 'Kan {hace}',
  'Cerca de ti ({r} km)': 'Qayllaykipi ({r} km)', '{n} necesidades abiertas': '{n} mañakuykuna kichasqa', '{n} recursos disponibles': '{n} yanapaykuna kan',
  'Necesitan ayuda': 'Yanapayta munanku', 'Pueden ayudar': 'Yanapayta atinku', 'Boletín Minka': 'Minka willakuy', 'Resumen de tu zona, {h}:': 'Llaqtaykimanta pisi willay, {h}:',
  'Resumido con IA a partir de los reportes vecinales': 'IAwan pisiyachisqa wasimasikunap willayninkunamanta', 'Resumen automático de los reportes vecinales': 'Kikinmanta pisiyachisqa wasimasikunap willayninkunamanta',
  'Sin avisos por ahora.': 'Kunanqa mana willakuykuna kanchu.',
  'Avisamos que estás bien': 'Allinlla kasqaykita willarqayku', 'Sin señal: tu aviso se guardó y se enviará solo.': 'Mana señal: willayniyki waqaychasqa, kikinmanta rinqa.',
  'Sin señal: tu pedido se guardó y se enviará solo.': 'Mana señal: mañakuyniyki waqaychasqa, kikinmanta rinqa.', 'Sin señal: tu ayuda se guardó y se enviará sola.': 'Mana señal: yanapayniyki waqaychasqa, kikinmanta rinqa.',
  'Pedido enviado a tus vecinos. Te avisamos cuando alguien pueda ayudar.': 'Mañakuyniyki wasimasiykikunaman rirqun. Pipas yanapayta atispa willasqayki.',
  'Gracias. Tu ayuda ya aparece en el mapa (+20 puntos al confirmar).': 'Sulpayki. Yanapayniyki mapapiña rikukun (+20 puntukuna chiqaqchaspa).',
  '¡Match! {nombre}, {dist}, tiene {tipo}.': 'Tarisqa! {nombre}, {dist}, {tipo}ta charin.', '¡Match! {nombre}, {dist}, necesita {tipo} ({urg}).': 'Tarisqa! {nombre}, {dist}, {tipo}ta munan ({urg}).',
  'Ese código no es. Pídeselo de nuevo a quien te ayudó.': 'Chay kodigo manam chaychu. Yanapaqniykita huktawan mañay.',
  'Tienen que estar juntos para confirmar (menos de 200 m).': 'Kuska kanaykichik chiqaqchanapaq (200 m-manta pisi).',
  'No se pudo enviar. Intenta de nuevo.': 'Manam apachiyta atikurqanchu. Huktawan ruway.', 'Pedido cancelado.': 'Mañakuy saqisqa.', 'Ayuda retirada.': 'Yanapay saqisqa.', 'Quitado de tu lista.': 'Listaykimanta hurqusqa.',
  '¿Cancelar tu pedido de {tipo}?': '{tipo} mañakuyniykita saqiyta munankichu?', '¿Retirar tu ayuda de {tipo}?': '{tipo} yanapayniykita saqiyta munankichu?',
  'Gracias. {nombre} recibió +{p} puntos Ayni.': 'Sulpayki. {nombre} +{p} Ayni puntukunata chaskirqan.',
  'Gracias. Ayuda confirmada. Esta vez no suma puntos: ya se ayudaron varias veces este mes.': 'Sulpayki. Yanapay chiqaqchasqa. Kay kutiqa mana puntukuna yapakunchu: kay killapi achka kutiña yanapanakurqankichik.',
  'Gracias. Ayuda confirmada. {nombre} ya llegó al máximo de puntos de hoy.': 'Sulpayki. Yanapay chiqaqchasqa. {nombre} kunan p\'unchawpa tukuy puntunkunamanña chayarqan.',
  '{nombre}, {dist}, tiene {tipo}. Toca para coordinar.': '{nombre}, {dist}, {tipo}ta charin. Rimanakunapaq ñit\'iy.',
  '{nombre}, {dist}, necesita {tipo}{urg}. Toca para coordinar.': '{nombre}, {dist}, {tipo}ta munan{urg}. Rimanakunapaq ñit\'iy.',
  'a menos de 1 cuadra': 'huk cuadramanta pisipi', 'a 1 cuadra': 'huk cuadrapi', 'a {n} cuadras': '{n} cuadrakunapi',
  // Puntos
  'Tus puntos Ayni': 'Ayni puntuykikuna', 'Ayuda confirmada +10': 'Yanapay chiqaqchasqa +10', 'Recomendación +2': 'Allinmi niy +2', 'Minka +20': 'Minka +20',
  'Tus códigos de canje': 'Chhalanapaq kodigoykikuna', '{t}, en {neg}': '{t}, {neg}pi', 'Vence el {f}': '{f} p\'unchawpi tukukun',
  'Canjea en negocios de tu barrio': 'Llaqtaykip qhatunkunapi chhalay', 'Aún no hay recompensas en tu barrio.': 'Manaraq llaqtaykipi chaninchaykuna kanchu.',
  '{n} puntos': '{n} puntukuna', 'quedan {n}': '{n} puchun', 'Canjear': 'Chhalay', 'Agotado': 'Tukukun',
  'Te faltan {n} puntos. Ayuda a un vecino para ganar más.': '{n} puntukuna pisisunki. Huk wasimasita yanapay aswan tarinaykipaq.',
  'Se agotó esta recompensa. Prueba otra.': 'Kay chaninchay tukukurqun. Hukta akllay.', 'Ya canjeaste aquí esta semana. Prueba otro negocio.': 'Kay semanapi kaypi chhalarqankiña. Huk qhatuta akllay.',
  'Tu código: {c}. Muéstralo en {neg}. Vence en 7 días.': 'Kodigoyki: {c}. {neg}pi rikuchiy. 7 p\'unchawpi tukukun.', 'No se pudo canjear. Intenta de nuevo.': 'Manam chhalayta atikurqanchu. Huktawan ruway.',
  // Ajustes
  'Ajustes': 'Allichaykuna', 'Wasimasi (vecino/a)': 'Wasimasi', 'Pendiente de verificación': 'Chiqaqchanapaq suyachkan',
  '(WhatsApp visible)': '(WhatsApp rikukun)', '(WhatsApp oculto)': '(WhatsApp pakasqa)', 'Avales: {n} de 2': 'Takyachiqkuna: {n} / 2', ', vecino verificado': ', chiqaq wasimasi', 'Puntos Ayni:': 'Ayni puntukuna:',
  'Accesibilidad e idioma': 'Yanapakuykuna, simi', 'Letra grande': 'Hatun qillqa', 'Toda la letra un 25 % más grande': 'Llapan qillqa 25 % aswan hatun',
  'Alto contraste': 'Aswan rikch\'aq llimp\'ikuna', 'Colores oscuros y bordes marcados': 'Yana llimp\'ikuna, sinchi patakuna',
  'Modo para daltónicos': 'Llimp\'ita mana allin rikuqkunapaq', 'Azul y naranja en vez de verde y rojo': 'Anqas, naranja llimp\'ikuna; mana q\'umir, pukachu',
  'Idioma': 'Simi', 'Español': 'Kastilla simi', 'Español con frases en quechua': 'Kastilla simi, runasimi rimaykunawan', 'Quechua (Runasimi)': 'Runasimi',
  'Las traducciones al quechua son del equipo y faltan validar con un hablante.': 'Runasimi tikraykunaqa equipomanta kanku; huk rimaqwan chiqaqchanaraq.',
  'Ubicación y cuenta': 'Kiti, cuenta', 'Usar mi ubicación real': 'Chiqaq kitiyta llamk\'achiy', 'Fijar ubicación en Surquillo (demo)': 'Surquillopi kitita churay (demo)',
  'Usando tu ubicación real': 'Chiqaq kitiykita llamk\'achispa', 'Ubicación fija en Surquillo': 'Kiti Surquillopi churasqa', 'Cerrar sesión': 'Lluqsiy',
  // Registro
  'Crea tu cuenta de vecino': 'Wasimasi cuentaykita kichay',
  'Con tu celular y tu DNI entras a tu barrio. Lo que necesitas está a 10 cuadras.': 'Celularniykiwan DNIykiwan llaqtaykiman yaykunki. Munasqayki 10 cuadrapi kachkan.',
  'Tu nombre': 'Sutiyki', 'Ej: Rosa Quispe': 'Ej: Rosa Quispe', 'Celular': 'Celular', '9 dígitos': '9 yupaykuna', 'DNI': 'DNI', '8 dígitos': '8 yupaykuna',
  'Autorizo validar mi DNI en RENIEC. Ayni guarda solo una huella (hash), nunca mi número de DNI.': 'DNIyta RENIECpi chiqaqchanankupaq saqini. Ayni huk unanchallata (hash) waqaychan, manam DNI yupayniytachu.',
  'Mostrar mi WhatsApp a los vecinos que quieran contactarme': 'WhatsAppniyta wasimasikunaman rikuchiy, rimapayawayta munaqkunaman',
  'Entrar a mi barrio': 'Llaqtayman yaykuy', 'Verificando…': 'Chiqaqchachkani…',
  '¿Ya tienes cuenta? Escribe el mismo celular y DNI y entras directo.': 'Cuentayki kanñachu? Kikin celularta DNItawan qillqay, chaylla yaykunki.',
  'Tu ubicación se guarda aproximada (~300 m). Nadie ve tu casa exacta.': 'Kitiyki yaqalla waqaychakun (~300 m). Manam pipas wasiykita chiqanta rikunchu.',
  'El DNI no coincide con RENIEC. Revísalo.': 'DNI manam RENIECwan tupanchu. Qhawapay.', 'No pudimos crear tu cuenta. Intenta de nuevo.': 'Manam cuentaykita kichayta atirqaykuchu. Huktawan ruway.',
  '¡Hola de nuevo, {nombre}! Entraste a tu cuenta': 'Huktawan napaykuyki, {nombre}! Cuentaykiman yaykurqunki',
  // Tutorial
  'Tu barrio en un mapa': 'Llaqtayki huk mapapi', 'Publica en 3 toques': '3 ñit\'iyllapi willay', 'Modo Minka en emergencias': 'Minka hatun llakikunapi',
  'Mira negocios, oficios y vecinos a menos de 1 km. Cada uno dice cuántos vecinos de tu zona lo recomiendan.': 'Qhatukunata, llamk\'aqkunata, wasimasikunata 1 km-manta pisipi qhaway. Sapankan willan hayk\'a wasimasikuna allinmi ninku.',
  'Toca Publicar, elige si Ofreces, Necesitas o Recomiendas, agrega foto o voz y listo. Funciona sin internet.': 'Willay nisqata ñit\'iy, akllay Quni, Munani utaq Allinmi nini, fotota utaq kunkaykita yapay, chaylla. Mana internetwanpas llamk\'an.',
  'Si hay un sismo o incendio, la app cambia a 3 botones: Estoy bien, Necesito ayuda, Puedo ayudar. Los vecinos se coordinan solos.': 'Pacha kuyuy utaq nina kaptin, app kimsa botonman tikrakun: Allinllam kani, Yanapaway, Yanapasqayki. Wasimasikuna paykunapura rimanakunku.',
  'Paso {n} de {t}': '{n} ñiqi, {t}manta',
}

/** Traduce `texto` al idioma dado y reemplaza {claves} con `vars`. En espanol solo reemplaza. */
export function traducir(idioma, texto, vars) {
  let s = idioma === 'qu' ? (QU[texto] ?? texto) : texto
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
  return s
}
