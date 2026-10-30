import type { Filters as FilterValues, SpeciesStat } from '../api'

type Props = {
  value: FilterValues
  species: SpeciesStat[]
  onChange: (next: FilterValues) => void
}

export function FilterBar({ value, species, onChange }: Props) {
  // Copy the current filters and change one field
  const set = (field: keyof FilterValues, v: string) => onChange({ ...value, [field]: v })

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()} aria-label="Filter sightings">
      <label className="wide">
        Species
        <select value={value.species ?? ''} onChange={(e) => set('species', e.target.value)}>
          <option value="">All species</option>
          {species.map((s) => (
            <option key={s.species} value={s.species}>
              {s.species}
            </option>
          ))}
        </select>
      </label>
      <label>
        From
        <input type="date" value={value.from ?? ''} max={value.to || undefined} onChange={(e) => set('from', e.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={value.to ?? ''} min={value.from || undefined} onChange={(e) => set('to', e.target.value)} />
      </label>
      <button type="button" className="link-button" onClick={() => onChange({})}>
        Clear filters
      </button>
    </form>
  )
}