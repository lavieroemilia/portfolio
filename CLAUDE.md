# Portfolio de Emilia Laviero: contexto del proyecto

Sitio estático (HTML/CSS/JS plano, sin frameworks ni build step) que reemplaza el portfolio anterior hecho en Framer (emilialaviero.com). Emilia edita este sitio directamente, así que todo debe mantenerse simple: sin dependencias, sin bundlers, sin paso de compilación.

El sitio de Framer es la referencia de diseño: antes de construir o ajustar algo, medir el original (tamaños, espaciados, orden de contenido) y replicarlo.

## Estructura

```
index.html                  → Home
pages/dino.html             → Case study: Dino by Ucademy
pages/quota-pms.html        → Case study: Quota PMS
pages/feature-advisor.html  → Case study: Feature Advisor (Experiments)
pages/tenant-scoring.html   → Case study: Tenant Scoring
pages/attomo.html           → Case study: ATTOMO Digital
pages/wow.html              → Case study: WOW
pages/dino-design-system.html → Case study: Dino Design System (enlaza a la documentación en Vercel)
assets/css/style.css        → Hoja de estilos única para todo el sitio
assets/js/script.js         → JS único (menú mobile, año del footer, dropdown de contacto, copiar email)
assets/images/              → Todas las imágenes, ya optimizadas (JPEG, tamaños de display reales)
.claude/launch.json         → Servidor local para previsualizar (python http.server, puerto 8080). Ignorado en .gitignore.
```

## Design tokens (definidos en `:root` de style.css)

Colores y forma:
- `--bg: #f4f4f6`, `--text: #231b1b`, `--text-soft: rgba(35,27,27,0.65)`, `--border: rgba(35,27,27,0.15)`, `--white: #ffffff`
- `--lavender: #dbccff`, `--lime: #c5ff89` (sampled del Framer original)
- `--radius-lg: 30px`, `--radius-pill: 100px`
- `--font: 'Geist'` (Google Fonts). Todo el texto usa peso 500, como el original.

Espaciado:
- `--gutter: 30px`: margen lateral, separación entre columnas y entre bloques, y padding de las cajas. El contenido ocupa todo el ancho de la ventana (sin max-width).

Escala tipográfica (desktop y mobile medidos del original; mobile por defecto, tablet desde 641px, desktop desde 900px):

| Token | Desktop | Tablet | Mobile | Uso |
|---|---|---|---|---|
| `--fs-display` | 64/72 | 44/56 | 28/40 | H1 |
| `--fs-h2` | 44/60 | 34/46 | 23/31 | "For 5 years…", "Thank you", números de Outcomes |
| `--fs-h3` | 32/46 | 26/38 | 22/32 | Títulos de sección, intro, texto de cajas |
| `--fs-h4` | 26/36 | 22/32 | 20/30 | Títulos de tarjetas, fechas del timeline |
| `--fs-body-lg` | 22/32 | 18/28 | 16/26 | Texto de los case studies |
| `--fs-body` | 18/28 | 16/24 | 14/22 | Texto secundario, datos, descripciones |
| `--fs-label` | 18/30 | 16/26 | 14/22 | Etiquetas ("Background", "Hypothesis"), nav |
| `--fs-small` | 14/20 | 14/20 | 14/20 | Pills, tags, nombre de empresa |

- `--nav-h`: 64px desktop / 48px mobile (alto de las cápsulas del nav).

Breakpoints:
- Las pills del hero (`.pill-row`) reparten el espacio entre ellas según el ancho (`space-between`). Desde 1100px hacia abajo, donde no entran cómodas en una fila, van en filas parejas: 2 filas de 4 (con un salto de línea invisible, `.pill-row::after`), y 4 filas de 2 desde 640px hacia abajo. Cada pill conserva el ancho de su texto y cada fila va de borde a borde.
- **1100px o menos (tablet):** las cards de Work (`.project-grid`) y la sección personal (`.personal`) pasan a 2 columnas. El texto del recuadro lavanda (`.personal-blurb`) escala con la ventana: `clamp(20px, 3vw, 32px)`.
- **899px o menos:** nav con menú hamburguesa, case studies en una columna, tipografía tablet (mobile desde 640px hacia abajo).
- **760px o menos (mobile):** cards de Work en 1 columna; personal en 3 fotos + texto a todo el ancho (en `--fs-body-lg`).

## Plantillas

**Home:** las secciones de texto van dentro de cajas con fondo (lavender, lime o blanco). El timeline de experiencia usa la misma grilla de 3 columnas que las cards: fecha en la 1ª, descripción desde la 2ª. Las cards de proyectos muestran al hacer hover un degradado oscuro, el título del case study (el mismo H1 de su página, en `--fs-body`) en blanco y pills blancas con los servicios, alineados abajo. En pantallas táctiles (`hover: none`) se muestran siempre.

