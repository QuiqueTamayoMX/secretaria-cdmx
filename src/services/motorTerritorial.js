import { DICT_USO_SUELO, GIROS_DEMO, REGLAS_DECISION, SALIDAS_APP } from '../data/territorial-lookups.js';

// ─── Text normalization ───────────────────────────────────────────────────────

function norm(s) {
  return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// ─── CSV parser (RFC 4180) ────────────────────────────────────────────────────

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (c === ',' && !inQuote) {
      fields.push(current);
      current = '';
    } else if (c !== '\r') {
      current += c;
    }
  }
  fields.push(current);
  return fields;
}

export function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const predios = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim();
    });
    predios.push(obj);
  }

  return predios;
}

// ─── Predio lookup ────────────────────────────────────────────────────────────

export function buscarPredio(predios, calle, no_externo, colonia) {
  const calleBusq = norm(calle);
  const numBusq = norm(no_externo);
  const coloniaBusq = norm(colonia);

  // Exact match first
  let found = predios.find(
    (p) =>
      norm(p.calle) === calleBusq &&
      norm(p.no_externo) === numBusq &&
      norm(p.colonia) === coloniaBusq
  );

  // Fallback: match without number (return first hit for calle + colonia)
  if (!found) {
    found = predios.find(
      (p) => norm(p.calle) === calleBusq && norm(p.colonia) === coloniaBusq
    );
  }

  return found || null;
}

// ─── uso_descri → semáforo ────────────────────────────────────────────────────

export function clasificarUso(uso_descri) {
  const key = norm(uso_descri);
  return DICT_USO_SUELO[key] || null;
}

// ─── giro lookup ─────────────────────────────────────────────────────────────

export function buscarGiro(giroUsuario) {
  const key = norm(giroUsuario);
  return GIROS_DEMO.find((g) => norm(g.giro_usuario) === key) || null;
}

// ─── Full evaluation ──────────────────────────────────────────────────────────

export function evaluarCaso(predios, giroUsuario, calle, no_externo, colonia) {
  const predio = buscarPredio(predios, calle, no_externo, colonia);

  if (!predio) {
    return {
      ok: false,
      codigo: 'SIN_DATOS',
      mensaje: 'No se encontró el predio en la base territorial de demo. Verifica la dirección o usa revisión manual.',
      siguiente_modulo: 'modulo_verificacion',
    };
  }

  const uso = clasificarUso(predio.uso_descri);

  if (!uso) {
    return {
      ok: false,
      codigo: 'USO_NO_CLASIFICADO',
      mensaje: `El uso de suelo "${predio.uso_descri}" no está clasificado en el diccionario de demo. Requiere revisión antes de continuar.`,
      siguiente_modulo: 'modulo_verificacion',
      predio,
    };
  }

  const giro = buscarGiro(giroUsuario);

  if (!giro) {
    return {
      ok: false,
      codigo: 'GIRO_NO_CLASIFICADO',
      mensaje: 'El giro indicado no está clasificado todavía. Selecciona una opción disponible o solicita revisión manual.',
      siguiente_modulo: 'modulo_verificacion',
      predio,
      uso,
    };
  }

  const reglaKey = `${uso.semaforo}_${giro.riesgo}`;
  const regla = REGLAS_DECISION[reglaKey];

  if (!regla) {
    return {
      ok: false,
      codigo: 'REGLA_NO_ENCONTRADA',
      mensaje: 'No existe una regla de decisión para este caso. Requiere revisión manual.',
      siguiente_modulo: 'modulo_verificacion',
      predio,
      uso,
      giro,
    };
  }

  const salida = SALIDAS_APP[regla.decision];

  return {
    ok: true,
    predio,
    uso_descri: predio.uso_descri,
    semaforo_uso: uso.semaforo,
    mensaje_uso: uso.mensaje,
    giro_normalizado: giro.giro_normalizado,
    giro_familia: giro.familia,
    riesgo_giro: giro.riesgo,
    decision_final: regla.decision,
    mensaje_final: regla.mensaje,
    accion_app: regla.accion,
    pantalla_app: salida.pantalla,
    texto_boton: salida.boton,
    siguiente_modulo: salida.modulo,
    color_decision: salida.color,
    liga_ciuda: predio.liga_ciuda,
    latitud: predio.latitud,
    longitud: predio.longitud,
  };
}

// ─── Autocomplete helpers ─────────────────────────────────────────────────────

export function getColonias(predios) {
  const set = new Set(predios.map((p) => p.colonia).filter(Boolean));
  return Array.from(set).sort();
}

export function getCallesPorColonia(predios, colonia) {
  const col = norm(colonia);
  const set = new Set(
    predios
      .filter((p) => norm(p.colonia) === col && p.calle && p.calle !== 'NULL')
      .map((p) => p.calle)
  );
  return Array.from(set).sort();
}
