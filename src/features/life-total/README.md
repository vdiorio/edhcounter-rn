# life-total

Per-player life total with animated deltas and a history log.

## Public API (`index.ts`)

- `createLifeSlice` / `LifeSlice` — store slice owning life mutations. Life,
  delta, and history live on the shared `Player` record (see
  [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)); deltas auto-commit to
  history after an idle window via the core slice's `_scheduleDeltaReset`.
- `Lifetotal` — the large life number for one player.
- `HistorySideBar` — the per-player history panel.
- `useDeltaAnimation` (+ `DELTA_POSITIVE_COLOR`, `DELTA_NEGATIVE_COLOR`,
  `DeltaAnimation`) — fade/color animation for the floating delta.

## Notes

The `delta` field is transient and is **not** persisted (it re-seeds to `0` on
rehydrate). Increment buttons drive life changes via `features/increment-buttons`.
