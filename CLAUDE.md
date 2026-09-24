# Portfolio de Emilia Laviero — contexto del proyecto

Sitio estático (HTML/CSS/JS plano, sin frameworks ni build step) que reemplaza el portfolio anterior hecho en Framer (emilialaviero.com). Emilia edita este sitio directamente, así que todo debe mantenerse simple: sin dependencias, sin bundlers, sin paso de compilación.

## Estructura

```
index.html              → Home
pages/dino.html          → Case study: Dino by Ucademy
pages/quota-pms.html     → Case study: Quota PMS (pendiente)
pages/tenant-scoring.html→ Case study: Tenant Scoring (pendiente)
pages/attomo.html        → Case study: Attomo (pendiente)
pages/wow.html           → Case study: WOW (pendiente)
assets/css/style.css     → Hoja de estilos única para todo el sitio
assets/js/script.js      → JS único para todo el sitio (menú mobile, año del footer, dropdown de contacto, copiar email)
assets/images/           → Todas las imágenes, ya optimizadas (JPEG, tamaños de display reales)
```

## Design tokens (definidos en `:root` de style.css)

- `--bg: #f4f4f6`
- `--text: #231b1b`
- `--text-soft: rgba(35,27,27,0.65)`
- `--border: rgba(35,27,27,0.15)`
- `--white: #ffffff`
- `--lavender: #dbccff` (sampled del Framer original de Emilia)
- `--lime: #c5ff89` (sampled del Framer original de Emilia, también usado en el nav-cta)
- `--radius-lg: 30px`
- `--radius-pill: 100px`
- `--max-width: 1365px`
- `--gutter: 30px`
- `--font: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` (Google Fonts: Geist)

Las secciones de texto van siempre dentro de "cajas" con fondo de color (lavender o lime), nunca sueltas sobre el fondo `--bg`. Este patrón viene de su diseño original en Framer y debe respetarse en toda página nueva.

## Convenciones establecidas

- Sin frameworks, sin build step. HTML/CSS/JS a mano.
- Todas las imágenes se auto-hostean en `assets/images/`, optimizadas (JPEG con calidad ajustada, GIFs comprimidos con gifsicle si son animados).
- El botón de contacto (ícono de flecha en el nav) NO usa `mailto:`. Es un botón que despliega un menú (`.contact-dropdown`) con el email y un botón "Copiar" que copia al portapapeles y muestra "¡Copiado!" por 2s. El mismo patrón de copiar se aplica al link de Email en el footer. Lógica en `script.js`, estilos en `style.css` (`.nav-contact`, `.contact-dropdown`, `.copy-email-btn`).
- El menú mobile es un dropdown (`.nav-mobile-menu`) activado por un botón hamburguesa (`.nav-toggle`), visible bajo 900px.
- La card "Dino Design System" en el home linkea externamente a `https://dino-design-system-v2.vercel.app/` (target="_blank"), no a una página interna, porque ese design system vive en otro proyecto.
- El bug del sitio viejo donde la card de "Quota" en "More case studies" de la página de Dino apuntaba mal a `./attomo` en vez de `./quota-pms` ya está corregido en la nueva versión. Vale la pena revisar si el mismo error existe en otras páginas al migrarlas.

## Workflow de trabajo con Emilia

- Se construye página por página, no todo de una vez.
- Actuar como diseñador web experto Y como reclutador revisando el portfolio: señalar oportunidades de mejora a medida que aparecen (no es un clon pixel-perfect ciego del sitio viejo, tampoco un rediseño completo).
- Preguntar ante ambigüedad antes de asumir.
- Antes de dar por terminada una página: QA visual (screenshots) y mostrarle el resultado antes de pasar a la siguiente.
- Preferencias personales de Emilia: llamarla "Ema", escribir en español, sin guiones largos ("—"), sin la estructura "no X, sino Y", sin sobre-explicar trabajo ya terminado.

## Pendiente

1. Construir página de Quota PMS.
2. Construir página de Tenant Scoring.
3. Construir página de Attomo.
4. Construir página de WOW.
5. Conectar el sitio terminado al dominio de Emilia (Google Domains).
