// The game engine: a reducer. The UI only sends actions (NEW, ROLL); this file decides what happens.
//
// Classic rules used here:
//  - everyone starts off the board (square 0) and moves the number on one die
//  - land at the foot of a ladder: climb it. Land on a snake's head: slide down to its tail
//  - you must land on 100 exactly. Roll too high and you stay where you are
//  - roll a 6: roll again. Three 6s in a row: back to where you started that turn, and your turn ends
import { FINISH, LADDERS, SNAKES } from './board.js'

export const COLORS = ['red', 'blue', 'green', 'yellow']
export const MAX_PLAYERS = 4

export function newGame(seats) {
  const players = seats.map((p, i) => ({ name: p.name, isBot: !!p.isBot, color: p.color ?? COLORS[i % COLORS.length], pos: 0, ladders: 0, snakes: 0, rolls: 0 }))
  const current = Math.floor(Math.random() * players.length) // a random player starts
  return {
    players,
    current,
    winner: null,
    die: null, // the last roll
    rollId: 0,
    sixes: 0, // 6s rolled in a row this turn
    turnStart: 0, // where the current player stood when their turn began
    move: null, // the last move, for the animation: { id, player, from, die, to, steps, jump, note }
    log: [`${players[current].name} goes first`],
  }
}

const addLog = (s, text) => (s.log = [text, ...s.log].slice(0, 8))

function nextTurn(s) {
  s.sixes = 0
  s.current = (s.current + 1) % s.players.length
  s.turnStart = s.players[s.current].pos
}

function roll(s, forced) {
  const die = forced ?? 1 + Math.floor(Math.random() * 6)
  const p = s.players[s.current]
  if (s.sixes === 0) s.turnStart = p.pos
  s.rollId += 1
  s.die = die
  p.rolls += 1
  const from = p.pos
  const move = { id: s.rollId, player: s.current, from, die, to: from, steps: [], jump: null, note: null, again: false }
  s.move = move
  if (die === 6) s.sixes += 1

  // three 6s in a row: back to where this turn started
  if (die === 6 && s.sixes === 3) {
    p.pos = s.turnStart
    move.to = p.pos
    move.note = 'three-sixes'
    move.jump = { type: 'back', from, to: p.pos }
    addLog(s, `${p.name} rolls a third 6 and goes back to ${p.pos || 'the start'}`)
    nextTurn(s)
    return s
  }

  if (from + die > FINISH) {
    move.note = 'too-high'
    addLog(s, `${p.name} rolls ${die}: needs exactly ${FINISH - from} to finish`)
  } else {
    const land = from + die
    for (let sq = from + 1; sq <= land; sq++) move.steps.push(sq)
    p.pos = land
    if (LADDERS[land]) {
      p.pos = LADDERS[land]
      p.ladders += 1
      move.jump = { type: 'ladder', from: land, to: p.pos }
      addLog(s, `${p.name} rolls ${die} and climbs a ladder from ${land} to ${p.pos}!`)
    } else if (SNAKES[land]) {
      p.pos = SNAKES[land]
      p.snakes += 1
      move.jump = { type: 'snake', from: land, to: p.pos }
      addLog(s, `${p.name} rolls ${die} and slides down a snake from ${land} to ${p.pos}`)
    } else {
      addLog(s, `${p.name} rolls ${die} and moves to ${land}`)
    }
    move.to = p.pos
  }

  if (p.pos === FINISH) {
    s.winner = s.current
    addLog(s, `${p.name} reaches 100 and wins!`)
    return s
  }
  if (die === 6) {
    move.again = true
    addLog(s, `${p.name} rolled a 6 and rolls again`)
    return s
  }
  nextTurn(s)
  return s
}

export function gameReducer(state, action) {
  if (action.type === 'NEW') return newGame(action.seats)
  if (action.type === 'QUIT') return null
  if (!state || state.winner !== null) return state
  const s = structuredClone(state) // work on a copy, never change the old state
  switch (action.type) {
    case 'ROLL':
      return roll(s, action.test) // action.test: a fixed roll, only used by the tests
    default:
      return state
  }
}
