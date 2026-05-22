# 18 — Shared UI Primitives

## Purpose
Reusable cross-feature UI building blocks: `AppModal` (full-screen modal with backdrop), `Typography` (animated theme-aware text), and `AutoAdjustableView` (Reanimated container that collapses to 0 on exit). Also the shared animation hooks (`useSliderAnimation`, `useAutoAdjustmentAnimation`).

## Public API

```ts
// src/shared/ui/AppModal.tsx
type AppModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  children: ReactNode;
};

export function AppModal(props: AppModalProps): JSX.Element;

// src/shared/ui/Typography/index.tsx
type TypographyProps = AnimatedTextProps & {
  variant?: 'body' | 'title' | 'label';
  color?: string;
};

export function Typography(props: TypographyProps): JSX.Element;

// src/shared/animations/AutoAdjustableView.tsx
type AutoAdjustableViewProps = {
  shouldExit: boolean;            // when true, animate width/height to 0
  children: ReactNode;
  duration?: number;              // default AUTO_ADJUST = 600 ms
};

// src/shared/animations/hooks.ts
export function useSliderAnimation(active: boolean): {
  highlightWidth: SharedValue<number>;
  highlightLeft: SharedValue<number>;
};

export function useAutoAdjustmentAnimation(shouldExit: boolean, duration?: number): {
  width: SharedValue<number>;
  height: SharedValue<number>;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
};
```

### Shared constants
```ts
// src/shared/constants/ui.ts
export const LIFE_FONT_SIZE = 48;
export const DELTA_FACTOR = 0.333;
export const ICON_FACTOR = 0.25;
export const STANDARD_DURATION = 300;
export const INITIAL_DELAY = 700;
export const ENTRY_FADE = 1000;
export const DELTA_ANIMATION = 100;
export const OPACITY_TRANSITION = 200;
export const HOLD_INTERVAL = 100;
export const AUTO_ADJUST = 600;
export const SLIDER_TOGGLE = 300;
export const BORDER_COLOR = '#555555';
export const DEFAULT_PLAYER_COLOR = '#00c1f1';
export const CHAIN_ACTIVE_COLOR = '#70e700ff';
```

## Dependencies
- 01-scaffold.
- 15-theming (`Typography` reads `useAppColors`).

## Behavior spec (TDD anchor)

### AppModal
1. When `visible === true`, renders a darkened backdrop covering the full screen and a centered content container.
2. When `visible === false`, renders nothing.
3. The backdrop absorbs touches (does not propagate to underlying screen).
4. Tapping the backdrop calls `onRequestClose`.
5. Title (if provided) is rendered above children.
6. Hardware back press calls `onRequestClose` (Android).

### Typography
7. Renders `Animated.Text` with color from `useAppColors().text` (or the dim variant if `variant === 'label'`).
8. `color` prop overrides theme color.
9. Variants pick different font sizes (define in `theme.ts`): `title = 24`, `body = 14`, `label = 12`.
10. All other props pass through to `Animated.Text`.

### AutoAdjustableView
11. When `shouldExit === false`, renders at natural dimensions with `opacity: 1`, `scale: 1`.
12. When `shouldExit === true`, animates width/height/opacity/scale to 0 over `duration` ms (default 600).
13. Once `scale === 0`, sets `display: 'none'` to remove from layout.
14. Re-entering (`shouldExit` flips back to false) reverses the animation.

### useSliderAnimation
15. Spring config: `damping: 40`, `stiffness: 150`.
16. `highlightWidth` interpolates `[35%, 40%, 35%]` over the toggle (mid-transition has a wider highlight to "stretch" between positions).
17. `highlightLeft` interpolates between left and right anchor positions.

## Acceptance tests
- `AppModal.test.tsx`: behaviors 1–6.
- `Typography.test.tsx`: behaviors 7–10.
- `AutoAdjustableView.test.tsx`: behaviors 11–14 with Reanimated mocked.
- `useSliderAnimation.test.ts`: behaviors 15–17 with mocked clock.

## Non-goals
- Not a design system. These are utility primitives, not a full component library.
- No accessibility polish beyond passing through props.

## Notes for the implementer
- `AppModal` uses React Native's built-in `Modal` for the backdrop, but the inner container is a Reanimated view so it can be animated by callers.
- `Typography` should ideally support i18n out of the box — i.e., callers pass `t('key')` results, not raw strings. Document this expectation.
- Reference current source: `components/ui/AppModal.tsx`, `components/ui/Typography/index.tsx`, `components/ui/Animations/AutoAdjustableView/index.tsx`, `components/ui/Animations/hooks.tsx`.
