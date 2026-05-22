import type {Direction, GameLayoutTuple, LayoutPiece} from '../types';

/**
 * Pure geometry. Splits an `H × W` container into up to four bands:
 *   top, middle (with left + right columns), bottom.
 * Vertical bands share the height equally; horizontal columns inside the
 * middle band share its width equally. Player ids are assigned in scanline
 * order — top first, then right, then bottom, then left — matching the
 * convention in the original Expo app.
 */
export function computeLayoutPieces(
  layout: GameLayoutTuple,
  containerWidth: number,
  containerHeight: number,
): LayoutPiece[] {
  const [tCount, rCount, bCount, lCount] = layout;

  const hasTop = tCount > 0;
  const hasBottom = bCount > 0;
  const hasMiddle = rCount > 0 || lCount > 0;

  const verticalBands = (hasTop ? 1 : 0) + (hasMiddle ? 1 : 0) + (hasBottom ? 1 : 0);
  if (verticalBands === 0) return [];

  const bandHeight = containerHeight / verticalBands;
  const topY = 0;
  const middleY = hasTop ? bandHeight : 0;
  const bottomY = (hasTop ? bandHeight : 0) + (hasMiddle ? bandHeight : 0);

  const middleHeight = hasMiddle ? bandHeight : 0;
  const horizontalCols = (lCount > 0 ? 1 : 0) + (rCount > 0 ? 1 : 0);
  const colWidth = horizontalCols > 0 ? containerWidth / horizontalCols : 0;

  const pieces: LayoutPiece[] = [];
  let nextId = 0;

  // top row
  if (hasTop) {
    const slotWidth = containerWidth / tCount;
    for (let i = 0; i < tCount; i++) {
      pieces.push({
        playerId: nextId++,
        direction: 180 satisfies Direction,
        width: slotWidth,
        height: bandHeight,
        x: i * slotWidth,
        y: topY,
      });
    }
  }

  // right column (top-to-bottom)
  if (rCount > 0) {
    const slotHeight = middleHeight / rCount;
    const colX = lCount > 0 ? colWidth : 0;
    for (let i = 0; i < rCount; i++) {
      pieces.push({
        playerId: nextId++,
        direction: 90 satisfies Direction,
        width: colWidth,
        height: slotHeight,
        x: colX,
        y: middleY + i * slotHeight,
      });
    }
  }

  // bottom row
  if (hasBottom) {
    const slotWidth = containerWidth / bCount;
    for (let i = 0; i < bCount; i++) {
      pieces.push({
        playerId: nextId++,
        direction: 0 satisfies Direction,
        width: slotWidth,
        height: bandHeight,
        x: i * slotWidth,
        y: bottomY,
      });
    }
  }

  // left column (top-to-bottom)
  if (lCount > 0) {
    const slotHeight = middleHeight / lCount;
    for (let i = 0; i < lCount; i++) {
      pieces.push({
        playerId: nextId++,
        direction: -90 satisfies Direction,
        width: colWidth,
        height: slotHeight,
        x: 0,
        y: middleY + i * slotHeight,
      });
    }
  }

  return pieces;
}
