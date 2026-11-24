# Snakes & Ladders

The classic race to square 100. Climb the ladders, dodge the snakes. Play against bots, pass-and-play on one
device, or online with friends.

## Run it

```
npm install
npm run dev
```

It opens at http://localhost:5177 (5173 = portfolio, 5174 = hr-system, 5175 = uno, 5176 = landlord).
Friends on the same Wi-Fi can open your network address, which the dev server prints.

## Rules (classic)

- 2 to 4 players. Everyone starts off the board, and a random player goes first.
- Roll one die and move that many squares.
- Land at the foot of a ladder: climb it. Land on a snake's head: slide down to its tail.
- Roll a 6: roll again. Three 6s in a row: back to where your turn started, and your turn ends.
- You must land on 100 exactly. Roll too high and you stay where you are.

The board uses the classic layout: 9 ladders (1→38, 4→14, 9→31, 21→42, 28→84, 36→44, 51→67, 71→91, 80→100)
and 10 snakes (16→6, 47→26, 49→11, 56→53, 62→19, 64→60, 87→24, 93→73, 95→75, 98→78).

## Online

Click **Play online**, create a room and send the invite link (or the 5-letter code: people who type the code
have to be let in by the host). Rooms run through a public message relay, the same way as the UNO game, so they
work on any network and in any browser. The host's browser runs the game and the bots; if a guest drops out a
bot takes over, and they can rejoin from the same browser.

## Code

- `src/game/board.js`: the board layout, square positions, and the snake curves
- `src/game/rules.js`: the game engine (a reducer: `NEW`, `ROLL`)
- `src/components/Board.jsx`: the board in SVG (squares, ladders, snakes, pawns)
- `src/components/Game.jsx`: the table, the move animation (die, step by step, then the snake or ladder), bots
- `src/components/Die.jsx`: the 3D die
- `src/online/`: online rooms (relay, room code and invite links, waiting room)
