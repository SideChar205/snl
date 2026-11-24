// Helpers for online rooms (the rooms themselves run through the message relay in relay.js)

// Every room has an id: PREFIX + code
export const PREFIX = 'snlpractice-room-'
export const PEER_OPTIONS = {}
export const CONNECT_OPTIONS = { reliable: true, serialization: 'json' }

// This browser's player id: a random id made once and kept in the browser.
// Rooms use it to recognise a player who drops out and comes back (there are no accounts).
const ID_KEY = 'snl-player-id'
let memoryId = null
export function playerId() {
  const make = () => (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`)
  try {
    let id = localStorage.getItem(ID_KEY)
    if (!id) {
      id = make()
      localStorage.setItem(ID_KEY, id)
    }
    return id
  } catch {
    return (memoryId ??= make()) // storage blocked (some private modes): the id lasts until the page is closed
  }
}

export const JOIN_TIMEOUT = 15000 // ms before we tell the guest something is wrong

// 5-character codes without look-alike letters (no 0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const makeCode = () => Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
export const cleanCode = (text) => text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)

// Is `seat` allowed to send this action right now? (the host checks every action from a guest)
export function allowed(game, action, seat) {
  if (!game || game.winner !== null) return false
  return action.type === 'ROLL' && game.current === seat && action.test === undefined // no loaded dice from guests
}
