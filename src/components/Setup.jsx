import { useState } from 'react'
import Background from './Background.jsx'
import RulesCard from './RulesCard.jsx'
import Avatar from './Avatar.jsx'
import { COLORS, MAX_PLAYERS } from '../game/rules.js'
import { BOT_NAMES, randomBotName, randomBotNames } from '../game/names.js'

// seat 1 is you; the others start as bots with random names
const startingSeats = () => [{ name: 'Player 1', isBot: false }, ...randomBotNames(MAX_PLAYERS - 1).map((name) => ({ name, isBot: true }))]

export default function Setup({ onStart, onOnline }) {
  const [count, setCount] = useState(3)
  const [seats, setSeats] = useState(startingSeats)
  const active = seats.slice(0, count)
  const humans = active.filter((s) => !s.isBot).length
  const update = (i, patch) => setSeats(seats.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const otherNames = (i) => seats.filter((_, j) => j !== i).map((s) => s.name)

  function makeBot(i) {
    if (!seats[i].isBot) update(i, { isBot: true, name: randomBotName(otherNames(i)) })
  }
  function makeHuman(i) {
    if (seats[i].isBot) update(i, { isBot: false, name: BOT_NAMES.includes(seats[i].name) ? `Player ${i + 1}` : seats[i].name })
  }

  return (
    <div className="setup-page fit">
      <Background />
      <div className="setup-grid">
        <header className="setup-head">
          <h1 className="title compact">Snakes &amp; Ladders</h1>
          <p className="muted">Climb the ladders, dodge the snakes, and be the first to reach 100.</p>
        </header>

        <section className="panel game-panel">
          <h2>Game</h2>
          <RulesCard />
        </section>

        <aside className="panel players-panel">
          <button className="online-banner compact" onClick={onOnline}>
            <span className="online-icon">🌐</span>
            <span>
              <strong>Play online</strong>
              <small>Invite friends with a link or code</small>
            </span>
            <span className="online-arrow">→</span>
          </button>

          <h2>Players on this device</h2>
          <div className="seg">
            {[2, 3, 4].map((n) => (
              <button key={n} className={n === count ? 'active' : ''} onClick={() => setCount(n)}>{n}</button>
            ))}
          </div>

          <ul className="seat-list">
            {active.map((s, i) => (
              <li key={i}>
                <Avatar player={{ ...s, color: COLORS[i] }} index={i} size={34} />
                <input value={s.name} maxLength={12} onChange={(e) => update(i, { name: e.target.value })} />
                {s.isBot && (
                  <button className="dice" title="New random name" onClick={() => update(i, { name: randomBotName(otherNames(i)) })}>🎲</button>
                )}
                <div className="seg small">
                  <button className={!s.isBot ? 'active' : ''} onClick={() => makeHuman(i)}>Human</button>
                  <button className={s.isBot ? 'active' : ''} onClick={() => makeBot(i)}>Bot</button>
                </div>
              </li>
            ))}
          </ul>

          {humans === 0 && <p className="warn">Add at least one human player.</p>}
          {humans > 1 && <p className="muted small">Pass-and-play: take turns on this device. The game shows whose turn it is.</p>}

          <button
            className="btn wide start-btn"
            disabled={humans === 0}
            onClick={() => onStart(active.map((s, i) => ({ name: s.name.trim() || `Player ${i + 1}`, isBot: s.isBot })))}
          >
            Start game
          </button>
        </aside>
      </div>
    </div>
  )
}
