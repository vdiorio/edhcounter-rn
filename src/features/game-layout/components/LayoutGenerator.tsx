import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PLAYER_BOX_GAP} from '@/shared/constants/ui';
import {useLayoutGenerator} from '../hooks/useLayoutGenerator';
import {Rotator} from './Rotator';
import type {Direction} from '../types';

export type RenderPiece = (props: {
  playerId: number;
  direction: Direction;
  width: number;
  height: number;
}) => React.ReactNode;

type Props = {
  renderPiece: RenderPiece;
};

const HALF_GAP = PLAYER_BOX_GAP / 2;

/**
 * Computes the per-edge slot geometry from the current gameLayout and
 * absolutely positions one Rotator per slot. The caller supplies the actual
 * piece content via `renderPiece`, so this component knows nothing about
 * what's inside a slot.
 */
export function LayoutGenerator({renderPiece}: Props): React.JSX.Element {
  const {pieces, containerWidth, containerHeight} = useLayoutGenerator();

  return (
    <View style={[styles.root, {width: containerWidth, height: containerHeight}]}>
      {pieces.map(piece => {
        const sideways = piece.direction === 90 || piece.direction === -90;
        const insetWidth = Math.max(0, piece.width - PLAYER_BOX_GAP);
        const insetHeight = Math.max(0, piece.height - PLAYER_BOX_GAP);
        const innerWidth = sideways ? insetHeight : insetWidth;
        const innerHeight = sideways ? insetWidth : insetHeight;
        return (
          <View
            key={piece.playerId}
            style={[
              styles.slot,
              {
                left: piece.x + HALF_GAP,
                top: piece.y + HALF_GAP,
                width: insetWidth,
                height: insetHeight,
              },
            ]}>
            <Rotator
              direction={piece.direction}
              width={insetWidth}
              height={insetHeight}>
              {renderPiece({
                playerId: piece.playerId,
                direction: piece.direction,
                width: innerWidth,
                height: innerHeight,
              })}
            </Rotator>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {position: 'relative'},
  slot: {position: 'absolute'},
});
