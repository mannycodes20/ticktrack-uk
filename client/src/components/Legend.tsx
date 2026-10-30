import { bands } from '../activity'

export function Legend() {
  // Lowest band first, like reading a scale from left to right
  return (
    <div className="legend" aria-label="Legend: sightings per region">
      <div className="legend-swatches">
        {[...bands].reverse().map((b) => (
          <div key={b.range}>
            <span className="swatch" style={{ background: b.color }} aria-hidden />
            <span>{b.range}</span>
          </div>
        ))}
      </div>
      <strong>Sightings per region</strong>
    </div>
  )
}