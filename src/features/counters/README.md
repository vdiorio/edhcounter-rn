# counters

Poison, energy, and experience counters per player.

## Public API (`index.ts`)

- `createCountersSlice` / `CountersSlice` — increment/clamp actions for the
  `poison`, `energy`, and `experience` fields on the shared `Player` record
  (counts never go below 0).
- `CountersTopBar` — compact readout shown along the top of a player box; tap
  opens the counters editor sidebar.
- `CountersSideBar` — the editor panel for adjusting each counter.

## Notes

These counters are the inputs the `proliferate` cross-slice action reads from
(energy/experience for self, poison across opponents).
