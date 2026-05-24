import React from 'react';
import {StyleSheet, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Typography} from '@/shared/ui';
import {useGameStore} from '@/store/gameStore';

type Props = {
  playerId: number;
};

const COUNTER_COLORS = {
  poison: '#2e7d32',
  energy: '#fbc02d',
  experience: '#1e88e5',
} as const;

export function CountersTopBar({playerId}: Props): React.JSX.Element {
  const poison = useGameStore(s => s.players[playerId]?.poison ?? 0);
  const energy = useGameStore(s => s.players[playerId]?.energy ?? 0);
  const experience = useGameStore(s => s.players[playerId]?.experience ?? 0);

  const indicators = [
    {
      key: 'poison',
      icon: 'skull-outline',
      color: COUNTER_COLORS.poison,
      value: Math.min(poison, 10),
      visible: poison > 0,
    },
    {
      key: 'energy',
      icon: 'flash',
      color: COUNTER_COLORS.energy,
      value: energy,
      visible: energy > 0,
    },
    {
      key: 'experience',
      icon: 'school',
      color: COUNTER_COLORS.experience,
      value: experience,
      visible: experience > 0,
    },
  ].filter(item => item.visible);

  return (
    <View testID={`counters-topbar-${playerId}`} style={styles.root}>
      {indicators.length === 0 ? (
        <View testID={`counters-topbar-${playerId}-placeholder`} style={styles.placeholder}>
          <Ionicons name="bar-chart-outline" size={14} color="#999999" />
        </View>
      ) : (
        indicators.map(item => (
          <View
            key={item.key}
            testID={`counters-topbar-${playerId}-${item.key}`}
            style={[styles.indicator, {backgroundColor: `${item.color}22`}]}>
            <Ionicons name={item.icon} size={14} color={item.color} />
            <Typography
              testID={`counters-topbar-${playerId}-${item.key}-value`}
              style={[styles.value, {color: item.color}]}
              numberOfLines={1}>
              {item.value}
            </Typography>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    minHeight: 22,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginHorizontal: 3,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
  },
});