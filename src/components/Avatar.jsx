import { COLORS } from '../game/rules.js'
import { PLAYER_COLORS } from '../game/colors.js'

// A round badge in the player's colour: a robot face for bots, the first letter for people
export default function Avatar({ player, index = 0, active, size = 48 }) {
  const [main, light, dark] = PLAYER_COLORS[player.color ?? COLORS[index % COLORS.length]]
  return (
    <div
      className={`avatar${active ? ' active' : ''}`}
      style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, ${light}, ${main} 55%, ${dark})` }}
    >
      {player.isBot ? (
        <svg viewBox="0 0 40 40" width="68%" height="68%" aria-hidden="true">
          <line x1="20" y1="4" x2="20" y2="10" stroke="#1f2937" strokeWidth="2" />
          <circle cx="20" cy="4" r="2.5" fill="#fde047" />
          <rect x="7" y="10" width="26" height="22" rx="8" fill="#1f2937" />
          <circle cx="15" cy="20" r="3" fill="#fde047" />
          <circle cx="25" cy="20" r="3" fill="#fde047" />
          <path d="M15 26 Q20 29 25 26" stroke="#fde047" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="avatar-letter" style={{ fontSize: size * 0.45 }}>{player.name.trim()[0]?.toUpperCase() ?? '?'}</span>
      )}
    </div>
  )
}
