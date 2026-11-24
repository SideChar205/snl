// Player colours: main shade, light shade, dark shade (for the 3D pawns)
export const PLAYER_COLORS = {
  red: ['#ef4444', '#fca5a5', '#991b1b'],
  blue: ['#3b82f6', '#93c5fd', '#1e3a8a'],
  green: ['#22c55e', '#86efac', '#14532d'],
  yellow: ['#facc15', '#fef08a', '#854d0e'],
}
export const colorOf = (player, i = 0) => PLAYER_COLORS[player?.color] ?? Object.values(PLAYER_COLORS)[i % 4]
