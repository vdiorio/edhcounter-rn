import React, {useEffect, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {FadeIn, LinearTransition} from 'react-native-reanimated';
import {useGameStore} from '@/store/gameStore';
import {usePlayerColor} from '@/features/theming';
import {Lifetotal} from '@/features/life-total';
import {IncrementerButtons} from '@/features/increment-buttons';
import {CountersTopBar} from '@/features/counters';
import {StatusBottomBar} from '@/features/monarch-initiative';
import {Confetti} from '@/features/starting-player-wheel';
import {
  SidebarSlot,
  UtilsSideBar,
  useSidebarState,
} from '@/features/sidebar-shell';
import {ENTRY_FADE} from '@/shared/constants/ui';

const CONFETTI_DELAY_MS = 230;
const STARTING_BORDER_COLOR = '#ffffff';

// Defensive: the Jest reanimated mock does not provide layout-animation builders.
const ENTERING = FadeIn?.duration ? FadeIn.duration(ENTRY_FADE) : undefined;
const LAYOUT = LinearTransition ?? undefined;

type Props = {
  playerId: number;
  debugId?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Composes every per-player feature into the board cell: the sliding sidebar,
 * counters top bar (tap to open the counters editor), life total, increment
 * buttons, monarch/initiative status bar, and the utility sidebar. Holds only
 * composition concerns — the confetti timing is the one bit of local logic.
 */
export function PlayerBox({
  playerId,
  debugId,
  style,
}: Props): React.JSX.Element {
  const {selectedBar, toggleBar} = useSidebarState(playerId);
  const playerColor = usePlayerColor(playerId);
  const isStarting = useGameStore(state => state.startingPlayerId === playerId);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isStarting) {
      setShowConfetti(false);
      return;
    }
    const timer = setTimeout(() => setShowConfetti(true), CONFETTI_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isStarting]);

  return (
    <View
      testID={`player-box-${playerId}`}
      accessibilityLabel={debugId}
      style={[
        styles.container,
        {borderColor: isStarting ? STARTING_BORDER_COLOR : playerColor},
        style,
      ]}>
      {isStarting ? (
        <View style={styles.startingOverlay} pointerEvents="none" />
      ) : null}
      <Confetti active={showConfetti} />

      <SidebarSlot playerId={playerId} selectedBar={selectedBar} />

      <Animated.View layout={LAYOUT} entering={ENTERING} style={styles.content}>
        <Lifetotal playerId={playerId} />
        <IncrementerButtons playerId={playerId} />
        <StatusBottomBar playerId={playerId} />
      </Animated.View>

      <CountersTopBar playerId={playerId} />
      <Pressable
        testID={`player-box-${playerId}-counters-trigger`}
        onPress={() => toggleBar('counters')}
        style={styles.countersTrigger}
      />

      <UtilsSideBar playerId={playerId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 2,
    borderRadius: 10,
    margin: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  startingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff18',
    borderRadius: 8,
    zIndex: 10,
  },
  // Invisible tap target over the counters top bar to open the counters editor.
  countersTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    zIndex: 11,
  },
});
