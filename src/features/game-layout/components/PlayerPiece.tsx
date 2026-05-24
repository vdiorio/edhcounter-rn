import React from 'react';
import {StyleSheet, View} from 'react-native';
import {DamageAllButton} from '@/features/damage-all';
import {usePlayerColor} from '@/features/theming';
import {Lifetotal} from '@/features/life-total';
import {IncrementerButtons} from '@/features/increment-buttons';

type Props = {
  playerId: number;
  width: number;
  height: number;
};

/**
 * Default per-slot piece content. Lives inside a `Rotator`, so it always
 * renders as if portrait — width/height are the post-swap inner dimensions.
 * Spec 17 (sidebar shell) will replace this with the composed PlayerBox.
 */
export function PlayerPiece({playerId, width, height}: Props): React.JSX.Element {
  const playerColor = usePlayerColor(playerId);
  return (
    <View
      style={[
        styles.root,
        {width, height, borderColor: playerColor},
      ]}>
      <View style={styles.damageAllButton}>
        <DamageAllButton playerId={playerId} />
      </View>
      <Lifetotal playerId={playerId} />
      <IncrementerButtons playerId={playerId} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  damageAllButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
