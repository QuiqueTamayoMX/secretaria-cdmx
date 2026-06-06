import mockData from '../data/mock-tramites.json';

/**
 * Calcula la ruta crítica completa usando el sistema de tres niveles de impacto
 * de la Ley de Establecimientos Mercantiles CDMX y el RETYS.
 *
 * Niveles de impacto:
 *  - 'bajo'    → Aviso de Funcionamiento automático y gratuito
 *  - 'vecinal' → Permiso de Impacto Vecinal (5 días, silencio = aprobado, vigencia 3 años)
 *  - 'zonal'   → Permiso de Impacto Zonal (negativa ficta, vigencia 2 años)
 *
 * @param {string} giroId
 * @param {'ninguno'|'vecinal'|null} nivelAlcohol - solo relevante para giros con puede_personalizar_alcohol
 * @param {string} tipoPersona - 'fisica' | 'moral'
 * @param {number|null} aforoEstimado - número de personas; null = no sabe
 * @returns {{ fase1: [], fase2: [], impacto: string, ruta: 'A'|'B', giro: object }}
 */
export function calcularRutaCritica(giroId, nivelAlcohol, tipoPersona, aforoEstimado) {
  const giro = mockData.giros.find((g) => g.id === giroId);
  if (!giro) return null;

  // Determinar nivel de impacto
  let impacto = giro.impacto_base ?? 'bajo';
  if (giro.puede_personalizar_alcohol && nivelAlcohol === 'vecinal') {
    impacto = 'vecinal';
  }

  // Backward compat: ruta A = bajo, ruta B = vecinal o zonal
  const ruta = impacto === 'bajo' ? 'A' : 'B';

  const t = (id) => ({ id, ...mockData.tramites[id] });

  // ── FASE 1: Autenticación y Viabilidad Urbana (siempre igual) ──
  const fase1 = [
    t('llave_cdmx'),
    t('constitucion'),
    t('rfc'),
    t('uso_suelo'),
    t('expediente_base'),
  ];

  // ── FASE 2: Según nivel de impacto ──
  let fase2 = [];

  if (impacto === 'bajo') {
    fase2.push(t('siapem_aviso'));
    if (giro.cofepris_requerido) fase2.push(t('cofepris'));

  } else if (impacto === 'vecinal') {
    fase2.push(t('no_adeudo_predial'));
    fase2.push(t('no_adeudo_agua'));

    const aforo = aforoEstimado ?? 0;
    if (aforo > 100 || aforo === 0) {
      fase2.push(t('vbso'));
      fase2.push(t('pipc'));
    } else if (aforo > 50) {
      fase2.push(t('vbso'));
    }

    fase2.push(t('siapem_permiso_vecinal'));
    if (giro.cofepris_requerido) fase2.push(t('cofepris'));

  } else {
    // zonal
    fase2.push(t('no_adeudo_predial'));
    fase2.push(t('no_adeudo_agua'));

    const aforo = aforoEstimado ?? 0;
    if (aforo > 100 || aforo === 0) {
      fase2.push(t('vbso'));
      fase2.push(t('pipc'));
    } else if (aforo > 50) {
      fase2.push(t('vbso'));
    }

    fase2.push(t('sistema_seguridad'));
    fase2.push(t('siapem_permiso_zonal'));
    if (giro.cofepris_requerido) fase2.push(t('cofepris'));
  }

  return { fase1, fase2, impacto, ruta, giro };
}
