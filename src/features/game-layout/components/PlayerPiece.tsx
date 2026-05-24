import React from 'react';
import {StyleSheet, View} from 'react-native';
import {DamageAllButton} from '@/features/damage-all';
import {Confetti} from '@/features/starting-player-wheel';
import {usePlayerColor} from '@/features/theming';
import {Lifetotal} from '@/features/life-total';
import {IncrementerButtons} from '@/features/increment-buttons';
import {useGameStore} from '@/store/gameStore';

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
  const startingPlayerId = useGameStore(s => s.startingPlayerId);
  const [confettiActive, setConfettiActive] = React.useState(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (startingPlayerId === playerId) {
      timer = setTimeout(() => setConfettiActive(true), 230);
    } else {
      setConfettiActive(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [startingPlayerId, playerId]);

  return (
    <View
      style={[
        styles.root,
        {width, height, borderColor: playerColor},
      ]}>
      <Confetti active={confettiActive} />
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
