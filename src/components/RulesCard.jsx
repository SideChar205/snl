import { LADDERS, SNAKES } from '../game/board.js'

// The rules, shown on the start screen and in the online room
export default function RulesCard() {
  return (
    <div className="rules-card">
      <div className="rules-art" aria-hidden="true">
        <span>🪜</span>
        <span>🐍</span>
        <span>🎲</span>
      </div>
      <h3>Classic</h3>
      <p className="muted">The race to square 100 on the classic board: {Object.keys(LADDERS).length} ladders and {Object.keys(SNAKES).length} snakes.</p>
      <ul className="rules-list">
        <li>Everyone starts off the board. Roll the die and move that many squares.</li>
        <li>Land at the foot of a <b>ladder</b>: climb up it.</li>
        <li>Land on a <b>snake's head</b>: slide down to its tail.</li>
        <li>Roll a <b>6</b>: roll again. Three 6s in a row sends you back to where your turn started.</li>
        <li>You must land on <b>100 exactly</b>. Roll too high and you stay put.</li>
      </ul>
      <p className="muted small">2 to 4 players. Any seat can be a bot.</p>
    </div>
  )
}
