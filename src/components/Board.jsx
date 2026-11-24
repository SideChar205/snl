import { memo } from 'react'
import { SNAKE_LIST, LADDER_LIST, squareXY, snakeCurve, bezier } from '../game/board.js'
import { PLAYER_COLORS } from '../game/colors.js'

// The board is drawn in "board units": every square is 1 x 1, the grid is 10 x 10,
// and the start pad sits under the grid (y 10.1 to 11.1).

// each row has its own colour, in a light/dark checker, like the old cardboard boards
const ROW_COLORS = [
  ['#fde68a', '#fcd34d'],
  ['#fecaca', '#fca5a5'],
  ['#bbf7d0', '#86efac'],
  ['#bfdbfe', '#93c5fd'],
  ['#fbcfe8', '#f9a8d4'],
]

function Squares() {
  const cells = []
  for (let n = 1; n <= 100; n++) {
    const { x, y } = squareXY(n)
    const row = Math.floor((n - 1) / 10)
    const col = Math.floor(x)
    const fill = ROW_COLORS[row % ROW_COLORS.length][(row + col) % 2]
    cells.push(
      <g key={n}>
        <rect x={x - 0.5} y={y - 0.5} width="1" height="1" fill={fill} />
        <text x={x - 0.42} y={y - 0.26} className="sq-num">{n}</text>
      </g>,
    )
  }
  return <g>{cells}</g>
}

// ---- ladders: two wooden rails with rungs ----
function Ladder({ foot, top }) {
  const a = squareXY(foot)
  const b = squareXY(top)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const px = -uy * 0.17 // half the ladder's width, sideways
  const py = ux * 0.17
  // start a little past the centre of each square so the ends sit inside the squares
  const s = { x: a.x - ux * 0.2, y: a.y - uy * 0.2 }
  const e = { x: b.x + ux * 0.2, y: b.y + uy * 0.2 }
  const total = len + 0.4
  const rungs = []
  for (let d = 0.28; d < total - 0.1; d += 0.34) {
    const cx = s.x + ux * d
    const cy = s.y + uy * d
    rungs.push(<line key={d} x1={cx + px} y1={cy + py} x2={cx - px} y2={cy - py} />)
  }
  const rails = (
    <>
      <line x1={s.x + px} y1={s.y + py} x2={e.x + px} y2={e.y + py} />
      <line x1={s.x - px} y1={s.y - py} x2={e.x - px} y2={e.y - py} />
    </>
  )
  return (
    <g className="ladder">
      <g className="ladder-shadow" transform="translate(.07 .1)">
        {rails}
        {rungs}
      </g>
      <g className="ladder-rungs">{rungs}</g>
      <g className="ladder-rails">{rails}</g>
      <g className="ladder-shine">{rails}</g>
    </g>
  )
}

// ---- snakes: a tapered body along an S-curve, with markings, eyes and a tongue ----
function Snake({ head, tail, bend, color }) {
  const curve = snakeCurve(head, tail, bend)
  const N = 48
  const pts = Array.from({ length: N + 1 }, (_, i) => bezier(curve, i / N))
  const width = (t) => 0.34 * (1 - t) + 0.06 * t - (t < 0.06 ? (0.06 - t) * 1.2 : 0) // a little neck behind the head
  const left = []
  const right = []
  const marks = []
  pts.forEach((p, i) => {
    const q = pts[Math.min(N, i + 1)]
    const r = pts[Math.max(0, i - 1)]
    const tx = q.x - r.x
    const ty = q.y - r.y
    const l = Math.hypot(tx, ty) || 1
    const nx = -ty / l
    const ny = tx / l
    const w = Math.max(0.03, width(i / N)) / 2
    left.push(`${(p.x + nx * w).toFixed(3)},${(p.y + ny * w).toFixed(3)}`)
    right.unshift(`${(p.x - nx * w).toFixed(3)},${(p.y - ny * w).toFixed(3)}`)
    if (i > 3 && i < N - 2 && i % 3 === 0) {
      const angle = (Math.atan2(ty, tx) * 180) / Math.PI
      marks.push(<ellipse key={i} cx={p.x} cy={p.y} rx={w * 0.55} ry={w * 0.85} transform={`rotate(${angle} ${p.x} ${p.y})`} />)
    }
  })
  const body = `M${left.join(' L')} L${right.join(' L')} Z`
  // the head points away from the body
  const h = pts[0]
  const n1 = pts[3]
  const hAngle = (Math.atan2(h.y - n1.y, h.x - n1.x) * 180) / Math.PI
  return (
    <g className="snake" style={{ '--snake': color }}>
      <path d={body} className="snake-shadow" transform="translate(.06 .09)" />
      <path d={body} className="snake-body" fill={color} />
      <g className="snake-marks">{marks}</g>
      <path d={body} className="snake-shine" />
      <g transform={`translate(${h.x} ${h.y}) rotate(${hAngle})`}>
        <path d="M.2 0 L.42 0 M.42 0 L.5 -.05 M.42 0 L.5 .05" className="snake-tongue" />
        <ellipse cx="0" cy="0" rx=".25" ry=".2" fill={color} className="snake-head" />
        <ellipse cx="-.02" cy="0" rx=".18" ry=".11" className="snake-head-shine" />
        <circle cx=".08" cy="-.09" r=".055" fill="#fff" />
        <circle cx=".08" cy=".09" r=".055" fill="#fff" />
        <circle cx=".1" cy="-.09" r=".028" fill="#111" />
        <circle cx=".1" cy=".09" r=".028" fill="#111" />
      </g>
    </g>
  )
}

