import type {Direction, GameLayoutTuple, LayoutPiece} from '../types';

/**
 * Pure geometry. Splits an `H × W` container into up to four bands:
 *   top, middle (with left + right columns), bottom.
 * Band heights are weighted so every player gets equal screen area whenever
 * the layout is symmetric (e.g., [1,1,1,1] → top:middle:bottom = 1:2:1).
 * Asymmetric middle bands fall back to a proportional scale. Player ids are
 * assigned in scanline order — top first, then right, then bottom, then left.
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
  if (!hasTop && !hasMiddle && !hasBottom) return [];

  const horizontalCols = (lCount > 0 ? 1 : 0) + (rCount > 0 ? 1 : 0);
  const colWidth = horizontalCols > 0 ? containerWidth / horizontalCols : 0;

  // Weight each band so a single "unit" represents one player's worth of
  // height. Top/bottom rows weigh by their player count. The middle band
  // weighs by the taller side; when both side columns exist (cols=2) we add
  // one extra row of weight so the top/bottom slots don't get squeezed when
  // the sides stack multiple players (5A/6B-style layouts).
  const topWeight = hasTop ? tCount : 0;
  const bottomWeight = hasBottom ? bCount : 0;
  const middleWeight = hasMiddle
    ? Math.max(rCount, lCount) + (horizontalCols === 2 ? 1 : 0)
    : 0;
  const totalWeight = topWeight + middleWeight + bottomWeight;

  const unit = containerHeight / totalWeight;
  const topHeight = topWeight * unit;
  const middleHeight = middleWeight * unit;
  const bottomHeight = bottomWeight * unit;

  const topY = 0;
  const middleY = topHeight;
  const bottomY = topHeight + middleHeight;

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
        height: topHeight,
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
        direction: -90 satisfies Direction,
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
        height: bottomHeight,
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
        direction: 90 satisfies Direction,
        width: colWidth,
        height: slotHeight,
        x: 0,
        y: middleY + i * slotHeight,
      });
    }
  }

  return pieces;
}
