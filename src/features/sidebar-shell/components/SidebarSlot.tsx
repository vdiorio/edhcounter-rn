import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {SlideInLeft, SlideOutLeft} from 'react-native-reanimated';
import {BORDER_COLOR} from '@/shared/constants/ui';
import {getSidebar} from '../registry';

type Props = {
  playerId: number;
  selectedBar: string | null;
};

const SLIDE_IN_MS = 180;
const SLIDE_OUT_MS = 50;
// Defensive: the Jest reanimated mock does not provide layout-animation builders.
const ENTERING = SlideInLeft?.duration ? SlideInLeft.duration(SLIDE_IN_MS) : undefined;
const EXITING = SlideOutLeft?.duration ? SlideOutLeft.duration(SLIDE_OUT_MS) : undefined;

export function SidebarSlot({playerId, selectedBar}: Props): React.JSX.Element | null {
  const sidebar = getSidebar(selectedBar);
  if (!sidebar) {
    return null;
  }

  return (
    <View testID={`sidebar-slot-${playerId}`} style={[styles.wrapper, {width: sidebar.width}]}>
      <Animated.View
        key={sidebar.key}
        style={styles.bar}
        entering={ENTERING}
        exiting={EXITING}>
        {sidebar.render(playerId)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    minWidth: 80,
    zIndex: 21,
  },
  bar: {
    height: '100%',
    minWidth: 80,
    backgroundColor: '#FFFFFF0a',
    borderRightWidth: 0.5,
    borderColor: BORDER_COLOR,
  },
});
