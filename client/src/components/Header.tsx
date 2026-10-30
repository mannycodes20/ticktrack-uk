export function Header() {
  return (
    <header className="site-header">
      <a href="#top" className="brand">
        <img src="/logo.png" alt="TickTrack home" />
      </a>
      <nav aria-label="Main">
        <a href="#map">Map</a>
        <a href="#learn">Learn about ticks</a>
        <a href="#report">Report a sighting</a>
      </nav>
    </header>
  )
}