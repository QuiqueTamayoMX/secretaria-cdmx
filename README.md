# SecretarIA CDMX

> **Herramienta de viabilidad comercial y legal para la apertura de negocios en la Ciudad de México.**
> Hackathon SEDECO 2026 · Reto 2 · Viabilidad de negocios CDMX

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat&logo=reactrouter&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat&logo=leaflet&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4-D97757?style=flat&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/licencia-MIT-green?style=flat)

---

## El problema

Cada año, miles de emprendedores en la CDMX inician un negocio sin saber tres cosas básicas:

1. **¿El mercado ya está saturado en esa zona?** — En la Condesa hay decenas de restaurantes en 800m. Nadie le dice eso al emprendedor antes de que firme el contrato de arrendamiento.
2. **¿Cuánta cuota de mercado puede capturar realísticamente?** — Sin un modelo de competencia, la intuición falla.
3. **¿Qué trámites necesita, en qué orden y ante qué dependencia?** — La diferencia entre un Aviso (operación inmediata) y un Permiso Zonal puede ser de días vs. meses.

**SecretarIA CDMX** resuelve los tres problemas en menos de 3 minutos.

---

## Flujo en 5 pasos

```
Localización → Análisis → Registro → Selecciona → Asistente IA
                                               ↘ Comparador de locales
```

### 1 · Localización de tu negocio
- Mapa interactivo **Leaflet + OpenStreetMap** con búsqueda de dirección (Nominatim, sin API key) o GPS del dispositivo
- Radio de influencia de **800 m** visualizado en el mapa
- Marcadores de **competidores simulados** en tiempo real según el giro seleccionado
- Selector de categoría + giro (código SCIAN) con 8 categorías y múltiples giros

### 2 · Análisis de viabilidad comercial
Dos modelos econométricos calculados en el cliente, **determinísticos** (misma ubicación → mismo resultado):

| Modelo | Base teórica | Output |
|---|---|---|
| **Modelo de Huff** | Huff, D.L. (1964) | Cuota de mercado estimada (%) en zona de 800m |
| **Índice de Hansen** | Hansen, W.G. (1959) | Score de accesibilidad 0–100 y población alcanzable |

Ambos modelos usan la posición real del usuario (lat/lng) como semilla — mismas coords = mismos competidores y misma cuota.

### 3 · Registro mínimo
- Nombre, CURP (validación regex 18 caracteres) y correo
- Sin base de datos — solo estado client-side para el demo

### 4a · Asistente de trámites (Chatbot IA)
- Conectado a **n8n webhook** con RAG sobre normatividad CDMX
- Sin webhook: respuestas mock por keywords (trámites, costos, tiempos, documentos)
- Contexto del negocio del usuario (giro + Huff score) integrado en cada consulta

### 4b · Comparador de locales
- Tabla **CRUD** con hasta 5 locales analizados
- Columnas: ubicación · giro · cuota Huff % · viabilidad (Favorable/Moderada/Difícil)
- Edición inline del tipo de negocio
- **Descarga en PDF** (jsPDF, client-side) con tabla comparativa

---

## Demo rápida

```
GPS en Condesa → Restaurante
→ Cuota Huff: ~18% · 6 competidores en zona · Moderada
→ Registro → Asistente: "¿qué trámites necesito?"
→ Respuesta: Bajo impacto → Aviso SIAPEM automático, RFC SAT, uso de suelo SEDUVI

Segunda ubicación: Polanco → Bar
→ Cuota Huff: ~32% · 3 competidores · Favorable
→ Comparador: L1 Restaurante 18% vs L2 Bar 32% → Descargar PDF
```

---

## Stack tecnológico

| Capa | Detalle |
|---|---|
| Frontend | React 19 + Vite 6 |
| Routing | React Router 7 (HashRouter — compatible con GitHub Pages) |
| Mapa | Leaflet 1.9 + OpenStreetMap (sin API key) |
| Geocoding | Nominatim API (gratuita, sin API key) |
| Modelos | Huff 1964 + Hansen 1959 (implementados en JS puro) |
| Estilos | CSS puro · Paleta institucional CDMX 2024–2030 |
| PDF | jsPDF (generación 100% client-side) |
| Chatbot | n8n webhook + fallback mock por keywords |
| LLM (legacy) | Anthropic `claude-sonnet-4-20250514` · streaming SSE |
| Deploy | `npm run deploy` → GitHub Pages via `gh-pages` |

