// Conexión al webhook de n8n para el chatbot RAG.
// Cuando VITE_N8N_WEBHOOK_URL no está definida, usa respuestas mock.

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

const MOCK_RESPONSES = [
  {
    keywords: ['trámite', 'tramite', 'permiso', 'licencia', 'apertura', 'abrir'],
    text: `Para abrir tu negocio en CDMX los pasos clave son:\n\n1. **Llave CDMX** — Registro en la plataforma digital (gratuito, en línea).\n2. **Constitución** — Si eres persona moral, hazlo vía SAS digital en ~48 h.\n3. **RFC** — Alta ante el SAT como persona física o moral.\n4. **Uso de suelo** — Verifica compatibilidad con tu giro en SEDUVI.\n5. **SIAPEM** — Ingresa el Aviso de Funcionamiento (bajo impacto) o Permiso de Impacto Vecinal/Zonal.\n\n¿Quieres que profundice en alguno de estos pasos?`,
  },
  {
    keywords: ['costo', 'precio', 'cuánto', 'cuanto', 'pagar', 'cobrar'],
    text: `Los costos varían por nivel de impacto:\n\n- **Bajo impacto**: Aviso de Funcionamiento = gratuito.\n- **Impacto Vecinal**: aprox. $800–$2,000 MXN + 5 días hábiles.\n- **Impacto Zonal**: proceso complejo, requiere videovigilancia SSC y asesoría legal.\n\n¿Cuál es el giro de tu negocio para darte el estimado exacto?`,
  },
  {
    keywords: ['tiempo', 'demora', 'cuánto tarda', 'plazo'],
    text: `Los tiempos aproximados son:\n\n- Llave CDMX: inmediato\n- RFC SAT: 1–3 días\n- Uso de suelo (consulta digital): 1 día\n- Aviso de Funcionamiento (bajo impacto): automático\n- Permiso Vecinal: 5 días hábiles (silencio = aprobación)\n- Permiso Zonal: 30–60 días hábiles\n\nEn total, un negocio de bajo impacto puede estar operando en menos de 2 semanas.`,
  },
  {
    keywords: ['documento', 'requisito', 'necesito', 'solicitar'],
    text: `Los documentos básicos para cualquier apertura son:\n\n- Identificación oficial (INE/Pasaporte)\n- CURP\n- RFC con homoclave\n- Comprobante de domicilio del local\n- Título de propiedad o contrato de arrendamiento\n- Plano de distribución del local\n\nSegún el giro pueden sumarse dictámenes de COFEPRIS, protección civil (PIPC) o VBSO de la SSC.`,
  },
  {
    keywords: ['alcohol', 'bebida', 'bar', 'cantina'],
    text: `Vender bebidas alcohólicas eleva el nivel de impacto:\n\n- **Como acompañamiento a alimentos**: Impacto Vecinal · 5 días · silencio = aprobación.\n- **Giro principal** (bar, cantina, antro): Impacto Zonal · proceso complejo · silencio = negativa ficta.\n\nEn ambos casos necesitas tramitar adicionalmente la licencia de bebidas alcohólicas ante la SESEQ.`,
  },
  {
    keywords: ['huff', 'métrica', 'metrica', 'modelo', 'score', 'competidor'],
    text: `La métrica que calculamos:\n\n**Modelo de Huff (1964)** — Estima tu cuota de mercado probable considerando la atracción de tu local vs la competencia cercana. Un score de 60%+ es favorable. Toma en cuenta el atractivo relativo de cada negocio y la distancia al consumidor.\n\nEs un indicador orientativo basado en datos INEGI y ubicaciones de competidores.`,
  },
];

export async function enviarMensaje(mensaje, historial = [], contexto = {}) {
  if (!WEBHOOK_URL) {
    await new Promise((r) => setTimeout(r, 600 + Math.floor(Math.abs(Math.sin(mensaje.length)) * 600)));
    return generarMock(mensaje);
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje, historial, contexto }),
  });

  if (!res.ok) throw new Error(`n8n respondió ${res.status}`);
  const data = await res.json();
  return data.respuesta ?? data.text ?? data.output ?? data.message ?? 'Sin respuesta.';
}

function generarMock(mensaje) {
  const m = mensaje.toLowerCase();
  for (const { keywords, text } of MOCK_RESPONSES) {
    if (keywords.some((k) => m.includes(k))) return text;
  }
  return `Entiendo tu pregunta sobre "${mensaje.slice(0, 40)}...". Como asesor de apertura de negocios en CDMX, puedo ayudarte con trámites, permisos, requisitos legales y análisis de viabilidad. ¿Qué aspecto te gustaría explorar con más detalle?`;
}
