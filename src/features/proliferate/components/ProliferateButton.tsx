import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Typography} from '@/shared/ui';
import {useGameStore} from '@/store/gameStore';
import {useProliferate} from '../hooks/useProliferate';

type Props = {
  playerId: number;
};

export function ProliferateButton({playerId}: Props): React.JSX.Element {
  const {onTap, onPressIn, onPressOut, undoCount} = useProliferate(playerId);
  const canProliferate = useGameStore(s => {
    const caller = s.players[playerId];
    if (!caller) return false;
    if (caller.energy > 0 || caller.experience > 0) return true;
    return Object.entries(s.players).some(([id, p]) => Number(id) !== playerId && p.poison > 0);
  });
  const disabled = !canProliferate && undoCount === 0;

  return (
    <Pressable
      testID={`proliferate-${playerId}`}
      disabled={disabled}
      onPress={onTap}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.root, disabled && styles.disabled]}>
      <MaterialCommunityIcons
        testID={`proliferate-${playerId}-icon`}
        name="mushroom-outline"
        size={18}
        color="#9C27B0"
      />
      <Typography variant="label" style={styles.label}>
        Proliferate
      </Typography>
      {undoCount > 0 ? (
        <View testID={`proliferate-${playerId}-badge`} style={styles.badge}>
          <Typography testID={`proliferate-${playerId}-badge-value`} style={styles.badgeValue}>
            {undoCount}
          </Typography>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 40,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#6A1B9A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    position: 'relative',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 12,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});