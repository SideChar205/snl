import { useEffect, useState } from 'react'
import Board from './Board.jsx'
import Die from './Die.jsx'
import Avatar from './Avatar.jsx'
import Background from './Background.jsx'
import { squareXY, snakeCurve, bezier, snakeAt } from '../game/board.js'

// timings of the move animation (ms)
const DIE_MS = 900 // the die tumbles, then the pawn starts walking
const STEP_MS = 240 // one square
const SLIDE_MS = { snake: 1100, ladder: 800, back: 700 }
const BOT_DELAY = 600

const replace = (arr, i, v) => arr.map((x, j) => (j === i ? v : x))
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

// Plays the last move one step at a time: the die, the walk square by square, then the snake or ladder.
// Returns what the board should show right now, and whether an animation is still running.
function useMoveAnimation(game) {
  const [shown, setShown] = useState(() => game.players.map((p) => p.pos))
  const [slide, setSlide] = useState(null) // { player, x, y } while riding a snake or ladder
  const [busy, setBusy] = useState(false)
  const [hops, setHops] = useState(() => game.players.map(() => 0)) // bumps on every step, to replay the hop
  const [toast, setToast] = useState(null)
  const move = game.move

  useEffect(() => {
    if (!move) {
      setShown(game.players.map((p) => p.pos))
      setSlide(null)
      setBusy(false)
      return
    }
    let cancelled = false
    let frame = 0
    const timers = []
    const at = (ms, fn) => timers.push(setTimeout(() => !cancelled && fn(), ms))
    const p = move.player
    setBusy(true)
    setSlide(null)
    setToast(null)
    // everyone else is where the game says; the mover starts from where they were
    setShown(game.players.map((pl, i) => (i === p ? move.from : pl.pos)))

    let t = DIE_MS
    for (const sq of move.steps) {
      at(t, () => {
        setShown((s) => replace(s, p, sq))
        setHops((h) => replace(h, p, h[p] + 1))
      })
      t += STEP_MS
    }
    if (move.note === 'too-high') at(t, () => setToast({ kind: 'warn', text: `Needs exactly ${100 - move.from}` }))

    const j = move.jump
    if (j) {
      t += 200
      const kind = j.type
      at(t, () => {
        setToast(kind === 'snake' ? { kind: 'snake', text: 'Hiss! Down the snake' } : kind === 'ladder' ? { kind: 'ladder', text: 'Up the ladder!' } : { kind: 'warn', text: 'Three 6s! Back you go' })
        // the path: along the snake's curve, or straight up the ladder
        const snake = kind === 'snake' && snakeAt(j.from)
        const a = squareXY(j.from)
        const b = squareXY(j.to)
        const point = (u) => (snake ? bezier(snakeCurve(snake.head, snake.tail, snake.bend), u) : { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u })
        const start = performance.now()
        const run = (now) => {
          if (cancelled) return
          const u = Math.min(1, (now - start) / SLIDE_MS[kind])
          setSlide({ player: p, ...point(kind === 'snake' ? u : ease(u)) })
          if (u < 1) frame = requestAnimationFrame(run)
        }
        frame = requestAnimationFrame(run)
      })
      t += SLIDE_MS[kind] + 60
      at(t, () => {
        setSlide(null)
        setShown((s) => replace(s, p, move.to))
        setHops((h) => replace(h, p, h[p] + 1))
      })
    }
    at(t + 150, () => {
      setShown(game.players.map((pl) => pl.pos))
      if (move.again && game.winner === null) setToast({ kind: 'six', text: 'Rolled a 6: roll again!' })
      setBusy(false)
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
    }
  }, [move?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // the toast fades on its own
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  return { shown, slide, busy, hops, toast }
}

export default function Game({ game, dispatch, onRestart, onQuit, onBackToRoom, online }) {
  const { players, current, winner } = game
  const { shown, slide, busy, hops, toast } = useMoveAnimation(game)
  const runBots = !online || online.isHost // online, only the host's browser runs the bots
  const me = online ? online.seat : null
  const cur = players[current]
  const over = winner !== null && !busy
  const myTurn = !busy && winner === null && !cur.isBot && (online ? me === current : true)

  // bots roll after a short pause, once the last move has finished playing
  useEffect(() => {
    if (busy || winner !== null || !cur.isBot || !runBots) return
    const t = setTimeout(() => dispatch({ type: 'ROLL' }), BOT_DELAY)
    return () => clearTimeout(t)
  }, [busy, winner, current, cur.isBot, runBots, game.rollId, dispatch])

  // space bar or Enter rolls when it's your turn
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && myTurn && !e.target.closest?.('input, button')) {
        e.preventDefault()
        dispatch({ type: 'ROLL' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [myTurn, dispatch])

  useEffect(() => {
    document.title = myTurn ? '● Your turn! | Snakes & Ladders' : 'Snakes & Ladders'
  }, [myTurn])

  const whoseTurn = winner !== null ? null : online && me === current ? 'Your turn' : `${cur.name}'s turn`
  const status = busy ? (game.move ? `${players[game.move.player].name} rolled ${game.move.die}` : '') : winner !== null ? '' : myTurn ? 'Roll the die!' : cur.isBot ? `${cur.name} is rolling…` : `Waiting for ${cur.name}…`
  const ranking = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.pos - a.pos)

  return (
    <div className="game-page">
      <Background />
      <div className="game-layout">
        <div className="board-wrap">
          <Board players={players} shown={shown} slide={slide} current={winner ?? current} hops={hops} />
          {toast && <div key={toast.text + game.rollId} className={`toast ${toast.kind}`}>{toast.text}</div>}
        </div>

        <aside className="side">
          <header className="side-head">
            <h1>Snakes &amp; Ladders</h1>
            {online?.code && <span className="room-chip" title="Room code">{online.code}</span>}
            <button className="btn-ghost" onClick={onQuit}>{online ? 'Leave' : 'Quit'}</button>
          </header>

          <section className={`turn-card${myTurn ? ' mine' : ''}`}>
            {whoseTurn && (
              <div className="turn-name">
                <Avatar player={cur} index={current} size={30} active />
                <span>{whoseTurn}</span>
              </div>
            )}
            <div className="dice-tray">
              {/* a new key for every roll replays the throw */}
              <Die key={game.rollId} value={game.die} rolling={game.rollId > 0} seed={game.rollId} />
            </div>
            <button className="btn wide roll-btn" disabled={!myTurn} onClick={() => dispatch({ type: 'ROLL' })}>
              {myTurn ? '🎲 Roll' : status || 'Roll'}
            </button>
            {myTurn && <p className="hint">or press Space</p>}
          </section>

          <section className="players-card">
            <h2>Players</h2>
            <ul>
              {players.map((p, i) => (
                <li key={i} className={i === current && winner === null ? 'active' : ''}>
                  <Avatar player={p} index={i} size={32} active={i === current && winner === null} />
                  <span className="pl-name">
                    {p.name}
                    {online && i === me && <span className="you-tag">YOU</span>}
                    {p.isBot && <span className="bot-tag">BOT</span>}
                  </span>
                  <span className="pl-stats" title="Ladders climbed / snakes hit">🪜{p.ladders} 🐍{p.snakes}</span>
                  <span className="pl-square" title="Square">{shown[i] || 'Start'}</span>
                </li>
              ))}
            </ul>
          </section>

          <ul className="log">
            {game.log.slice(0, 5).map((m, i) => (
              <li key={`${game.rollId}-${i}`}>{m}</li>
            ))}
          </ul>
        </aside>
      </div>

      {over && (
        <div className="overlay">
          <div className="win-card">
            <div className="trophy">🏆</div>
            <h2>{online && winner === me ? 'You win!' : `${players[winner].name} wins!`}</h2>
            <ol className="ranking">
              {ranking.map((p) => (
                <li key={p.i}>
                  <Avatar player={p} index={p.i} size={28} />
                  <span>{p.name}</span>
                  <small>square {p.pos} · 🪜{p.ladders} 🐍{p.snakes} · {p.rolls} rolls</small>
                </li>
              ))}
            </ol>
            <div className="row">
              {onRestart && <button className="btn" onClick={onRestart}>Play again</button>}
              {onBackToRoom && <button className="btn-ghost" onClick={onBackToRoom}>Back to the room</button>}
              <button className="btn-ghost" onClick={onQuit}>{online ? 'Leave' : 'Menu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
