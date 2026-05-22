import React from 'react';
import {StyleSheet, View} from 'react-native';
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
        const innerWidth = sideways ? piece.height : piece.width;
        const innerHeight = sideways ? piece.width : piece.height;
        return (
          <View
            key={piece.playerId}
            style={[
              styles.slot,
              {
                left: piece.x,
                top: piece.y,
                width: piece.width,
                height: piece.height,
              },
            ]}>
            <Rotator
              direction={piece.direction}
              width={piece.width}
              height={piece.height}>
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
