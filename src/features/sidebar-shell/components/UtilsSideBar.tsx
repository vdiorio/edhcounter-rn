import React from 'react';
import {StyleSheet, View} from 'react-native';
import {DamageAllButton} from '@/features/damage-all';
import {usePlayerColor} from '@/features/theming';
import {BORDER_COLOR} from '@/shared/constants/ui';
import {SIDEBARS} from '../registry';
import {SidebarButton} from './SidebarButton';
import {useSidebarState} from '../hooks/useSidebarState';

type Props = {
  playerId: number;
};

export function UtilsSideBar({playerId}: Props): React.JSX.Element {
  const {selectedBar, toggleBar} = useSidebarState(playerId);
  const playerColor = usePlayerColor(playerId);

  return (
    <View testID={`utils-sidebar-${playerId}`} style={styles.sideBar}>
      {SIDEBARS.filter(sidebar => sidebar.icon).map(sidebar => (
        <SidebarButton
          key={sidebar.key}
          testID={`sidebar-button-${playerId}-${sidebar.key}`}
          icon={sidebar.icon!}
          color={playerColor}
          selected={selectedBar === sidebar.key}
          onPress={() => toggleBar(sidebar.key)}
        />
      ))}
      <View style={styles.damageAll}>
        <DamageAllButton playerId={playerId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sideBar: {
    width: 45,
    flexDirection: 'column',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    height: '100%',
    backgroundColor: '#FFFFFF0a',
    borderLeftWidth: 0.5,
    borderColor: BORDER_COLOR,
    // Above the PlayerBox counters-trigger overlay (zIndex 11) so the sidebar's
    // own buttons (e.g. cdmg) receive their taps; below the open slot (21).
    zIndex: 12,
  },
  damageAll: {
    marginTop: 'auto',
  },
});
