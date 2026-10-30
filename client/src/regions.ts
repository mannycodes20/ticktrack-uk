import type { Feature, FeatureCollection } from 'geojson'
import type { CityStat } from './api'
import shapes from './data/uk-regions.json'

// Which of the 14 Elanco cities sit in each UK region
export const REGION_CITIES: Record<string, string[]> = {
  Scotland: ['Glasgow', 'Edinburgh'],
  'North East': ['Newcastle'],
  'North West': ['Manchester', 'Liverpool'],
  'Yorkshire and The Humber': ['Leeds', 'Sheffield'],
  'East Midlands': ['Nottingham', 'Leicester'],
  'West Midlands': ['Birmingham'],
  Wales: ['Cardiff'],
  'East of England': [],
  London: ['London'],
  'South East': ['Southampton'],
  'South West': ['Bristol'],
  'Northern Ireland': [],
}

// London sits inside the South East's outline, so it is drawn last to stay on top
export const regionShapes: Feature[] = [...(shapes as FeatureCollection).features].sort(
  (a, b) => Number(a.properties?.region === 'London') - Number(b.properties?.region === 'London'),
)

export type RegionStat = {
  region: string
  count: number
  cities: CityStat[]
}

// Adds up the city counts for each region
export function regionStats(cities: CityStat[]): RegionStat[] {
  return Object.entries(REGION_CITIES).map(([region, names]) => {
    const inRegion = cities.filter((c) => names.includes(c.city)).sort((a, b) => b.count - a.count)
    return { region, count: inRegion.reduce((sum, c) => sum + c.count, 0), cities: inRegion }
  })
}

export function regionOf(city: string) {
  return Object.keys(REGION_CITIES).find((region) => REGION_CITIES[region].includes(city)) ?? null
}