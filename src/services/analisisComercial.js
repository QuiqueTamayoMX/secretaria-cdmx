import vcData from '../data/viabilidad-comercial.json';

/**
 * Calcula el Índice de Viabilidad Comercial (0-100) para una colonia + giro.
 * Metodología inspirada en SpotQ / DENUE-INEGI / AMAI NSE 2023.
 *
 * Pesos:
 *   40% Mercado (NSE vs. segmento objetivo del giro)
 *   35% Competencia (saturación inversa)
 *   25% Movilidad (transporte + tráfico peatonal)
 */
export function calcularViabilidadComercial(coloniaKey, giroId) {
  const key = coloniaKey?.toLowerCase().trim();
  const colonia = vcData.colonias[key];
  if (!colonia) return null;

  const compData = colonia.competidores[giroId];
  const thresholds = vcData.giro_thresholds[giroId];

  // ── 1. Score de saturación de mercado ──
  let saturacionLabel = 'baja';
  let saturacionScore = 85;
  if (compData && thresholds) {
    const count = compData.count;
    if (count > thresholds.alta)       { saturacionLabel = 'muy_alta'; saturacionScore = 18; }
    else if (count > thresholds.media) { saturacionLabel = 'alta';     saturacionScore = 38; }
    else if (count > thresholds.baja)  { saturacionLabel = 'media';    saturacionScore = 60; }
    else                               { saturacionLabel = 'baja';     saturacionScore = 85; }
  }

  // ── 2. Score de NSE (alineación con el giro) ──
  const nseScore = colonia.nse_score;

  // Ajuste por tipo de giro vs NSE: negocios premium funcionan mejor en NSE alto
  const girosNseAlto = ['boutique', 'gym', 'consultorio'];
  const girosNseBajo  = ['papeleria', 'farmacia'];
  let nseAjustado = nseScore;
  if (girosNseAlto.includes(giroId) && nseScore < 55) nseAjustado = Math.max(25, nseScore - 15);
  if (girosNseBajo.includes(giroId) && nseScore > 75) nseAjustado = Math.min(100, nseScore + 8);

  // ── 3. Score de movilidad ──
  const movilidadScore = Math.round((colonia.transporte_score + colonia.trafico_score) / 2);

  // ── 4. Score compuesto ──
  const scoreTotal = Math.round(
    nseAjustado    * 0.40 +
    saturacionScore * 0.35 +
    movilidadScore  * 0.25
  );

  // ── 5. Interpretación ──
  let nivel, interpretacion, recomendacion;

  if (scoreTotal >= 70) {
    nivel = 'favorable';
    interpretacion = 'Alta viabilidad comercial';
    recomendacion = 'Mercado con buen potencial. Procede con tu plan de negocio.';
  } else if (scoreTotal >= 48) {
    nivel = 'moderado';
    interpretacion = 'Viable con diferenciación';
    recomendacion = 'El mercado es competitivo. Necesitarás un concepto claro que te distinga.';
  } else {
    nivel = 'dificil';
    interpretacion = 'Mercado desafiante';
    recomendacion = 'Alta competencia o bajo poder adquisitivo. Evalúa una zona alternativa o un concepto muy diferenciado.';
  }

  // ── 6. Texto de contexto del giro ──
  const saturacionTextos = {
    baja:     'Baja saturación — buena oportunidad de entrada',
    media:    'Saturación moderada — viable con diferenciación',
    alta:     'Mercado saturado — requiere concepto diferenciado',
    muy_alta: 'Mercado muy saturado — competencia intensa',
  };

  return {
    score: scoreTotal,
    nivel,
    interpretacion,
    recomendacion,
    descripcionZona: colonia.descripcion_zona,
    mercado: {
      competidores: compData?.count ?? 0,
      referencia: compData?.referencia ?? '',
      saturacion: saturacionLabel,
      saturacionTexto: saturacionTextos[saturacionLabel],
      score: saturacionScore,
    },
    nse: {
      nivel: colonia.nse,
      descripcion: colonia.nse_descripcion,
      score: nseAjustado,
    },
    movilidad: {
      metro: colonia.metro_cercano,
      distanciaMetroM: colonia.distancia_metro_m,
      ecobici: colonia.ecobici_stations,
      traficoLabel: colonia.densidad_peatonal,
      score: movilidadScore,
    },
  };
}
