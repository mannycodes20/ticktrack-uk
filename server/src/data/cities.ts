// Elanco's data gives a city name but no coordinates, so we place each
// sighting at its city centre. These are the 14 cities in the dataset.
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  London: { lat: 51.5074, lng: -0.1278 },
  Birmingham: { lat: 52.4862, lng: -1.8904 },
  Manchester: { lat: 53.4808, lng: -2.2426 },
  Liverpool: { lat: 53.4084, lng: -2.9916 },
  Leeds: { lat: 53.8008, lng: -1.5491 },
  Sheffield: { lat: 53.3811, lng: -1.4701 },
  Nottingham: { lat: 52.9548, lng: -1.1581 },
  Leicester: { lat: 52.6369, lng: -1.1398 },
  Bristol: { lat: 51.4545, lng: -2.5879 },
  Southampton: { lat: 50.9097, lng: -1.4044 },
  Newcastle: { lat: 54.9783, lng: -1.6178 },
  Cardiff: { lat: 51.4816, lng: -3.1791 },
  Glasgow: { lat: 55.8642, lng: -4.2518 },
  Edinburgh: { lat: 55.9533, lng: -3.1883 },
};

// Case-insensitive lookup, so "london" and " London " both match.
export function findCity(name: string) {
  const key = Object.keys(CITY_COORDS).find(
    (city) => city.toLowerCase() === name.trim().toLowerCase(),
  );
  return key ? { city: key, ...CITY_COORDS[key] } : null;
}
