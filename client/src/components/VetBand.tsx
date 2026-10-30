export function VetBand() {
  return (
    <section className="vet-band">
      <div className="vet-text">
        <h2>Speak to your vet for more information.</h2>
        <p>
          The risk of tick bites can be greatly reduced by checking your pet after walks in long grass or woodland
          and using a vet-recommended tick treatment. If your pet seems unwell after a bite, contact your vet.
        </p>
        <a className="btn btn-white" href="https://findavet.rcvs.org.uk/" target="_blank" rel="noreferrer">
          Find a vet
        </a>
      </div>
      {/* Photo by Victor G on Unsplash, background removed so the dog sits on the blue band */}
      <img className="vet-dog" src="/dog.png" alt="" />
    </section>
  )
}