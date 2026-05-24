import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {SlideInDown, SlideOutDown} from 'react-native-reanimated';
import {useGameStore} from '@/store/gameStore';

type Props = {
  playerId: number;
};

const ENTERING = SlideInDown?.duration ? SlideInDown.duration(200) : undefined;
const EXITING = SlideOutDown?.duration ? SlideOutDown.duration(200) : undefined;

export function StatusBottomBar({playerId}: Props): React.JSX.Element {
  const monarchPlayerId = useGameStore(s => s.monarchPlayerId);
  const initiativePlayerId = useGameStore(s => s.initiativePlayerId);
  const showMonarchBar = useGameStore(s => s.showMonarchBar);
  const showInitiativeBar = useGameStore(s => s.showInitiativeBar);
  const claimMonarch = useGameStore(s => s.claimMonarch);
  const claimInitiative = useGameStore(s => s.claimInitiative);
  const toggleMonarchBar = useGameStore(s => s.toggleMonarchBar);
  const toggleInitiativeBar = useGameStore(s => s.toggleInitiativeBar);

  if (!showMonarchBar && !showInitiativeBar) {
    return <></>;
  }

  return (
    <View testID={`status-bottom-${playerId}`} style={styles.root}>
      {showMonarchBar ? (
        <Animated.View entering={ENTERING} exiting={EXITING}>
          <Pressable
            testID={`status-bottom-${playerId}-monarch`}
            onPress={() => {
              if (monarchPlayerId === playerId) {
                toggleMonarchBar(playerId);
                return;
              }
              claimMonarch(playerId);
            }}
            style={[
              styles.button,
              monarchPlayerId === playerId && styles.monarchActive,
            ]}>
            <MaterialCommunityIcons name="crown" size={16} color="#111111" />
          </Pressable>
        </Animated.View>
      ) : null}

      {showInitiativeBar ? (
        <Animated.View entering={ENTERING} exiting={EXITING}>
          <Pressable
            testID={`status-bottom-${playerId}-initiative`}
            onPress={() => {
              if (initiativePlayerId === playerId) {
                toggleInitiativeBar(playerId);
                return;
              }
              claimInitiative(playerId);
            }}
            style={[
              styles.button,
              initiativePlayerId === playerId && styles.initiativeActive,
            ]}>
            <MaterialCommunityIcons name="castle" size={16} color="#111111" />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444444',
  },
  monarchActive: {
    backgroundColor: '#d4af37',
  },
  initiativeActive: {
    backgroundColor: '#7e57c2',
  },
});