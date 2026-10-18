# Portfolio de Emilia Laviero: el sitio publicado (V4)

Este repo es lo que sirve **emilialaviero.com** (GitHub Pages, rama `main`, dominio en `CNAME`). Es un sitio estático, en HTML, CSS y JS escritos a mano, sin frameworks ni paso de compilación.

**No se edita acá.** El sitio se genera desde el laboratorio de V4, en el repo `portfolio-v2` (rama `v4-lab`, carpeta `v4-lab/`), con `tools/publish-v4.py`. Cada publicación borra y vuelve a escribir todo, salvo `.git`, `.gitignore`, `.nojekyll`, `.claude`, `CNAME` y este archivo, así que cualquier cambio hecho directamente acá se pierde.

Las decisiones de diseño y el historial de rondas están en `portfolio-v2/DESIGN-V4.md`. Leelo antes de proponer cambios.

## Estructura publicada

```
index.html                    → Home (en v4-lab: home-study.html)
about.html                    → About
pages/student-dashboard.html  → Student dashboard (en v4-lab: case-study.html)
pages/dino.html               → Gamified learning app (Dino)
pages/practice.html           → Tests and practice (Ucademy)
pages/quota-pms.html          → Property management platform (Quota)
pages/attomo.html, wow.html…  → Páginas de V1 sin versión V4: redirigen a Work
assets/css/case-study.css     → Estilos compartidos de los case studies
assets/js/                    → ribbon.js (la cinta), choreo.js (coreografía), content.js (textos), kinetic.js, faces.js, icons.js
assets/img/                   → Imágenes propias de V4 (capturas en escenario, datos personales ocultos)
assets/images/, assets/logos/ → Imágenes y logos de portfolio-v2
assets/favicon.svg            → La E del logo sobre los cinco carriles
CNAME, .nojekyll              → Dominio y servido tal cual (no tocar)
```

## Cómo publicar un cambio

1. Hacer el cambio en `portfolio-v2/v4-lab/` y verlo en el servidor `portfolio-v2` (puerto 8081, `/v4-lab/home-study.html`).
2. Commit en `portfolio-v2`, rama `v4-lab`.
3. Generar el sitio en el worktree de este repo (`C:/Users/lavie/Proyectos/portfolio-web-v4`, rama `v4-launch`):
   ```
   python tools/publish-v4.py ../portfolio-web-v4      (desde portfolio-v2)
   ```
4. Revisarlo en el servidor `portfolio-v4-launch` (puerto 8083), en desktop y en mobile, con capturas headless de a una por vez.
5. Commit en `v4-launch` y publicar: `git push origin v4-launch:main`. GitHub Pages tarda uno o dos minutos en actualizar el sitio.

Para volver a la versión anterior (V1), está guardada en la etiqueta `v1`.

## Reglas que se mantienen

- La home lleva Work (filas de 2, 2 y 3), Approach (la cinta y los cinco sentidos), About, Reviews y contacto. La nav tiene Work, Approach, About y Contact. Por ahora no hay versión en español.
- Las tarjetas de proyecto llevan un título corto que dice qué es el proyecto y, debajo, una frase que lo explica. Sin etiquetas ni rayas.
- Case studies: portada completa y centrada; título y datos (Timeline, Role, Platform, Goal); resumen en tres columnas con una o dos frases resaltadas por columna; Decisions; Impact (sin métricas negativas); Learnings; More work.
- Capturas: siempre enteras y sin datos personales (dos o tres dígitos ocultos). El fondo del escenario es distinto del de la captura, y la captura lleva una sola sombra.
- Rol: *Sole Product Designer* solo en los case studies, nunca en la experiencia ni en el CV. El link del pie dice "Resume", nunca "CV".
- Textos en inglés, sin palabras huérfanas en la última línea (`&nbsp;` antes de la última palabra) y sin punto final en los títulos.

## Pendiente

- Los links a CSS y JS no llevan versión (`?v=`), así que después de publicar algunos navegadores pueden mostrar archivos viejos durante un rato.
- En la configuración de GitHub Pages, "Enforce HTTPS" está desactivado.
- Nota: este archivo también se publica (emilialaviero.com/CLAUDE.md), igual que en V1.

## Trabajo con Emilia

- Llamarla "Ema", escribirle en español, sin guiones largos (—) y sin la estructura "no X, sino Y". No sobre-explicar el trabajo ya terminado.
- Antes de construir, proponer el contenido y esperar que lo valide. Preguntar ante cualquier ambigüedad.
- Mirar el trabajo como diseñadora web y como reclutadora, y señalar mejoras a medida que aparecen.
- Antes de dar algo por terminado: QA visual en desktop y mobile, y mostrarle el resultado.
- No atribuirle cosas que no dijo. Decir "the business", no "the business team".
