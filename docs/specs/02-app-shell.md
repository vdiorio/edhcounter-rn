# 02 — App Shell & Navigation

## Purpose
Provide the application entry point: render `NavigationContainer`, register the native stack with `LayoutSelector`, `Game`, and `Cdmg` routes, mount global providers (gesture handler, safe area, i18n init, keep-awake on Game), and hide the bootsplash once the navigator is ready. Replaces the role of `expo-router` and the current `ScreenStore`.

## Public API

```ts
// src/app/navigation/types.ts
export type RootStackParamList = {
  LayoutSelector: undefined;
  Game: { numPlayers: number; alt?: boolean };
  Cdmg: { targetPlayerId: number };
};

// src/app/navigation/RootNavigator.tsx
export function RootNavigator(): JSX.Element;

// src/app/App.tsx
export default function App(): JSX.Element;
```

`useNavigation<NativeStackNavigationProp<RootStackParamList>>()` and `useRoute<RouteProp<RootStackParamList, 'X'>>()` are the import sites for screens.

## Dependencies
- 01-scaffold (built project, deps installed).
- 16-i18n (called once at boot — feature 16 exposes an `initI18n()` that is awaited before render).
- 15-theming (StyleStore used by some screens; not required for boot but the provider tree is established here).
- 18-shared-ui (`AppModal` for the back-press confirmation dialog).

## Behavior spec (TDD anchor)

1. App renders `NavigationContainer` with `RootNavigator` as the only child.
2. Initial route is `LayoutSelector`.
3. `LayoutSelector` renders without a header.
4. `Game` renders without a header. Hardware back press shows an `AppModal` confirmation; "Yes" calls `useGameStore.getState().resetGame()` and navigates back to `LayoutSelector`.
5. `Cdmg` renders without a header. Hardware back press returns to `Game` with no state change.
6. `useKeepAwake()` is active while the `Game` route is focused; deactivated when blurred.
7. The bootsplash is hidden after `NavigationContainer.onReady` fires.
8. `react-native-system-navigation-bar` sets nav bar to `#1e1d22` once on app mount.
9. The root view is wrapped in `GestureHandlerRootView` and `SafeAreaProvider`.
10. `i18n.init()` resolves before the first render of `LayoutSelector` (use a Suspense or a tiny loading view; never blank-flash the home screen).

## Acceptance tests
- `App.test.tsx`: renders without throwing; finds the `LayoutSelector` screen.
- `RootNavigator.test.tsx`: routes resolve; passing `{ numPlayers: 4 }` to `Game` is reflected in `useRoute().params`.
- `App.back.test.tsx`: hardware back on `Game` triggers the confirm modal; on confirm, navigation pops to `LayoutSelector` and `resetGame` is called once.

## Non-goals
- Does not render screen content beyond stubs; each screen's content is in its own feature spec.
- Does not implement `useKeepAwake` itself — uses `react-native-keep-awake` directly.
- No deep linking config (not needed for this app).

## Notes for the implementer
- `RootNavigator` configures `headerShown: false` globally and per-route `animation: 'slide_from_right'` (default native stack).
- `Game` screen reads `numPlayers` from `route.params` on mount and calls `useGameStore.getState().setNumPlayers({ playerCount, alt })` — the store is the source of truth thereafter.
- The hardware back interception on `Game` uses `BackHandler.addEventListener('hardwareBackPress', ...)`. Return `true` while the confirm modal is open; on confirm, reset and pop.
- Keep `App.tsx` tiny — provider tree + navigator only. No business logic.
