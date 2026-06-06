const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

export async function geocodeDireccion(query) {
  if (!API_KEY) return geocodeDireccionNominatim(query);
  const address = encodeURIComponent(`${query}, Ciudad de México`);
  const res = await fetch(`${BASE}?address=${address}&key=${API_KEY}&language=es&region=mx`);
  if (!res.ok) throw new Error('Error al geocodificar');
  const data = await res.json();
  if (data.status !== 'OK' || !data.results.length) throw new Error('Dirección no encontrada en CDMX');
  const r = data.results[0];
  return {
    coords: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
    displayName: r.formatted_address,
  };
}

export async function reverseGeocode(lat, lng) {
  if (!API_KEY) return reverseGeocodeNominatim(lat, lng);
  const res = await fetch(`${BASE}?latlng=${lat},${lng}&key=${API_KEY}&language=es`);
  if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const data = await res.json();
  if (data.status !== 'OK' || !data.results.length) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const comps = data.results[0].address_components;
  const get = (...types) => comps.find(c => types.some(t => c.types.includes(t)))?.long_name;
  const partes = [get('route'), get('sublocality_level_1', 'neighborhood'), get('locality')].filter(Boolean);
  return partes.length ? partes.join(', ') : data.results[0].formatted_address;
}

// ── Fallback Nominatim (sin API key) ──────────────────────────────────────────

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const NOM_HEADERS = { 'Accept-Language': 'es', 'User-Agent': 'SecretarIA-CDMX/1.0' };

async function geocodeDireccionNominatim(query) {
  const q = encodeURIComponent(`${query}, Ciudad de México, México`);
  const res = await fetch(`${NOMINATIM}/search?q=${q}&format=json&limit=1`, { headers: NOM_HEADERS });
  if (!res.ok) throw new Error('Error al geocodificar');
  const data = await res.json();
  if (!data.length) throw new Error('Dirección no encontrada en CDMX');
  return {
    coords: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
    displayName: data[0].display_name,
  };
}

async function reverseGeocodeNominatim(lat, lng) {
  const res = await fetch(`${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: NOM_HEADERS });
  if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const data = await res.json();
  const addr = data.address || {};
  const partes = [addr.road, addr.suburb || addr.neighbourhood, addr.city_district || addr.city].filter(Boolean);
  return partes.length ? partes.join(', ') : data.display_name;
}
