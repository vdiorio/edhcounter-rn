# 15 — Theming

## Purpose
Provide per-player color palettes (shuffled on game reset) and a global app color scheme (dark / light surfaces, text, accents) via Zustand-backed stores and a `useAppColors` hook.

## Public API

```ts
// src/features/theming/store.ts
export type StyleStore = {
  playerColors: string[];        // length-6 array of hex
  shufflePlayerColors: () => void;
};

export const useStyleStore: UseBoundStore<StoreApi<StyleStore>>;

// src/features/theming/hooks/useAppColors.ts
export type AppColors = {
  background: string;
  surface: string;
  text: string;
  textDim: string;
  border: string;
  accent: string;
  greenMana: string;
  whiteMana: string;
  blackMana: string;
  // ... whatever the current theme.ts exposes
};

export function useAppColors(): AppColors;    // returns the current scheme

// src/features/theming/constants/theme.ts
export const AppColorsByScheme: { dark: AppColors; light: AppColors };

// src/features/theming/index.ts
export { useStyleStore };
export { useAppColors };
export { AppColorsByScheme };
```

### Player color palette
```ts
const PLAYER_COLORS = ['#6699FF', '#00c300', '#FF6666', '#FF66CC', '#9966FF', '#bec400'];
```

## Dependencies
- 01-scaffold (`react-native`'s `useColorScheme` for system theme).

## Behavior spec (TDD anchor)

### useStyleStore
1. On first import, `playerColors` is a length-6 shuffled permutation of `PLAYER_COLORS`.
2. `shufflePlayerColors()` produces a new permutation. (Use Fisher-Yates; verify the permutation set is the same colors.)
3. The store is NOT persisted (a fresh shuffle on every cold start is desired).

### useAppColors
4. Returns `AppColorsByScheme.dark` when system theme is dark.
5. Returns `AppColorsByScheme.light` when system theme is light.
6. (Optional improvement) Honors a user override stored in `preferencesStore` if `preferencesStore.theme === 'dark' | 'light' | 'system'`. If `preferencesStore.theme === 'system'` (default), behave per behaviors 4–5.

### Hook for per-player color
7. A helper `usePlayerColor(playerId): string` returns `playerColors[playerId % 6]`.

## Acceptance tests
- `styleStore.test.ts`: behaviors 1–3.
- `useAppColors.test.tsx`: behaviors 4–5 with `useColorScheme` mocked.
- `usePlayerColor.test.tsx`: returns the right palette index for IDs 0..5.

## Non-goals
- Does not implement a settings UI to change the user's theme — that's part of a future settings spec.
- Does not provide accessibility-mode color contrast variants.

## Notes for the implementer
- Carry over `constants/theme.ts` from the current repo. The full palette set is large but stable; copy it verbatim.
- `PLAYER_COLORS` order matters only as the source for shuffling; the displayed assignment is a permutation.
- `shufflePlayerColors` should be called by `resetGame` (wire this in 03-game-store-core or in the screen-level reset handler) so each new game gets a fresh palette.
- Reference current source: `store/StyleStore.ts`, `hooks/useAppColors.ts`, `constants/theme.ts`.
