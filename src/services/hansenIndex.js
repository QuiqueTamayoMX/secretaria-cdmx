// Índice de Hansen (1959): mide cuánta demanda alcanzable rodea al local,
// ponderada por la fricción del viaje.
// Fórmula: Aᵢ = Σⱼ Oⱼ · e^(−β·tᵢⱼ)

function det(lat, lng, i, min, max) {
  const v = Math.abs(Math.sin(lat * (73.1 + i * 0.5)) * Math.cos(lng * (191.3 + i * 0.9)));
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

export function calcularHansen(coords) {
  const beta = 0.08;       // fricción (por minuto de viaje)
  const velocidad = 5;     // km/h caminando
  const factorCalle = 1.4; // factor red vial CDMX

  // 16 zonas de población alrededor del local (determinísticas)
  const zonas = Array.from({ length: 16 }, (_, i) => {
    const dist = det(coords.lat, coords.lng, i + 50, 0.2, 1.8);
    const ang = (i / 16) * 360 + det(coords.lat, coords.lng, i + 150, -10, 10);
    const poblacion = Math.round(det(coords.lat, coords.lng, i + 250, 1500, 12000));
    return { coords: offsetCoords(coords, dist, ang), poblacion };
  });

  let indice = 0;
  for (const z of zonas) {
    const dist = distKm(coords, z.coords);
    const tViaje = (dist * factorCalle) / (velocidad / 60); // minutos
    indice += z.poblacion * Math.exp(-beta * tViaje);
  }

  // Normalizar a 0-100 (rango esperado CDMX: ~3000-70000)
  const score = Math.min(95, Math.max(5, Math.round((indice / 55000) * 100)));
  const poblacionAlcanzable = Math.round(indice * 0.12);

  return {
    score,
    indice: Math.round(indice),
    poblacionAlcanzable,
    interpretacion:
      score >= 65 ? 'Alta accesibilidad' : score >= 40 ? 'Accesibilidad media' : 'Baja accesibilidad',
    color: score >= 65 ? '#1565c0' : score >= 40 ? '#f57c00' : '#b71c1c',
  };
}
