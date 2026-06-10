import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIncrementAction} from '@/features/increment-buttons';
import {ProliferateButton} from '@/features/proliferate';
import {Typography} from '@/shared/ui';
import {BORDER_COLOR} from '@/shared/constants/ui';
import {useGameStore} from '@/store/gameStore';

type Props = {
  playerId: number;
};

type CounterRowProps = {
  playerId: number;
  counterKey: 'poison' | 'energy' | 'experience';
  color: string;
  icon: string;
  value: number;
  onIncrement: (delta: number) => void;
};

function CounterRow({
  playerId,
  counterKey,
  color,
  icon,
  value,
  onIncrement,
}: CounterRowProps): React.JSX.Element {
  const addAction = useIncrementAction({onTick: () => onIncrement(1)});
  const subAction = useIncrementAction({onTick: () => onIncrement(-1)});

  return (
    <View style={styles.row}>
      <View style={[styles.colorRail, {backgroundColor: color}]} />
      <View style={styles.rowBody}>
        <Ionicons name={icon} size={16} color={color} style={styles.icon} />
        <Pressable
          testID={`counters-sidebar-${playerId}-${counterKey}-minus`}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${counterKey}`}
          onPress={subAction.onPress}
          onPressIn={subAction.onPressIn}
          onPressOut={subAction.onPressOut}
          style={styles.button}>
          <Ionicons name="remove" size={20} color={color} />
        </Pressable>
        <Typography
          testID={`counters-sidebar-${playerId}-${counterKey}-value`}
          style={styles.value}>
          {value}
        </Typography>
        <Pressable
          testID={`counters-sidebar-${playerId}-${counterKey}-plus`}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${counterKey}`}
          onPress={addAction.onPress}
          onPressIn={addAction.onPressIn}
          onPressOut={addAction.onPressOut}
          style={styles.button}>
          <Ionicons name="add" size={20} color={color} />
        </Pressable>
      </View>
    </View>
  );
}

export function CountersSideBar({playerId}: Props): React.JSX.Element {
  const poison = useGameStore(s => s.players[playerId]?.poison ?? 0);
  const energy = useGameStore(s => s.players[playerId]?.energy ?? 0);
  const experience = useGameStore(s => s.players[playerId]?.experience ?? 0);
  const incrementPoison = useGameStore(s => s.incrementPoison);
  const incrementEnergy = useGameStore(s => s.incrementEnergy);
  const incrementExperience = useGameStore(s => s.incrementExperience);

  return (
    <View testID={`counters-sidebar-${playerId}`} style={styles.root}>
      <CounterRow
        playerId={playerId}
        counterKey="poison"
        icon="skull-outline"
        color="#2e7d32"
        value={poison}
        onIncrement={delta => incrementPoison({playerId, value: delta})}
      />
      <CounterRow
        playerId={playerId}
        counterKey="energy"
        icon="flash"
        color="#fbc02d"
        value={energy}
        onIncrement={delta => incrementEnergy({playerId, value: delta})}
      />
      <CounterRow
        playerId={playerId}
        counterKey="experience"
        icon="school"
        color="#1e88e5"
        value={experience}
        onIncrement={delta => incrementExperience({playerId, value: delta})}
      />
      <View
        testID={`counters-sidebar-${playerId}-proliferate-slot`}
        style={styles.proliferateRow}>
        <ProliferateButton playerId={playerId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
  row: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
  colorRail: {
    width: 5,
  },
  // Icon (left) + symmetric flexible -/value/+ controls; everything flexes so it
  // stays compact as the panel narrows on higher player counts.
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  icon: {
    marginRight: 1,
  },
  button: {
    flex: 1,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 16,
    textAlign: 'center',
  },
  proliferateRow: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
