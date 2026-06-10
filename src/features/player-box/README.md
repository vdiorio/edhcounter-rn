# player-box

Composition only — assembles every per-player feature into one board cell.

## Public API (`index.ts`)

- `PlayerBox` — renders, for one `playerId`: the sliding sidebar slot, counters
  top bar (tap to open the counters editor), life total, increment buttons,
  monarch/initiative status bar, the utility sidebar, and the starting-player
  highlight + confetti.

## Notes

This feature owns **no state**. It imports the participating features through
their barrels (`life-total`, `increment-buttons`, `counters`,
`monarch-initiative`, `sidebar-shell`, `starting-player-wheel`). The only local
logic is the short confetti delay when this player becomes the starting player.
