// Fixed bands like a heat map legend, so a colour always means the same number of sightings
export const bands = [
  { min: 101, range: '101+', label: 'Very high', color: '#a4161a' },
  { min: 51, range: '51–100', label: 'High', color: '#003be8' },
  { min: 26, range: '26–50', label: 'Moderate', color: '#5b8cff' },
  { min: 1, range: '1–25', label: 'Low', color: '#b9ccff' },
]

export function activityLevel(count: number) {
  return bands.find((b) => count >= b.min) ?? { min: 0, range: '0', label: 'No', color: '#eef0f2' }
}