// the static part of the board never changes, so it's drawn once
const BoardArt = memo(function BoardArt() {
  return (
    <>
      <rect x="-0.22" y="-0.22" width="10.44" height="11.44" rx="0.3" className="board-frame" />
      <Squares />
      <rect x="0" y="0" width="10" height="10" className="grid-edge" />
      <g className="finish-flag">
        <text x="0.5" y="0.72" textAnchor="middle">🏆</text>
      </g>
      <g className="start-pad">
        <rect x="0" y="10.12" width="10" height="0.98" rx="0.18" />
        <text x="9.7" y="10.72" textAnchor="end">START ↑ square 1</text>
      </g>
      {LADDER_LIST.map((l) => (
        <Ladder key={l.foot} {...l} />
      ))}
      {SNAKE_LIST.map((s) => (
        <Snake key={s.head} {...s} />
      ))}
    </>
  )
})

// a pawn: shiny head, round body, flat base
function Pawn({ x, y, color, active, sliding, hopKey }) {
  const [main, light, dark] = PLAYER_COLORS[color]
  return (
    <g className={`pawn${active ? ' active' : ''}${sliding ? ' sliding' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <ellipse cx="0" cy=".2" rx=".26" ry=".09" className="pawn-shadow" />
      {active && <ellipse cx="0" cy=".18" rx=".32" ry=".12" className="pawn-ring" />}
      <g key={hopKey} className="pawn-body">
        <ellipse cx="0" cy=".15" rx=".22" ry=".08" fill={dark} />
        <path d="M-.21 .14 C-.19 .02 -.1 -.06 -.08 -.14 L.08 -.14 C.1 -.06 .19 .02 .21 .14 Z" fill={`url(#pawn-${color})`} stroke={dark} strokeWidth=".02" />
        <circle cx="0" cy="-.2" r=".13" fill={`url(#pawnhead-${color})`} stroke={dark} strokeWidth=".02" />
        <ellipse cx="-.04" cy="-.25" rx=".04" ry=".025" fill="#fff" opacity=".8" />
      </g>
      <title>{color}</title>
      <desc>{main}{light}</desc>
    </g>
  )
}

// small offsets so several pawns on one square don't hide each other
const SPREAD = [
  [[0, 0]],
  [[-0.2, 0.05], [0.2, -0.05]],
  [[-0.22, 0.12], [0.22, 0.12], [0, -0.14]],
  [[-0.22, 0.14], [0.22, 0.14], [-0.22, -0.16], [0.22, -0.16]],
]

export default function Board({ players, shown, slide, current, hops }) {
  // where each pawn stands: on its square (spread out if shared), or along a snake/ladder while sliding
  const bySquare = {}
  shown.forEach((sq, i) => {
    if (slide?.player === i) return
    ;(bySquare[sq] ??= []).push(i)
  })
  const spots = players.map((_, i) => {
    if (slide?.player === i) return { x: slide.x, y: slide.y }
    const sq = shown[i]
    if (sq === 0) return { x: 0.5 + i * 0.62, y: 10.6 } // each player has a spot on the start pad
    const { x, y } = squareXY(sq)
    const group = bySquare[sq]
    const [ox, oy] = SPREAD[Math.min(group.length, 4) - 1][group.indexOf(i)] ?? [0, 0]
    return { x: x + ox, y: y + oy }
  })
  // draw the current player's pawn last, so it's on top
  const order = players.map((_, i) => i).sort((a, b) => (a === current) - (b === current) || spots[a].y - spots[b].y)

  return (
    <svg className="board" viewBox="-0.3 -0.3 10.6 11.6" role="img" aria-label="Snakes and Ladders board">
      <defs>
        {Object.entries(PLAYER_COLORS).map(([name, [main, light, dark]]) => (
          <g key={name}>
            <linearGradient id={`pawn-${name}`} x1="0" x2="1">
              <stop offset="0" stopColor={dark} />
              <stop offset=".35" stopColor={light} />
              <stop offset=".6" stopColor={main} />
              <stop offset="1" stopColor={dark} />
            </linearGradient>
            <radialGradient id={`pawnhead-${name}`} cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#fff" />
              <stop offset=".25" stopColor={light} />
              <stop offset=".7" stopColor={main} />
              <stop offset="1" stopColor={dark} />
            </radialGradient>
          </g>
        ))}
      </defs>
      <BoardArt />
      {order.map((i) => (
        <Pawn key={i} {...spots[i]} color={players[i].color} active={i === current} sliding={slide?.player === i} hopKey={hops[i]} />
      ))}
    </svg>
  )
}
