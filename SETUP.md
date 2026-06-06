# Guía de instalación y ejecución

## Requisitos

- **Node.js** 18 o superior — [descargar](https://nodejs.org/)
- **npm** 9 o superior (viene con Node.js)
- (Opcional) API key de Anthropic para el módulo de resumen con IA

## Pasos

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd secretaria-cdmx
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Abre `.env` en tu editor y reemplaza `tu_api_key_aqui` con tu API key de Anthropic.

> Si no tienes una API key, la aplicación funciona igualmente: el Módulo 3 mostrará un texto de fallback en lugar del resumen generado por IA.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

### 5. Build de producción (opcional)

```bash
npm run build
npm run preview
```

## Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | API key de Anthropic para el módulo de resumen | No (hay fallback) |

## Solución de problemas

**Error: `VITE_ANTHROPIC_API_KEY` no definida**
La app mostrará el texto de fallback en el Módulo 3. Agrega la key en `.env` para usar la IA real.

**Puerto 5173 ocupado**
Vite buscará automáticamente el siguiente puerto disponible e indicará la URL correcta en la terminal.

**La colonia no aparece en el diagnóstico**
La versión demo incluye 15 colonias. Ingresa una de las sugeridas (Condesa, Polanco, Roma Norte, Coyoacán, etc.) o verifica el uso de suelo directamente en SEDUVI.
