# 05 — Layout Selector

## Purpose
The home screen. User picks a player count (2–6), optionally toggles an alternate layout, and starts a game. The screen contains the player-count wheel, the alt-layout toggle, the `LayoutVisualizer` preview, and a "Start" call-to-action that navigates to `Game`.

## Public API

```ts
// src/features/layout-selector/index.ts
export { LayoutSelectorScreen } from './components/LayoutSelectorScreen';
export { LayoutVisualizer } from './components/LayoutVisualizer';

// LayoutSelectorScreen props
type Props = NativeStackScreenProps<RootStackParamList, 'LayoutSelector'>;

// LayoutVisualizer props
type LayoutVisualizerProps = {
  layout: [number, number, number, number];
  size: number;          // square px
  colors?: string[];     // optional player-color overrides
};
```

## Dependencies
- 02-app-shell (navigation).
- 03-game-store-core (`PLAYER_LAYOUTS` constants).
- 15-theming (player colors for the visualizer).
- 16-i18n (labels).
- 18-shared-ui (`Typography`).
- 14-starting-player-wheel: this spec uses a **custom Reanimated wheel** built in 14 for the player-count picker — react-native-wheely is dropped. If 14 is not yet implemented, a simpler vertical scroll picker is acceptable temporarily, but the final form uses the spec-14 component.

## Behavior spec (TDD anchor)

1. Mount shows a 5-item wheel with values 2..6. Default selected index is 2 (= 4 players).
2. Changing the wheel value updates internal state but does NOT mutate `useGameStore` (no state pollution before Start).
3. `LayoutVisualizer` re-renders to reflect the currently-selected `(playerCount, alt)` pair, showing the layout configuration as labeled boxes around a central area.
4. The "alt" toggle is visible only when the current `playerCount` has an alternate layout. (Some counts have only one layout — check the table.)
5. Toggling "alt" animates the highlight bar via `useSliderAnimation` (spring, damping 40, stiffness 150). Highlight width interpolates `[35%, 40%, 35%]` over the toggle.
6. Tapping Start calls `navigation.navigate('Game', { numPlayers, alt })`.
7. The Start button is disabled until the wheel finishes its initial settle animation.
8. Wheel item height is `50px`. Visible items: selected + 1 above + 1 below (`visibleRest = 1`).

## LayoutVisualizer behavior
- Renders 4 "slots" representing top/right/bottom/left positions.
- Each slot displays as many sub-cells as the layout slot count (e.g., `[1, 2, 1, 2]` → 1 top, 2 right, 1 bottom, 2 left).
- Each sub-cell uses a player color from `StyleStore.playerColors` (mod by index).
- Sub-cells on left/right sides display rotated 90°.
- Borders between sub-cells: 1px `#555` (BORDER constant from `shared/constants/ui.ts`).

## Acceptance tests
- `LayoutSelectorScreen.test.tsx`:
  - Renders with default player count 4.
  - Changing wheel value to 6 and tapping Start fires `navigation.navigate('Game', { numPlayers: 6, alt: false })`.
  - Toggling alt and starting fires with `alt: true`.
  - Start is disabled during the initial settle.
- `LayoutVisualizer.test.tsx`:
  - Given `[1, 2, 1, 2]`, renders 6 sub-cells in the expected slots.
  - Given `playerColors=['#aaa','#bbb',...]`, sub-cells use those colors in order.

## Non-goals
- Does not implement the custom wheel component (that lives in 14).
- Does not navigate to the starting-player wheel — that's done from `GameScreen` (feature 06 wires it).

## Notes for the implementer
- Reference current source: `app/Pages/LayoutSelectorScreen.tsx`, `components/AltOptions/index.tsx`, `components/AltOptions/Components/LayoutVisualizer.tsx`.
- The wheel scale factor in the current build is 0.7 (`scaleFactor`); preserve that visual ratio in the spec-14 component or scale the call site accordingly.
- All animations use `react-native-reanimated` shared values.
- Keep the screen state local — don't push wheel index into Zustand until Start.
