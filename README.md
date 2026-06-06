# SecretarIA CDMX — Viabilidad de negocios

Herramienta web para emprendedores que quieren abrir un establecimiento mercantil en la Ciudad de México. Analiza la **viabilidad comercial y legal** del giro: competidores, nivel socioeconómico, uso de suelo y la ruta completa de trámites de apertura.

> Hackathon SEDECO 2026 · Reto 2 · Viabilidad de negocios CDMX

## Problema

Abrir un negocio en la CDMX implica navegar un proceso burocrático complejo que varía según el giro y la ubicación. Un emprendedor sin conocimientos legales puede:
- Invertir en un local con uso de suelo incompatible
- Desconocer que su actividad requiere Permiso de Impacto Vecinal o Zonal (no solo un aviso)
- No saber que hay 52 restaurantes en 800m antes de firmar el contrato

## Usuario objetivo

Emprendedor o inversionista que quiere abrir un establecimiento mercantil en la CDMX y necesita saber si el mercado está saturado, si el uso de suelo es compatible y qué trámites debe realizar en orden.

## Flujo de uso (4 módulos)

1. **Diagnóstico** — Selecciona giro, zona en mapa interactivo y tipo de persona. Semáforo: viable / requiere verificación / no compatible.

2. **Análisis Comercial** — Score de viabilidad comercial (0-100) basado en: densidad de competidores en 800m (DENUE-INEGI), nivel socioeconómico NSE (AMAI 2023) y movilidad/tráfico (Metro CDMX). 15 colonias × 8 giros.

3. **Ruta de Trámites** — Tres niveles de impacto según la Ley de Establecimientos Mercantiles:
   - ✅ **Bajo Impacto** — Aviso automático y gratuito (operación inmediata)
   - ⚠️ **Impacto Vecinal** — Permiso 5 días, silencio = resolución favorable, vigencia 3 años
   - 🔴 **Impacto Zonal** — Permiso complejo, negativa ficta, vigencia 2 años
   
   Incluye documentos requeridos por paso, tabla comparativa de figuras jurídicas (SAS/SA/S.de R.L.), obligaciones del Art. 10 LEM y sanciones en UMA 2026.

4. **Resumen con IA** — Resumen personalizado en streaming con Claude (Anthropic). Incluye evaluación comercial, tiempo total estimado del proceso y primer paso urgente.

## Cómo correrlo

### Prerrequisitos
- Node.js 18 o superior
- API key de Anthropic (opcional — funciona con fallback sin ella)

### Instalación

```bash
git clone https://github.com/QuiqueTamayoMX/secretaria-cdmx.git
cd secretaria-cdmx
npm install
cp .env.example .env
# Edita .env y agrega tu VITE_ANTHROPIC_API_KEY (opcional)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Mapa | Leaflet.js |
| Estilos | CSS puro con variables institucionales CDMX 2024-2030 |
| LLM | Anthropic API (claude-sonnet-4-20250514), streaming SSE |
| Datos | JSON mock estructurado (sin base de datos) |

## Datos y fuentes

- **Trámites**: Ley de Establecimientos Mercantiles CDMX (dic 2025), RETYS, SIAPEM
- **Uso de suelo**: SEDUVI (mock por colonia)
- **Competidores**: DENUE-INEGI (orientativo, 15 colonias × 8 giros)
- **NSE**: AMAI 2023
- **Transporte**: Afluencia Metro CDMX, datos.cdmx.gob.mx

## Limitaciones

- Datos de uso de suelo y competidores son orientativos (mock basado en fuentes oficiales). Para certeza legal: SEDUVI y DENUE directamente.
- Cubre 8 giros y 15 colonias en la versión demo.
- Sin autenticación ni persistencia de datos.
- Esta herramienta es de orientación general. Verifica los requisitos específicos en las dependencias oficiales antes de iniciar tu trámite.

## Fuentes normativas

- [Ley de Establecimientos Mercantiles CDMX](https://prontuario.cdmx.gob.mx/pdf/Ley%20Establecimientos%20Mercantiles%2024122025.pdf)
- [RETYS](https://www.registrodetramitesyservicios.cdmx.gob.mx/)
- [SIAPEM](https://siapem.cdmx.gob.mx/)
- [SEDUVI](http://ciudadmx.cdmx.gob.mx:8080/seduvi/)
- [DENUE-INEGI](https://www.inegi.org.mx/app/mapa/denue/)
- [datos.cdmx.gob.mx](https://datos.cdmx.gob.mx)
