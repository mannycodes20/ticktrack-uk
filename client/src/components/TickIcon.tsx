// A simple drawn tick, used as the illustration in the vet section
export function TickIcon() {
  const legs = [-1, 1].flatMap((side) =>
    [0, 1, 2, 3].map((i) => {
      const y = 112 + i * 22
      return `M${100 + side * 38} ${y} Q${100 + side * 80} ${y - 20} ${100 + side * 92} ${y + 18}`
    }),
  )
  return (
    <svg className="tick-icon" viewBox="0 0 200 240" role="img" aria-label="Illustration of a tick">
      {legs.map((d) => (
        <path key={d} d={d} stroke="#3b2414" strokeWidth="7" fill="none" strokeLinecap="round" />
      ))}
      <ellipse cx="100" cy="150" rx="52" ry="68" fill="#7a4a2a" />
      <ellipse cx="100" cy="132" rx="34" ry="40" fill="#5c3418" />
      <ellipse cx="100" cy="74" rx="18" ry="16" fill="#3b2414" />
      <ellipse cx="86" cy="140" rx="10" ry="20" fill="#9c6740" opacity="0.6" />
    </svg>
  )
}