---

## Instalación en 3 pasos

```bash
git clone https://github.com/QuiqueTamayoMX/secretaria-cdmx.git
cd secretaria-cdmx
npm install && npm run dev
```

Abre **http://localhost:5173** — funciona sin ninguna API key.

**Con chatbot IA (opcional):**
```bash
cp .env.example .env
# Edita .env:
# VITE_N8N_WEBHOOK_URL=https://tu-instancia-n8n/webhook/...
# VITE_ANTHROPIC_API_KEY=sk-ant-...  (módulo legacy)
npm run dev
```

> Ver [SETUP.md](./SETUP.md) para instrucciones detalladas.

---

## Estructura del repositorio

```
secretaria-cdmx/
├── data/                               # Datos mock para revisión de jueces
│   ├── mock-tramites.json              # 8 giros, 12 trámites, 15 colonias
│   └── viabilidad-comercial.json       # NSE/competidores por colonia (referencia)
├── src/
│   ├── components/
│   │   ├── Localizacion/               # Mapa + GPS + selector de giro + Huff en tiempo real
│   │   ├── StepIntermedio/             # Resumen de métricas + bifurcación del flujo
│   │   ├── Login/                      # Registro mínimo (nombre, CURP, correo)
│   │   ├── Selecciona/                 # Pantalla de selección Asistente vs Comparador
│   │   ├── Chatbot/                    # Chat con n8n o mock por keywords
│   │   └── Comparador/                 # Tabla CRUD + descarga PDF
│   ├── services/
│   │   ├── geocodingService.js         # Nominatim geocoding / reverse geocoding
│   │   ├── huffModel.js                # Modelo de Huff (1964) — cuota de mercado
│   │   ├── hansenIndex.js              # Índice de Hansen (1959) — accesibilidad
│   │   ├── n8nService.js               # Cliente n8n webhook con mock fallback
│   │   ├── pdfService.js               # Generador PDF client-side con jsPDF
│   │   └── claudeApi.js                # Cliente Anthropic SSE (módulo legacy)
│   ├── data/
│   │   ├── mock-tramites.json
│   │   └── viabilidad-comercial.json
│   └── styles/
│       └── variables.css               # Tokens de diseño institucional CDMX
├── .env.example
├── CLAUDE.md
├── README.md
├── SETUP.md
└── vite.config.js                      # base: '/secretaria-cdmx/' para GitHub Pages
```

---

## Fuentes normativas y de datos

| Fuente | Uso en la app |
|---|---|
| [Ley de Establecimientos Mercantiles CDMX (dic 2025)](https://prontuario.cdmx.gob.mx/pdf/Ley%20Establecimientos%20Mercantiles%2024122025.pdf) | Base del chatbot y clasificación de impacto |
| [RETYS](https://www.registrodetramitesyservicios.cdmx.gob.mx/) | Trámites, tiempos y dependencias en mock-tramites.json |
| [SIAPEM](https://siapem.cdmx.gob.mx/) | Links directos en ruta de trámites |
| [SEDUVI](http://ciudadmx.cdmx.gob.mx:8080/seduvi/) | Uso de suelo por colonia (datos mock) |
| [DENUE-INEGI](https://www.inegi.org.mx/app/mapa/denue/) | Base para competidores mock en huffModel.js |
| [Nominatim / OpenStreetMap](https://nominatim.org/) | Geocoding y reverse geocoding (sin API key) |
| Huff, D.L. (1964) *JMRS* | Modelo de cuota de mercado |
| Hansen, W.G. (1959) *JAIP* | Índice de accesibilidad espacial |

---

## Limitaciones declaradas

- Los competidores, NSE y cuotas de mercado son **orientativos** — generados determinísticamente desde las coordenadas del usuario, no son datos en vivo de DENUE.
- La versión demo cubre 8 giros. No es un catálogo exhaustivo de giros SCIAN.
- Sin autenticación real ni persistencia — el estado se pierde al recargar.
- Los tiempos de trámite son estimados y pueden variar según la alcaldía.
- El chatbot en modo mock responde por palabras clave; requiere `VITE_N8N_WEBHOOK_URL` para respuestas con contexto normativo completo.

> **Aviso legal:** Esta herramienta es de orientación general. Verifica los requisitos específicos en las dependencias oficiales antes de iniciar tu trámite.

---

*Desarrollado para el Hackathon SEDECO 2026 · Reto 2 · Ciudad de México*
