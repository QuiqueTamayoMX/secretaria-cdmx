const SYSTEM_PROMPT = `Eres un asistente especializado en apertura de negocios en la Ciudad de México.
Responde ÚNICAMENTE sobre trámites, permisos y constitución de empresas en CDMX.
Basa tus respuestas en la Ley de Establecimientos Mercantiles de la CDMX y el RETYS.
Si no tienes certeza sobre un dato legal específico, indícalo claramente y remite
al usuario a la fuente oficial correspondiente.
No inventes nombres de trámites, tiempos ni dependencias.
Responde en español, en lenguaje claro para un emprendedor sin conocimientos legales.`;

const FALLBACK_TEXT = `Para abrir tu negocio en la Ciudad de México, deberás seguir los pasos indicados en la ruta de trámites.
Te recomendamos iniciar con tu constitución legal y el alta en el SAT, luego verificar el uso de suelo en SEDUVI
y finalmente tramitar tu aviso o permiso de funcionamiento en el SIAPEM de tu alcaldía.
Consulta las dependencias oficiales para confirmar los requisitos específicos de tu giro.`;

export async function generarResumen(giro, colonia, tipoPersona, tramites, onChunk, ruta, impacto, analisisComercial) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    await simulateFallbackStream(FALLBACK_TEXT, onChunk);
    return;
  }

  const tramitesTexto = tramites
    .map((t, i) => `${i + 1}. ${t.nombre} (${t.dependencia}) — ${t.tiempo_estimado}`)
    .join('\n');

  const impactoMap = {
    bajo:    'Bajo Impacto — Aviso de Funcionamiento automático y gratuito. Operación inmediata. Sin revalidación periódica.',
    vecinal: 'Impacto Vecinal — Permiso de Impacto Vecinal. Alcohol complementario a la comida. 5 días hábiles para resolución; silencio = aprobado. Vigencia 3 años.',
    zonal:   'Impacto Zonal — Permiso de Impacto Zonal. Alcohol como actividad principal (bar/cantina). Proceso complejo con videovigilancia SSC. Negativa ficta si no hay respuesta. Vigencia 2 años.',
  };
  const rutaTexto = impactoMap[impacto] ?? impactoMap[ruta === 'A' ? 'bajo' : 'vecinal'];

  const comercialTexto = analisisComercial
    ? `\nAnálisis comercial de la zona (DENUE/INEGI):
- Score de viabilidad comercial: ${analisisComercial.score}/100 (${analisisComercial.interpretacion})
- Competidores en 800m: ${analisisComercial.mercado.competidores} negocios (saturación ${analisisComercial.mercado.saturacion})
- NSE de la zona: ${analisisComercial.nse.nivel} — ${analisisComercial.nse.descripcion}
- Movilidad: ${analisisComercial.movilidad.metro}, tráfico peatonal ${analisisComercial.movilidad.traficoLabel}`
    : '';

  const userMessage = `Soy un emprendedor que quiere abrir un negocio de tipo "${giro}" en la colonia ${colonia} de la CDMX.
Soy persona ${tipoPersona}.
Mi proceso corresponde a la ${rutaTexto}.
${comercialTexto}

Los trámites que debo realizar en orden son:
${tramitesTexto}

Dame un resumen ejecutivo personalizado con:
1. Evaluación comercial: ¿es una zona con oportunidad o está saturada? Menciona la competencia y el NSE.
2. Cuánto tiempo tomará el proceso legal completo (suma los tiempos estimados)
3. El primer paso más urgente y por qué
4. Una advertencia sobre el filtro crítico de uso de suelo

Sé directo y práctico. Máximo 3-4 párrafos cortos.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await simulateFallbackStream(FALLBACK_TEXT, onChunk);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              onChunk(parsed.delta.text);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } catch {
    clearTimeout(timeoutId);
    await simulateFallbackStream(FALLBACK_TEXT, onChunk);
  }
}

async function simulateFallbackStream(text, onChunk) {
  const words = text.split(' ');
  for (const word of words) {
    onChunk(word + ' ');
    await new Promise((r) => setTimeout(r, 40));
  }
}
