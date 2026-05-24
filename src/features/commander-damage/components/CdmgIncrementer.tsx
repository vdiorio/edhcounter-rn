import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {usePlayerColor} from '@/features/theming';
import {useIncrementAction} from '@/features/increment-buttons';
import {useGameStore} from '@/store/gameStore';
import {Typography} from '@/shared/ui';

type Props = {
  targetPlayerId: number;
  attackerId: number;
  partner?: boolean;
};

export function CdmgIncrementer({
  targetPlayerId,
  attackerId,
  partner = false,
}: Props): React.JSX.Element {
  const attackerColor = usePlayerColor(attackerId);
  const dealCommanderDamage = useGameStore(s => s.dealCommanderDamage);
  const value = useGameStore(s => {
    const tuple = s.players[targetPlayerId]?.Cdmg[attackerId];
    return tuple ? tuple[partner ? 1 : 0] : 0;
  });
  const suffix = partner ? '-partner' : '';
  const containerStyle = {
    borderColor: value >= 21 ? '#C62828' : attackerColor,
    backgroundColor: `${attackerColor}22`,
  };
  const onAdd = useIncrementAction({
    onTick: () => dealCommanderDamage({playerId: targetPlayerId, attackerId, value: 1, partner}),
  });
  const onSub = useIncrementAction({
    onTick: () => dealCommanderDamage({playerId: targetPlayerId, attackerId, value: -1, partner}),
  });

  return (
    <View style={[styles.root, containerStyle]}>
      <Pressable
        testID={`cdmg-${targetPlayerId}-${attackerId}${suffix}-minus`}
        onPress={onSub.onPress}
        onPressIn={onSub.onPressIn}
        onPressOut={onSub.onPressOut}
        style={styles.button}>
        <Typography variant="title">-</Typography>
      </Pressable>
      <Typography testID={`cdmg-${targetPlayerId}-${attackerId}${suffix}-value`} style={styles.value}>
        {value}
      </Typography>
      <Pressable
        testID={`cdmg-${targetPlayerId}-${attackerId}${suffix}-plus`}
        onPress={onAdd.onPress}
        onPressIn={onAdd.onPressIn}
        onPressOut={onAdd.onPressOut}
        style={styles.button}>
        <Typography variant="title">+</Typography>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 42,
  },
  button: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
  },
});