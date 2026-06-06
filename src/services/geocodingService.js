const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'Accept-Language': 'es', 'User-Agent': 'SecretarIA-CDMX/1.0' };

export async function geocodeDireccion(query) {
  const q = encodeURIComponent(`${query}, Ciudad de México, México`);
  const res = await fetch(`${NOMINATIM}/search?q=${q}&format=json&limit=1`, { headers: HEADERS });
  if (!res.ok) throw new Error('Error al geocodificar');
  const data = await res.json();
  if (!data.length) throw new Error('Dirección no encontrada en CDMX');
  return {
    coords: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
    displayName: data[0].display_name,
  };
}

export async function reverseGeocode(lat, lng) {
  const res = await fetch(`${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: HEADERS });
  if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const data = await res.json();
  // Return a short readable address
  const addr = data.address || {};
  const partes = [addr.road, addr.suburb || addr.neighbourhood, addr.city_district || addr.city].filter(Boolean);
  return partes.length ? partes.join(', ') : data.display_name;
}
