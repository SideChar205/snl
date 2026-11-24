// One real 3D die (a CSS cube). key={rollId} on this component replays the throw.
const PIPS = { 1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] }
// how to turn the cube so a number faces the viewer
const UP = { 1: [0, 0], 2: [-90, 0], 3: [0, -90], 4: [0, 90], 5: [90, 0], 6: [0, 180] }

export default function Die({ value, rolling, seed = 0 }) {
  const [sx, sy] = UP[value ?? 1]
  const spinX = (seed % 2 ? 1 : -1) * 720
  const spinY = (seed % 3 ? 1 : -1) * 540
  return (
    <div className={`die-box${rolling ? ' rolling' : ''}${value ? '' : ' idle'}${value === 6 ? ' six' : ''}`}>
      <span className="die-shadow" />
      <div className="die-hop">
        <div className="die" style={{ '--sx': `${sx}deg`, '--sy': `${sy}deg`, '--spx': `${spinX}deg`, '--spy': `${spinY}deg` }}>
          <div className="die-core" />
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={`die-face f${n}`}>
              {Array.from({ length: 9 }, (_, k) => (
                <span key={k} className={PIPS[n].includes(k + 1) ? 'pip' : 'pip off'} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
