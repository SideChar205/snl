// The page background: soft jungle light with a few floating leaves
const LEAVES = Array.from({ length: 10 }, (_, i) => ({ left: (i * 37) % 100, delay: (i * 1.7) % 9, size: 18 + ((i * 7) % 16), dur: 14 + ((i * 5) % 9) }))

export default function Background() {
  return (
    <div className="bg-leaves" aria-hidden="true">
      {LEAVES.map((l, i) => (
        <span key={i} style={{ left: `${l.left}%`, '--d': `${l.delay}s`, '--s': `${l.size}px`, '--t': `${l.dur}s` }}>🍃</span>
      ))}
    </div>
  )
}
