/**
 * Cardinal directions a player piece can face. Encoded as the degrees the
 * rendered content must be rotated so it points away from the center of the
 * table (toward the human sitting on that edge).
 *
 *  - bottom edge → 0 (no rotation)
 *  - right edge  → 90 (clockwise quarter turn)
 *  - top edge    → 180 (upside down)
 *  - left edge   → -90 (counter-clockwise quarter turn)
 */
export type Direction = 0 | 90 | 180 | -90;

export type LayoutPiece = {
  playerId: number;
  direction: Direction;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type LayoutGeometry = {
  pieces: LayoutPiece[];
  containerWidth: number;
  containerHeight: number;
};

export type GameLayoutTuple = readonly [number, number, number, number];
