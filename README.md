# SecretarIA CDMX

> **Herramienta de viabilidad comercial y legal para la apertura de negocios en la Ciudad de México.**
> Hackathon SEDECO 2026 · Reto 2 · Viabilidad de negocios CDMX

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude-Sonnet_4-D97757?style=flat&logo=anthropic&logoColor=white)
![License](https://img.shields.io/badge/licencia-MIT-green?style=flat)

---

## El problema

Cada año, miles de emprendedores en la CDMX inician un negocio sin saber tres cosas básicas:

1. **¿El uso de suelo permite su giro en esa colonia?** — Si no lo verifican antes de firmar el contrato de arrendamiento, pierden dinero.
2. **¿Necesitan un Aviso, un Permiso Vecinal o un Permiso Zonal?** — La diferencia entre estas tres rutas puede ser de días vs. meses de espera y miles de pesos en multas.
3. **¿El mercado ya está saturado?** — En la Condesa hay 52 restaurantes en 800m. Nadie le dice eso al emprendedor antes de que invierta.

**SecretarIA CDMX** resuelve los tres problemas en menos de 2 minutos.

---

## Solución: 4 módulos en flujo lineal

```
Diagnóstico → Análisis Comercial → Ruta de Trámites → Resumen IA
```

### 1 · Diagnóstico de viabilidad
- Mapa interactivo (Leaflet) con selección de zona y radio de influencia de 800m
- Categorías de negocio + giros con código SCIAN
- Verificación de compatibilidad de uso de suelo por colonia

### 2 · Análisis comercial de la zona *(SpotQ-style)*
- **Score de viabilidad 0–100** calculado con:
  - 40 % Nivel socioeconómico (NSE AMAI 2023)
  - 35 % Saturación de competidores (DENUE-INEGI, radio 800m)
  - 25 % Movilidad y tráfico peatonal (afluencia Metro CDMX)
- 3 tarjetas de métricas: competidores en 800m · NSE · metro más cercano con ECOBICI
- Cobertura: **15 colonias × 8 giros = 120 combinaciones**

### 3 · Ruta de trámites personalizada
Basada en la **Ley de Establecimientos Mercantiles CDMX (dic 2025)** y el **RETYS**:

| Nivel de impacto | Trámite | Resolución | Vigencia |
|---|---|---|---|
| ✅ Bajo Impacto | Aviso de Funcionamiento SIAPEM | Automática — operación inmediata | Sin revalidación |
| ⚠️ Impacto Vecinal | Permiso de Impacto Vecinal | 5 días hábiles · Silencio = aprobado | 3 años |
| 🔴 Impacto Zonal | Permiso de Impacto Zonal | Sin plazo · **Negativa ficta** | 2 años |

**Cada paso incluye:** documentos requeridos · dependencia · tiempo estimado · link oficial.

**Extras:** comparativo de figuras jurídicas (SAS/SA de CV/S. de R.L.), obligaciones continuas del Art. 10 LEM y tabla de sanciones en UMA 2026.

### 4 · Resumen personalizado con IA
- Generado por **Claude Sonnet 4** (Anthropic) en streaming SSE
- Incorpora el análisis comercial + la ruta legal personalizada
- Fallback offline si no hay API key — el demo siempre funciona

---

## Demostración rápida

```
Entrada:   Restaurante / Fonda · Condesa · Persona física · Sin alcohol
Resultado: Score 57/100 · Viable con diferenciación
           52 competidores en 800m (alta saturación)
           NSE B+ · Metro Patriotismo 480m
           Ruta: Bajo Impacto → Aviso automático en SIAPEM
           7 pasos detallados con documentos y links oficiales
```

```
Entrada:   Bar / Cantina · Polanco · Persona moral
Resultado: Score 49/100 · Impacto Zonal
           10 competidores en 800m (media saturación)
           NSE A/B · Metro Polanco 310m
           Ruta: Zonal → Sistema de Seguridad SSC + Permiso complejo
           Alerta: Negativa ficta · Vigencia 2 años
```

---

## Stack tecnológico

| Capa | Detalle |
|---|---|
| Frontend | React 19 + Vite 6 |
| Mapa | Leaflet.js + OpenStreetMap |
| Estilos | CSS puro · Paleta institucional CDMX 2024-2030 |
| LLM | Anthropic API `claude-sonnet-4-20250514` · streaming SSE · timeout 15s |
| Datos | JSON mock estructurado (sin BD, sin backend) |
| Deploy | `npm run build` → carpeta `dist/` lista para cualquier CDN |

---

## Instalación en 3 pasos

```bash
git clone https://github.com/QuiqueTamayoMX/secretaria-cdmx.git
cd secretaria-cdmx
npm install && npm run dev
```

Abre **http://localhost:5173** — funciona sin API key (modo fallback).

**Con IA generativa:**
```bash
cp .env.example .env
# Edita .env → VITE_ANTHROPIC_API_KEY=tu_key_aqui
npm run dev
```

> Ver [SETUP.md](./SETUP.md) para instrucciones detalladas y solución de problemas.

---

## Estructura del repositorio

```
secretaria-cdmx/
├── data/                          # Datos mock para revisión de jueces
│   ├── mock-tramites.json         # 11 trámites con documentos y notas legales
│   └── viabilidad-comercial.json  # 15 colonias × 8 giros con NSE, competidores, metro
├── src/
│   ├── components/
│   │   ├── DiagnosticoForm.jsx    # Módulo 1: formulario con mapa Leaflet
│   │   ├── AnalisisComercial.jsx  # Módulo 2: score + métricas comerciales
│   │   ├── RutaTramites.jsx       # Módulo 3: pasos ordenados + documentos
│   │   ├── ResumenIA.jsx          # Módulo 4: streaming con Claude
│   │   ├── MapaZona.jsx           # Mapa interactivo con radio 800m
│   │   └── StatusBadge.jsx        # Semáforo viable/verificación/incompatible
│   ├── services/
│   │   ├── rutaLogica.js          # Motor de decisión LEM (3 niveles de impacto)
│   │   ├── analisisComercial.js   # Scoring NSE + saturación + movilidad
│   │   └── claudeApi.js           # Cliente Anthropic con SSE y fallback
│   └── data/
│       ├── mock-tramites.json
│       └── viabilidad-comercial.json
├── .env.example
├── README.md
└── SETUP.md
```

---

## Fuentes normativas y de datos

| Fuente | Uso |
|---|---|
| [Ley de Establecimientos Mercantiles CDMX (dic 2025)](https://prontuario.cdmx.gob.mx/pdf/Ley%20Establecimientos%20Mercantiles%2024122025.pdf) | Clasificación de impacto, obligaciones Art. 10 |
| [RETYS](https://www.registrodetramitesyservicios.cdmx.gob.mx/) | Trámites, tiempos y dependencias |
| [SIAPEM](https://siapem.cdmx.gob.mx/) | Árbol lógico Ruta A/B/Zonal |
| [SEDUVI](http://ciudadmx.cdmx.gob.mx:8080/seduvi/) | Uso de suelo por colonia (mock) |
| [DENUE-INEGI](https://www.inegi.org.mx/app/mapa/denue/) | Densidad de competidores (orientativo) |
| [AMAI NSE 2023](https://www.amai.org/) | Nivel socioeconómico por colonia |
| [Afluencia Metro CDMX](https://datos.cdmx.gob.mx/) | Tráfico peatonal y movilidad |
| [Anthropic Claude API](https://www.anthropic.com/) | Resumen personalizado con IA |

---

## Limitaciones declaradas

- Datos de uso de suelo, competidores y NSE son **orientativos** (mock basado en fuentes oficiales). Para certeza legal: consultar SEDUVI y DENUE directamente.
- La versión demo cubre 8 giros y 15 colonias. No es un sistema exhaustivo.
- Sin autenticación ni persistencia de datos.
- Los tiempos de trámite son estimados y pueden variar según la alcaldía.

> **Aviso legal:** Esta herramienta es de orientación general. Verifica los requisitos específicos en las dependencias oficiales antes de iniciar tu trámite.

---

*Desarrollado para el Hackathon SEDECO 2026 · Reto 2 · Ciudad de México*
