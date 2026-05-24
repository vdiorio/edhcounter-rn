import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Typography} from '@/shared/ui';
import {useStartingPlayer} from '../hooks/useStartingPlayer';

export function StartingPlayerButton(): React.JSX.Element {
  const {pickStartingPlayer, isAnimating} = useStartingPlayer();

  return (
    <Pressable
      testID="starting-player-button"
      disabled={isAnimating}
      onPress={pickStartingPlayer}
      style={[styles.root, isAnimating && styles.disabled]}>
      <MaterialCommunityIcons name="gesture-tap-button" size={16} color="#FFFFFF" />
      <Typography variant="label" style={styles.label}>
        Start
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    backgroundColor: '#151515CC',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});