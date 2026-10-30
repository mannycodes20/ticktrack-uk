const TIPS = [
  { title: 'Check after every walk', text: 'Run your hands over your pet, paying attention to the head, ears, armpits and between the toes.' },
  { title: 'Use a tick treatment', text: 'Ask your vet which tick treatment suits your pet, and keep it up to date all year.' },
  { title: 'Remove ticks safely', text: 'Use a tick remover tool, twist gently and pull out the whole tick. Do not squeeze it or burn it.' },
  { title: 'Stick to paths', text: 'Ticks wait on long grass and bracken. Keeping to paths lowers the chance of picking one up.' },
  { title: 'Check yourself too', text: 'Ticks bite people as well. Look for a bullseye shaped rash, which can be a sign of Lyme disease.' },
  { title: 'Know when to call the vet', text: 'If your pet is tired, off their food, limping or has a swelling after a bite, contact your vet.' },
]

export function TickTips() {
  return (
    <ul className="tips">
      {TIPS.map((tip, i) => (
        <li key={tip.title}>
          <span className="tip-number" aria-hidden>{i + 1}</span>
          <div>
            <h4>{tip.title}</h4>
            <p>{tip.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}