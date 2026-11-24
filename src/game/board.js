// The classic 10 x 10 board: square 1 bottom-left, rows snake back and forth up to 100 at the top-left.
export const FINISH = 100

// The classic layout (the same squares as the well-known 1940s edition)
export const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }
export const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }

// Where a square's center is, in board units (the board is 10 wide; y grows downwards).
// Square 0 is the start pad, under the board.
export function squareXY(n) {
  if (n <= 0) return { x: 0.5, y: 10.62 }
  const row = Math.floor((n - 1) / 10) // 0 = bottom row
  let col = (n - 1) % 10
  if (row % 2 === 1) col = 9 - col // odd rows run right to left
  return { x: col + 0.5, y: 9 - row + 0.5 }
}

// ---- curves: snakes are drawn (and slid down) along the same S-shaped curve ----
const lerp = (a, b, t) => a + (b - a) * t
export function snakeCurve(head, tail, bend = 1) {
  const a = squareXY(head)
  const b = squareXY(tail)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len // perpendicular
  const py = dx / len
  const k = Math.min(1.6, 0.35 + len * 0.16) * bend
  return [a, { x: lerp(a.x, b.x, 0.3) + px * k, y: lerp(a.y, b.y, 0.3) + py * k }, { x: lerp(a.x, b.x, 0.7) - px * k, y: lerp(a.y, b.y, 0.7) - py * k }, b]
}
export function bezier([p0, p1, p2, p3], t) {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}
// each snake bends its own way (alternating), so they don't all look the same
export const SNAKE_LIST = Object.entries(SNAKES).map(([head, tail], i) => ({
  head: Number(head),
  tail,
  bend: i % 2 ? 1 : -1,
  color: ['#16a34a', '#7c3aed', '#ea580c', '#dc2626', '#0d9488', '#ca8a04', '#2563eb', '#db2777', '#65a30d', '#9333ea'][i % 10],
}))
export const LADDER_LIST = Object.entries(LADDERS).map(([foot, top]) => ({ foot: Number(foot), top }))
export const snakeAt = (sq) => SNAKE_LIST.find((s) => s.head === sq)
