import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {Direction} from '../types';

type Props = {
  direction: Direction;
  width: number;
  height: number;
  children: React.ReactNode;
};

/**
 * Visual rotation wrapper.
 *
 * The outer container reports the slot's true on-screen dimensions to the
 * layout system. The inner box is sized to the pre-rotation rect (axes
 * swapped for 90 / -90) so that, after the CSS-style rotate transform, the
 * content fills the slot exactly. This is the classic "render in portrait,
 * rotate into landscape" trick.
 */
export function Rotator({direction, width, height, children}: Props): React.JSX.Element {
  const sideways = direction === 90 || direction === -90;
  const innerWidth = sideways ? height : width;
  const innerHeight = sideways ? width : height;

  return (
    <View testID="rotator-outer" style={[styles.outer, {width, height}]}>
      <View
        testID="rotator-inner"
        style={[
          styles.inner,
          {
            width: innerWidth,
            height: innerHeight,
            transform: [{rotate: `${direction}deg`}],
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
