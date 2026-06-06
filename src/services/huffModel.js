// Modelo de Huff (1964): probabilidad de que un consumidor elija tu local
// sobre la competencia en función de atractivo / distancia².

const GIRO_CONFIG = {
  restaurante:   { minComp: 4, maxComp: 8,  radioKm: 0.8, nombreComp: 'Restaurante'  },
  bar:           { minComp: 2, maxComp: 5,  radioKm: 0.6, nombreComp: 'Bar'          },
  boutique:      { minComp: 3, maxComp: 7,  radioKm: 0.7, nombreComp: 'Tienda'       },
  consultorio:   { minComp: 2, maxComp: 5,  radioKm: 0.8, nombreComp: 'Consultorio'  },
  gym:           { minComp: 1, maxComp: 4,  radioKm: 1.0, nombreComp: 'Gimnasio'     },
  salon_belleza: { minComp: 3, maxComp: 8,  radioKm: 0.5, nombreComp: 'Salón'        },
  farmacia:      { minComp: 2, maxComp: 6,  radioKm: 0.7, nombreComp: 'Farmacia'     },
  papeleria:     { minComp: 2, maxComp: 5,  radioKm: 0.5, nombreComp: 'Papelería'    },
};

// Determinístico: mismas coordenadas + giro → mismos resultados
function det(lat, lng, i, min, max) {
  const v = Math.abs(Math.sin(lat * (127.1 + i * 0.3)) * Math.cos(lng * (311.7 + i * 0.7)));
  return min + v * (max - min);
}

function distKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

function offsetCoords(center, km, angleDeg) {
  const R = 6371;
  const angle = (angleDeg * Math.PI) / 180;
  const lat2 = center.lat + ((km / R) * 180) / Math.PI * Math.cos(angle);
  const lng2 =
    center.lng +
    ((km / R) * 180) / Math.PI * Math.sin(angle) / Math.cos((center.lat * Math.PI) / 180);
  return { lat: lat2, lng: lng2 };
}

function generarCompetidoresMock(coords, cfg) {
  const numComp = Math.round(det(coords.lat, coords.lng, 0, cfg.minComp, cfg.maxComp));
  return Array.from({ length: numComp }, (_, i) => {
    const dist = det(coords.lat, coords.lng, i + 1, 0.1, cfg.radioKm);
    const ang  = det(coords.lat, coords.lng, i + 100, 0, 360);
    const atractivo = det(coords.lat, coords.lng, i + 200, 60, 150);
    return { coords: offsetCoords(coords, dist, ang), atractivo, nombre: `${cfg.nombreComp} ${i + 1}` };
  });
}

// competidoresExternos: array de { coords, nombre, atractivo } desde Places API, o null para usar mock
export function calcularHuff(coords, giroId, competidoresExternos = null) {
  const cfg = GIRO_CONFIG[giroId] || GIRO_CONFIG.restaurante;
  const lambda = 2;

  const competidores = competidoresExternos ?? generarCompetidoresMock(coords, cfg);

  // Grid de consumidores circular (≈ 48 puntos, radio 1 km)
  const radioGrid = 1.0;
  const puntos = Array.from({ length: 48 }, (_, i) => {
    const r = Math.sqrt(det(coords.lat, coords.lng, i + 300, 0.01, 1)) * radioGrid;
    const a = det(coords.lat, coords.lng, i + 400, 0, 360);
    return offsetCoords(coords, r, a);
  });

  // Cuota de mercado (Huff)
  const userAtractivo = 100;
  let sumProb = 0;
  for (const p of puntos) {
    const dUser = Math.max(distKm(p, coords), 0.05);
    const utilUser = userAtractivo / dUser ** lambda;
    let sumUtil = utilUser;
    for (const c of competidores) {
      const d = Math.max(distKm(p, c.coords), 0.05);
      sumUtil += c.atractivo / d ** lambda;
    }
    sumProb += utilUser / sumUtil;
  }

  const cuota    = sumProb / puntos.length;
  const cuotaPct = Math.round(cuota * 1000) / 10;
  const score    = Math.min(95, Math.max(5, Math.round(cuota * 100)));

  return {
    score,
    cuotaMercado: cuotaPct,
    numCompetidores: competidores.length,
    competidores,
    interpretacion: score >= 60 ? 'Favorable' : score >= 35 ? 'Moderada' : 'Difícil',
    color: score >= 60 ? '#2e7d32' : score >= 35 ? '#e65100' : '#c62828',
  };
}
