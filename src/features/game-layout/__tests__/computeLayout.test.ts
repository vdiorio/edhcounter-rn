import {computeLayoutPieces} from '../utils/computeLayout';
import type {GameLayoutTuple} from '../types';

const W = 360;
const H = 800;

function piecesOf(layout: GameLayoutTuple) {
  return computeLayoutPieces(layout, W, H);
}

describe('computeLayoutPieces — player count + directions', () => {
  it('[0,2,2,0] (4-player default): 2 right pieces facing -90, 2 bottom pieces facing 0', () => {
    const pieces = piecesOf([0, 2, 2, 0]);
    expect(pieces).toHaveLength(4);

    const right = pieces.filter(p => p.direction === -90);
    const bottom = pieces.filter(p => p.direction === 0);
    expect(right).toHaveLength(2);
    expect(bottom).toHaveLength(2);
    expect(pieces.some(p => p.direction === 180)).toBe(false);
    expect(pieces.some(p => p.direction === 90)).toBe(false);
  });

  it('[1,1,1,1] (4-alt): exactly one piece per direction', () => {
    const pieces = piecesOf([1, 1, 1, 1]);
    const directions = pieces.map(p => p.direction).sort((a, b) => a - b);
    expect(directions).toEqual([-90, 0, 90, 180]);
  });

  it('[0,2,0,2] (4-player wide): no top, no bottom, 2 left + 2 right', () => {
    const pieces = piecesOf([0, 2, 0, 2]);
    expect(pieces).toHaveLength(4);
    expect(pieces.filter(p => p.direction === -90)).toHaveLength(2);
    expect(pieces.filter(p => p.direction === 90)).toHaveLength(2);
    expect(pieces.filter(p => p.direction === 0)).toHaveLength(0);
    expect(pieces.filter(p => p.direction === 180)).toHaveLength(0);
  });
});

describe('computeLayoutPieces — playerId assignment (scanline: top → right → bottom → left)', () => {
  it('[1,1,1,1] assigns ids 0..3 in top, right, bottom, left order', () => {
    const pieces = piecesOf([1, 1, 1, 1]);
    const byDir = Object.fromEntries(pieces.map(p => [p.direction, p.playerId]));
    expect(byDir[180]).toBe(0); // top
    expect(byDir[-90]).toBe(1); // right
    expect(byDir[0]).toBe(2); // bottom
    expect(byDir[90]).toBe(3); // left
  });

  it('[0,2,2,0] assigns 0,1 to right and 2,3 to bottom', () => {
    const pieces = piecesOf([0, 2, 2, 0]);
    const right = pieces.filter(p => p.direction === -90).map(p => p.playerId).sort();
    const bottom = pieces.filter(p => p.direction === 0).map(p => p.playerId).sort();
    expect(right).toEqual([0, 1]);
    expect(bottom).toEqual([2, 3]);
  });

  it('[1,2,2,1] (6-alt) yields ids 0..5', () => {
    const pieces = piecesOf([1, 2, 2, 1]);
    const ids = pieces.map(p => p.playerId).sort((a, b) => a - b);
    expect(ids).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('computeLayoutPieces — geometry', () => {
  it('container dimensions are passed through unchanged', () => {
    const pieces = piecesOf([1, 1, 1, 1]);
    for (const p of pieces) {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  it('with [0,2,2,0] the right column spans the full vertical band', () => {
    const pieces = piecesOf([0, 2, 2, 0]);
    const rightHeights = pieces.filter(p => p.direction === -90).map(p => p.height);
    // 2 right players share equal slices of the middle band height
    expect(rightHeights[0]).toBeCloseTo(rightHeights[1]!, 5);
  });

  it('with [1,1,1,1] bands weight 1:2:1 so all four players have equal area', () => {
    const pieces = piecesOf([1, 1, 1, 1]);
    const top = pieces.find(p => p.direction === 180)!;
    const bottom = pieces.find(p => p.direction === 0)!;
    const left = pieces.find(p => p.direction === 90)!;
    const right = pieces.find(p => p.direction === -90)!;

    expect(top.height).toBeCloseTo(H / 4, 5);
    expect(bottom.height).toBeCloseTo(H / 4, 5);
    expect(top.width).toBe(W);
    expect(bottom.width).toBe(W);
    expect(left.width).toBeCloseTo(W / 2, 5);
    expect(right.width).toBeCloseTo(W / 2, 5);
    expect(left.height).toBeCloseTo(H / 2, 5);
    expect(right.height).toBeCloseTo(H / 2, 5);

    const area = (p: {width: number; height: number}) => p.width * p.height;
    expect(area(top)).toBeCloseTo(area(bottom), 5);
    expect(area(top)).toBeCloseTo(area(left), 5);
    expect(area(top)).toBeCloseTo(area(right), 5);
  });

  it('with [0,1,1,1] middle:bottom = 2:1 so all three players have equal area', () => {
    const pieces = piecesOf([0, 1, 1, 1]);
    const bottom = pieces.find(p => p.direction === 0)!;
    const left = pieces.find(p => p.direction === 90)!;
    const right = pieces.find(p => p.direction === -90)!;

    expect(bottom.height).toBeCloseTo(H / 3, 5);
    expect(left.height).toBeCloseTo((2 * H) / 3, 5);
    expect(right.height).toBeCloseTo((2 * H) / 3, 5);

    const area = (p: {width: number; height: number}) => p.width * p.height;
    expect(area(bottom)).toBeCloseTo(area(left), 5);
    expect(area(bottom)).toBeCloseTo(area(right), 5);
  });

  it('with [1,2,1,2] (6-alt cross) bands weight 1:3:1 (top/bot get extra height vs strict equal-area)', () => {
    const pieces = piecesOf([1, 2, 1, 2]);
    const top = pieces.find(p => p.direction === 180)!;
    const bottom = pieces.find(p => p.direction === 0)!;
    expect(top.height).toBeCloseTo(H / 5, 5);
    expect(bottom.height).toBeCloseTo(H / 5, 5);
  });

  it('with [0,2,1,2] (5-primary) the bottom row gets H/4 (not H/5)', () => {
    const pieces = piecesOf([0, 2, 1, 2]);
    const bottom = pieces.find(p => p.direction === 0)!;
    expect(bottom.height).toBeCloseTo(H / 4, 5);
  });

  it('positions are non-negative and pieces tile without negative gaps', () => {
    const pieces = piecesOf([0, 2, 2, 0]);
    for (const p of pieces) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.x + p.width).toBeLessThanOrEqual(W + 0.01);
      expect(p.y + p.height).toBeLessThanOrEqual(H + 0.01);
    }
  });
});

describe('computeLayoutPieces — degenerate inputs', () => {
  it('all-zero layout returns no pieces', () => {
    expect(piecesOf([0, 0, 0, 0])).toHaveLength(0);
  });
});
