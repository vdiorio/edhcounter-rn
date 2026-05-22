export type GameLayout = [number, number, number, number];

export const PLAYER_LAYOUTS: Record<number, [GameLayout, GameLayout]> = {
  1: [
    [0, 0, 0, 1],
    [0, 1, 0, 0],
  ],
  2: [
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  3: [
    [0, 1, 1, 1],
    [0, 1, 2, 0],
  ],
  4: [
    [0, 2, 2, 0],
    [1, 1, 1, 1],
  ],
  5: [
    [0, 2, 2, 1],
    [0, 2, 3, 0],
  ],
  6: [
    [0, 3, 3, 0],
    [1, 2, 2, 1],
  ],
};

export function getPlayerLayout(playerCount: number, alt: boolean): GameLayout {
  const pair = PLAYER_LAYOUTS[playerCount];
  if (!pair) {
    throw new Error(`No layout defined for ${playerCount} players`);
  }
  return pair[alt ? 1 : 0];
}
