# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos esenciales

```bash
npm run dev        # Dev server en localhost:5173 (requiere Node.js ≥20.19 o ≥22.12)
npm run build      # Build de producción en /dist
npm run lint       # ESLint (flat config)
npm run preview    # Vista previa del build
npm run deploy     # Build + publica en GitHub Pages con gh-pages
```

**Node.js nota:** Si la versión es <20.19, instalar el binding nativo antes de build/dev:
```bash
npm install @rolldown/binding-win32-x64-msvc --ignore-scripts
```

Variables de entorno en `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...     # Opcional (ResumenIA legacy)
VITE_N8N_WEBHOOK_URL=https://...      # Opcional (chatbot RAG con n8n)
```
Sin las variables, los módulos respectivos usan respuestas mock predefinidas.

---

## Flujo de la aplicación

```
/localizacion → /intermedio → /login → /selecciona → /asistente
                                                    ↘ /comparador
```

El router es **HashRouter** (`react-router-dom`). Las rutas usan `#` como prefijo
(e.g. `https://.../#/localizacion`) lo que permite deploy estático en GitHub Pages
sin configurar redirects del servidor.

**Flujo de estado:**
1. Usuario llega a `/localizacion`, selecciona coordenadas y giro → `negocioActual` se llena
2. `/intermedio` muestra métricas y pregunta si continuar o agregar otro local
3. Si agrega otro → `negocios[].push(negocioActual)` y vuelve a `/localizacion`
4. `/login` recoge nombre, CURP y correo → `usuario` se llena
5. `/selecciona` ofrece dos caminos: Asistente o Comparador
6. `/asistente` → Chatbot RAG (n8n o mock)
7. `/comparador` → tabla CRUD de `negocios[]` con descarga PDF

---

## Componentes (`src/components/`)

### Localizacion (`/localizacion`)
- GPS via `navigator.geolocation` o búsqueda de dirección con Nominatim (sin API key)
- Mapa Leaflet con marcador verde (usuario), marcadores rojos (competidores mock), círculo guinda 800m
- Selector de categoría → giro (datos de `mock-tramites.json`)
- Llama a `calcularHuff(coords, giroId)` en tiempo real; muestra barra de score y cuota %
- `onContinuar(data)` emite `{ coords, address, tipo, tipoNombre, huffResult }`

### StepIntermedio (`/intermedio`)
- Muestra resumen: dirección · tipo de negocio · cuota Huff
- "Continuar" → `/login` (si no hay sesión) o `/selecciona` (si ya hay sesión)
- "Agregar otro local" → guarda negocioActual en `negocios[]` y navega a `/localizacion`

### Login (`/login`)
- Campos: nombre completo · CURP (regex 18 chars) · correo electrónico
- Validación client-side; no persiste en ningún servidor (dummy data)

### Selecciona (`/selecciona`)
- Saludo con nombre del usuario
- Dos botones: "Asistente paso a paso" → `/asistente` | "Comparador de locales" → `/comparador`
- Protegida: redirige a `/login` si no hay `usuario`

### Chatbot (`/asistente`)
- POST al webhook n8n (`VITE_N8N_WEBHOOK_URL`) con `{ mensaje, historial, contexto }`
- Sin webhook: respuestas mock por keywords (trámites, costos, tiempos, documentos, Huff)
- Renderiza `**texto**` como `<strong>` y saltos de línea como `<br>`
- Protegida: redirige a `/login` si no hay `usuario`

### Comparador (`/comparador`)
- Tabla CRUD sobre el array `negocios` del estado global
- Columnas: Local · Tipo de negocio · Cuota Huff % · Viabilidad · Acciones
- Editar tipo inline (recalcula al volver a Localización)
- Eliminar: filtra el negocio del array
- Descargar PDF: llama a `generarPDFComparador(negocios, usuario)` via jsPDF
- Máximo 5 locales
- Protegida: redirige a `/login` si no hay `usuario`

