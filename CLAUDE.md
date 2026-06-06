# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos esenciales

```bash
npm run dev        # Dev server en localhost:5173 (requiere Node.js ≥20.19 o ≥22.12)
npm run build      # Build de producción en /dist
npm run lint       # ESLint (flat config)
npm run preview    # Vista previa del build
npm run deploy     # Publica en GitHub Pages con gh-pages
```

**Node.js importante:** Si la versión es <20.19, instalar manualmente el binding nativo de rolldown antes de build/dev:
```bash
npm install @rolldown/binding-win32-x64-msvc --ignore-scripts
```

Variables de entorno en `.env`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...     # Opcional (ResumenIA legacy)
VITE_N8N_WEBHOOK_URL=https://...      # Opcional (chatbot RAG)
```
Sin las variables, los módulos respectivos usan respuestas mock predefinidas.

## Flujo de la aplicación (3 pasos)

```
Localización → Intermedio (1.5) → Login → Selecciona → Chatbot | Comparador
                    ↓ "Agregar otro local"
              ← vuelve a Localización (negocios[].push)
```

**Paso 1 — Localización** (`src/components/Localizacion/`)
- GPS (browser `navigator.geolocation`) o búsqueda de dirección via Nominatim (OpenStreetMap, gratuito, sin API key)
- Selector de categoría + giro de negocio (datos de `src/data/mock-tramites.json`)
- Mapa Leaflet con marcador del usuario (verde), competidores mock (rojo) y radio de 800 m
- Calcula en tiempo real: Modelo de Huff (cuota de mercado %) + Índice de Hansen (accesibilidad /100)
- Ambas métricas son **determinísticas**: mismas coords + giro → mismo resultado

**Paso 1.5 — Intermedio** (`src/components/StepIntermedio/`)
- Resume las métricas del local actual
- "Continuar" → Login (si no hay sesión) o Selecciona (si ya hay sesión)
- "Agregar otro local" → guarda el negocio actual en el array `negocios[]` y vuelve a Localización

**Paso 2 — Login** (`src/components/Login/`)
- Recoge nombre, CURP (validación regex 18 chars) y correo
- Dummy data: no persiste en ningún servidor

**Paso 3 — Selecciona** (`src/components/Selecciona/`)
- "Asistente paso a paso" → Chatbot RAG
- "Comparador de locales" → Comparador CRUD

**3a — Chatbot** (`src/components/Chatbot/`)
- POST HTTP al webhook de n8n (`VITE_N8N_WEBHOOK_URL`)
- Sin la variable: respuestas mock basadas en keywords (trámites, costos, tiempos, documentos)
- Renderiza `**texto**` como `<strong>` y saltos de línea como `<br>`

**3b — Comparador** (`src/components/Comparador/`)
- CRUD sobre el array `negocios` del estado global en `App.jsx`
- Editar: cambia el tipo de negocio inline (recalcula métricas al volver a Localización)
- Eliminar: saca el negocio del array
- Descargar: genera PDF con jsPDF (`src/services/pdfService.js`)
- "Agregar": pone `modoAgregar=true` y va a Localización; al completar, vuelve directo al Comparador

## Estado global (`App.jsx`)

```js
paso           // 'localizacion'|'intermedio'|'login'|'selecciona'|'chatbot'|'comparador'
usuario        // null | { nombre, curp, correo }
negocioActual  // null | { id, coords, address, tipo, tipoNombre, huffResult, hansenResult }
negocios       // NegocioActual[]  — fuente de verdad del Comparador
modoAgregar    // boolean — true cuando se vuelve a Localización desde el Comparador
```

## Servicios (`src/services/`)

| Archivo | Responsabilidad |
|---|---|
| `geocodingService.js` | Nominatim geocoding (sin API key). `geocodeDireccion(query)` y `reverseGeocode(lat, lng)`. |
| `huffModel.js` | Modelo de Huff (1964). `calcularHuff(coords, giroId)` → cuota de mercado determinística. Genera competidores mock basados en trig(lat, lng, i). |
| `hansenIndex.js` | Índice de Hansen (1959). `calcularHansen(coords)` → accesibilidad 0-100 determinística. |
| `n8nService.js` | `enviarMensaje(mensaje, historial, contexto)` → POST a n8n o mock por keyword. |
| `pdfService.js` | `generarPDFComparador(negocios, usuario)` → descarga PDF con tabla comparativa vía jsPDF. |

## Datos mock (`src/data/`)

- `mock-tramites.json` — 8 giros, 8 categorías, 15 colonias, 12 procedimientos legales. No se usa en el nuevo flujo principal, pero `Localizacion` y `Comparador` lo consumen para el selector de giro.
- `viabilidad-comercial.json` — Datos NSE/competidores por colonia. Disponible como referencia para futuras integraciones.

## Notas técnicas

- **Leaflet + Vite**: los íconos se importan como assets en `Localizacion.jsx` y se sobreescriben con `L.Icon.Default.mergeOptions(...)`. El marcador del usuario es un `L.divIcon` con clase `.loc-marker-user`.
- **CSS global**: la clase `.btn-primary` y la animación `fadeInUp` están en `App.css`. Cada componente importa su propio `.css`. No hay CSS Modules.
- **Base path**: `vite.config.js` tiene `base: '/secretaria-cdmx/'` para GitHub Pages.
- **jsPDF**: añadido como dependencia. El PDF se genera en el cliente.
- **Métricas determinísticas**: `huffModel.js` y `hansenIndex.js` usan `Math.sin/cos(lat * constante + índice)` como generador pseudo-aleatorio reproducible. Misma ubicación → mismos competidores y score.
