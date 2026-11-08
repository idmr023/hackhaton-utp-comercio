# Paleta de colores de Ayni

*Definida por el equipo el sáb 7 nov 2026. Es la base del sistema visual v3 "tejido verde" de `src/index.css`. Los nombres de las variables CSS van entre paréntesis.*

## Idea que comunica

Ayni representa reciprocidad: hoy por ti, mañana por mí. La identidad visual debe sentirse cercana, confiable y conectada con el barrio. Por eso, la base combina verdes andinos (comunidad, confianza y ayuda mutua) con neutros cálidos que resultan acogedores. El maíz y la terracota aportan energía y calidez sin competir con el contenido.

El rojo queda reservado para las alertas y situaciones de emergencia del Modo Minka.

## Colores principales

| Rol | HEX | Uso sugerido |
|---|---|---|
| Verde andino (`--verde`) | `#2F6B4F` | Identidad principal de Ayni, acciones cotidianas y navegación activa. |
| Verde profundo (`--verde-prof`) | `#24543E` | Estados activos oscuros, títulos y texto sobre fondos verdes claros. |
| Verde suave (`--verde-suave`) | `#E6F0E9` | Fondos de etiquetas, fichas y estados relacionados con ayuda. |
| Teal comunitario (`--teal`) | `#2F7C78` | Color complementario para información, ubicación y elementos secundarios. |
| Marfil cálido (`--marfil`) | `#F7F5EF` | Fondo general de la aplicación. |
| Superficie clara (`--superficie`) | `#FFFEFA` | Tarjetas, campos y superficies elevadas. |
| Texto principal (`--tinta`) | `#26332C` | Títulos y texto de lectura. |
| Texto secundario (`--gris`) | `#637168` | Descripciones, metadatos y texto de apoyo. |
| Borde suave (`--borde`) | `#E4E8E1` | Divisores, bordes y controles inactivos. |
| Maíz (`--maiz`) | `#E6B84A` | Llamados de atención positivos, puntos y acciones destacadas. |
| Terracota (`--terracota`) | `#C66A4A` | Acentos cálidos, "Necesito" y detalles de identidad. |

## Colores de estado

| Estado | Color | HEX | Uso sugerido |
|---|---|---|---|
| Emergencia Minka | Rojo alerta (`--rojo`) | `#B33A3A` | Necesidades urgentes, alertas y acciones críticas. No usar como color cotidiano de Ayni. |
| Fondo de emergencia | Rojo suave (`--rojo-suave`) | `#FBECEA` | Avisos y contenedores asociados a una emergencia. |
| Ayuda disponible | Verde ayuda (`--verde`) | `#2F6B4F` | Recursos disponibles, confirmaciones y matches de ayuda. |
| Pendiente | Maíz oscuro (`--maiz-osc`) | `#765811` | Estados pendientes; debe acompañarse de texto o ícono, no solo color. |

## Colores para categorías

Las categorías deben distinguirse también por su etiqueta, texto o ícono: el color no debe ser la única señal.

| Categoría | Fondo | Acento | Ícono (Lucide) |
|---|---|---|---|
| Ofrezco | `#E6F0E9` | `#2F6B4F` | mano que ofrece |
| Necesito | `#F8E7DD` | `#C66A4A` (texto: `#8E4530`) | megáfono |
| Recomiendo | `#FBF1D5` | `#765811` | estrella |

## Contraste verificado (WCAG AA, texto normal ≥ 4,5:1)

| Par | Ratio | Resultado |
|---|---|---|
| Blanco sobre verde andino | 6,3 | pasa |
| Blanco sobre verde profundo | 8,7 | pasa |
| Blanco sobre rojo Minka | 5,9 | pasa |
| Blanco sobre teal | 4,9 | pasa |
| Blanco sobre terracota `#C66A4A` | 3,8 | **no pasa**: para texto o botones usar terracota oscura `#8E4530` (6,9) |
| Tinta sobre maíz | 7,1 | pasa (por eso el botón Publicar lleva texto oscuro) |
| Gris sobre marfil | 4,7 | pasa |
| Maíz sobre verde profundo | 4,7 | pasa (número de Puntos; sobre verde andino solo 3,4) |
| Maíz oscuro sobre maíz suave | 5,9 | pasa |
| Terracota oscura sobre terracota suave | 5,7 | pasa |

## Criterios de uso

- Usar el verde andino como identidad de Ayni; mantener el rojo para urgencias de Minka.
- Preferir texto oscuro sobre fondos claros y texto blanco únicamente sobre tonos suficientemente oscuros.
- Reservar el maíz para acentos; no usarlo como fondo de texto pequeño sin comprobar contraste.
- Mantener etiquetas y controles distinguibles mediante texto, forma o íconos además del color.
- En alto contraste, priorizar fondos simples, texto oscuro y bordes definidos.
