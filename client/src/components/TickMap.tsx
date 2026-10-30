import L from 'leaflet'
import { useEffect } from 'react'
import { GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { activityLevel } from '../activity'
import { regionShapes, type RegionStat } from '../regions'

// Shortt names on two lines, so the labels fit inside their regions
const LABELS: Record<string, string> = {
  'North East': 'North<br>East',
  'North West': 'North<br>West',
  'Yorkshire and The Humber': 'Yorkshire',
  'East Midlands': 'East<br>Midlands',
  'West Midlands': 'West<br>Midlands',
  'East of England': 'East of<br>England',
  'South East': 'South<br>East',
  'South West': 'South<br>West',
  'Northern Ireland': 'Northern<br>Ireland',
}

type Props = {
  regions: RegionStat[]
  selected: string | null
  onSelect: (region: string) => void
}

const ALL_REGIONS = L.geoJSON(regionShapes).getBounds()

// Zooms to the chosen region, or back out to the whole UK
function FlyTo({ region }: { region: string | null }) {
  const map = useMap()
  useEffect(() => {
    const shape = regionShapes.find((f) => f.properties?.region === region)
    map.flyToBounds(shape ? L.geoJSON(shape).getBounds() : ALL_REGIONS, { padding: [20, 20] })
  }, [map, region])
  return null
}

export function TickMap({ regions, selected, onSelect }: Props) {
  return (
    <MapContainer bounds={ALL_REGIONS} zoomSnap={0.25} className="map" scrollWheelZoom={false}>
           <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Boundaries: ONS, OGL'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo region={selected} />
      {regionShapes.map((shape) => {
        const name = shape.properties?.region as string
        const count = regions.find((r) => r.region === name)?.count ?? 0
        const level = activityLevel(count)
        const isSelected = name === selected
        return (
          // The key includes the colour, so the shape redraws when the filters change its count
          <GeoJSON
            key={`${name}-${level.color}-${isSelected}`}
            data={shape}
            style={{
              color: isSelected ? '#f4a261' : '#ffffff',
              weight: isSelected ? 4 : 1.5,
              fillColor: level.color,
              fillOpacity: 0.8,
            }}
            eventHandlers={{ click: () => onSelect(name) }}
          >
            <Tooltip sticky>
              <strong>{name}</strong>: {count} sightings
            </Tooltip>
          </GeoJSON>
        )
      })}
      {regionShapes.map((shape) => {
        const name = shape.properties?.region as string
        // Region names, written on the map like ParvoTrack's state names
        const icon = L.divIcon({ className: 'region-label', html: LABELS[name] ?? name, iconSize: [90, 26] })
        return <Marker key={`label-${name}`} position={shape.properties?.label} icon={icon} interactive={false} />
      })}
    </MapContainer>
  )
}