# commander-damage

Commander damage tracking per attacker, with an optional life-chain.

## Public API (`index.ts`)

- `createCdmgSlice` / `CdmgSlice` — `dealCommanderDamage({playerId, attackerId,
  value, partner?})` and `togglePlayerChain(playerId)`.
- `CdmgScreen` — full-screen commander-damage view for one target.
- `CdmgBox`, `CdmgIncrementer`, `CdmgSideBar` — board/sidebar pieces.

## Model

Commander damage is stored on the target `Player` as
`Cdmg: Record<attackerId, CommanderDamageEntry>`, where
`CommanderDamageEntry = [commander, partnerCommander]` — the two slots let the
21-damage lethal rule be evaluated per-commander. Damage is clamped to
`[0, CDMG_LIMIT]`.

When a player's **chain** is on, commander damage dealt to them also subtracts
the same amount from their life total (and schedules a delta reset).
