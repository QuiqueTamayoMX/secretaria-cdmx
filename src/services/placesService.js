const GIRO_TO_PLACE_TYPES = {
  restaurante:   ['restaurant'],
  bar:           ['bar'],
  boutique:      ['clothing_store'],
  consultorio:   ['doctor', 'dentist', 'physiotherapist'],
  gym:           ['gym', 'fitness_center'],
  salon_belleza: ['beauty_salon', 'hair_care'],
  farmacia:      ['pharmacy', 'drugstore'],
  papeleria:     ['stationery_store', 'book_store'],
};

export async function buscarCompetidores(coords, giroId, radioMetros = 800) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const tipos = GIRO_TO_PLACE_TYPES[giroId];
  if (!tipos) return null;

  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.location,places.rating',
    },
    body: JSON.stringify({
      includedTypes: tipos,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: coords.lat, longitude: coords.lng },
          radius: radioMetros,
        },
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.places?.length) return null;

  return data.places.map((p) => ({
    coords: { lat: p.location.latitude, lng: p.location.longitude },
    nombre: p.displayName?.text ?? giroId,
    // rating 1–5 → atractivo 60–150; sin rating → 100
    atractivo: p.rating ? 60 + (p.rating / 5) * 90 : 100,
  }));
}