---

## Estado global (`App.jsx`)

```js
usuario        // null | { nombre, curp, correo }
negocioActual  // null | { id, coords, address, tipo, tipoNombre, huffResult }
negocios       // negocioActual[]  — fuente de verdad del Comparador
modoAgregar    // boolean — true cuando se vuelve a Localizacion desde el Comparador
```

El estado vive en `<AppInner>` (hijo de `<HashRouter>`). No hay contexto global ni store.

---

## Servicios (`src/services/`)

| Archivo | Responsabilidad |
|---|---|
| `geocodingService.js` | Nominatim geocoding. `geocodeDireccion(query)` → `{ coords, displayName }`. `reverseGeocode(lat, lng)` → string de dirección. |
| `huffModel.js` | Modelo de Huff (1964). `calcularHuff(coords, giroId)` → `{ score, cuotaMercado, numCompetidores, competidores[], interpretacion, color }`. Determinístico: mismas coords + giro → mismos resultados. |
| `hansenIndex.js` | Índice de Hansen (1959). `calcularHansen(coords)` → `{ score, poblacionAlcanzable, interpretacion, color }`. Disponible pero no integrado en el flujo principal aún. |
| `n8nService.js` | `enviarMensaje(mensaje, historial, contexto)` → POST a n8n o mock por keyword. |
| `pdfService.js` | `generarPDFComparador(negocios, usuario)` → descarga PDF con tabla comparativa via jsPDF. |
| `claudeApi.js` | `generarResumen(...)` → streaming SSE a Anthropic API (módulo legacy, no en flujo principal). |

---

## Datos mock (`src/data/`)

- **`mock-tramites.json`** — 8 giros, 8 categorías, 15 colonias, 12 procedimientos legales.
  Usado por `Localizacion` (selector de categoría/giro) y `Comparador` (edición de tipo).
- **`viabilidad-comercial.json`** — NSE/competidores por colonia. Disponible como referencia.

---

## Routing

`App.jsx` usa `<HashRouter>` de `react-router-dom`. Rutas definidas en `<AppInner>`:

| Ruta | Componente | Guard |
|---|---|---|
| `/` | Redirect → `/localizacion` | — |
| `/localizacion` | `<Localizacion>` | — |
| `/intermedio` | `<StepIntermedio>` | Redirect a `/localizacion` si no hay `negocioActual` |
| `/login` | `<Login>` | — |
| `/selecciona` | `<Selecciona>` | Redirect a `/login` si no hay `usuario` |
| `/asistente` | `<Chatbot>` | Redirect a `/login` si no hay `usuario` |
| `/comparador` | `<Comparador>` | Redirect a `/login` si no hay `usuario` |
| `/*` | Redirect → `/localizacion` | — |

---

## Notas técnicas

- **Leaflet + Vite**: íconos importados como assets en `Localizacion.jsx` y sobreescritos con `L.Icon.Default.mergeOptions(...)`. El marcador del usuario es un `L.divIcon` con clase `.loc-marker-user`.
- **CSS global**: `.btn-primary`, `.stepper`, `.modulo`, animación `fadeInUp` están en `App.css`. Cada componente importa su propio `.css`. No hay CSS Modules.
- **Base path**: `vite.config.js` tiene `base: '/secretaria-cdmx/'` para GitHub Pages.
- **HashRouter**: necesario para GitHub Pages (no hay control de servidor para 404→index.html).
- **jsPDF**: dependencia de producción. El PDF se genera íntegramente en el cliente.
- **Métricas determinísticas**: `huffModel.js` y `hansenIndex.js` usan `Math.sin/cos(lat * constante + i)` como generador pseudo-aleatorio reproducible. Misma ubicación → mismos competidores y score.
- **Deploy**: `npm run deploy` = `gh-pages -d dist`. Publica la carpeta `dist/` en la rama `gh-pages`. La rama `master` es el código fuente.