**Case studies** (seguir este orden en toda página nueva):
1. `.case-hero`: nombre de la empresa en chico (`.case-company`) + H1 con el título real. Sin "Case Study".
2. `.case-hero-img`: imagen principal a todo el ancho de la ventana, justo después del título. Exportarla a 2400px. Si es una captura chica, usar la variante `.band` (franja oscura con la captura centrada a su tamaño real).
3. `.case-intro`: intro a la izquierda, datos del proyecto a la derecha (Team/Role/Service/Date o lo que corresponda). Botón `.btn-primary` si hay link al producto.
4. `.case-section`: título de sección (`h2`) en la columna izquierda y contenido en `.case-body` a la derecha, proporción 2:5. Sin cajas de color. Bloques con subtítulo: `.block` + `.sub-label`. Imágenes de cada sección dentro de `.case-body` (`.case-figure` con `figcaption`, `.image-grid`, `.image-grid.mobile`). Imágenes grandes entre secciones: `.case-figure.full` (con bordes redondeados) o `.case-figure.bleed` (a todo el ancho de la ventana).
   - Columna izquierda con etiqueta + título (WOW, "Design solutions"): `.case-aside` con `.sub-label` + `h2`. Citas: `blockquote.case-quote` con `cite`.
   - Variante Problema/Solución (Tenant Scoring): en vez de `h2`, la columna izquierda lleva `.case-problem` (sub-label + texto) y la derecha `.case-body` con sub-label "Solution" + `p.solution` en tamaño h3. Pantallas mobile en `.image-grid.screens` (4 columnas, o `.three`), con `.grid-caption` como celda de texto dentro de la grilla.
5. `.related-section` ("More case studies"): carrusel con todos los proyectos del portfolio menos el actual (3 visibles en desktop, 2 en tablet, 1 en mobile), flechas ← → a la derecha del título y stepper de puntos debajo. Las tarjetas se generan desde la lista `PROJECTS` en `script.js` (única fuente de verdad: para agregar o editar un proyecto, cambiarlo ahí). En el HTML solo va `<section class="related-section" data-current="id-de-la-página">` con su header, `.related-track` y `.related-dots`. Deja 120px de aire antes del footer.

## Convenciones establecidas

- Sin frameworks, sin build step. HTML/CSS/JS a mano.
- Todas las imágenes se auto-hostean en `assets/images/`, optimizadas (JPEG con calidad ajustada). Los GIFs animados se convierten a WebP animado con Python/Pillow (pesan hasta 10 veces menos y se usan igual, con `<img>`). Capturas de página completa: `.image-grid.pages` (2 columnas, también en mobile).
- Contacto sin `mailto:`. En el nav, "Contact" (último item, después de About) abre un panel (`.contact-dropdown`) con el email y el ícono de copiar (`.copy-icon-btn`), que muestra un check por 3s; mientras está abierto, Contact lleva el punto activo. En mobile, "Contact" está en el menú hamburguesa y abre el mismo panel. En el footer, el email es texto con el mismo ícono de copiar. Los links del footer (LinkedIn, Medium, CV) van en 4 columnas, en negro, con flecha ↗ y subrayado en hover. Lógica en `script.js`.
- Nav: "Emilia Laviero" a la izquierda; a la derecha una cápsula con Work, Experiments, About y Contact. Texto siempre negro. La sección activa se marca con un punto negro debajo del link (`.is-active`); en hover aparece el punto en gris suave, y en "Emilia Laviero" en negro. Solo en el home se marca la sección activa, detectada con el scroll (la experiencia y las fotos cuentan como About); en los case studies no se marca ninguna. Nunca hay dos puntos a la vez: con Contact abierto se oculta el de la sección. Lógica en `script.js`.
- El menú mobile es un dropdown (`.nav-mobile-menu`) activado por un botón hamburguesa (`.nav-toggle`), visible bajo 900px.
- Attomo no enlaza a la web actual de ATTOMO (cambiaron el diseño).
- Dino Design System tiene su propio case study (`pages/dino-design-system.html`); desde ahí el botón "View the documentation site" lleva a `https://dino-design-system-v2.vercel.app/`.
- El sitio viejo tiene errores de links que ya están corregidos acá: la card de Quota en Dino apuntaba a `./attomo`, el video de RIFF tenía un ID de YouTube inválido (el correcto es `vDRZuveIakg`). Revisar links al migrar cada página.

## Workflow de trabajo con Emilia

- Se construye página por página, no todo de una vez.
- Actuar como diseñador web experto Y como reclutador revisando el portfolio: señalar oportunidades de mejora a medida que aparecen (no es un clon pixel-perfect ciego del sitio viejo, tampoco un rediseño completo).
- Preguntar ante ambigüedad antes de asumir.
- Antes de dar por terminada una página: QA visual (screenshots en desktop y mobile) y mostrarle el resultado antes de pasar a la siguiente.
- Preferencias personales de Emilia: llamarla "Ema", escribir en español, sin guiones largos ("—"), sin la estructura "no X, sino Y", sin sobre-explicar trabajo ya terminado.

## Pendiente

1. Conectar el sitio terminado al dominio de Emilia (Google Domains).
