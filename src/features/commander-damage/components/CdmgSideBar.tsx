import React, {useMemo, useState} from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import {Typography} from '@/shared/ui';
import {useGameStore} from '@/store/gameStore';
import {CHAIN_ACTIVE_COLOR} from '@/shared/constants/ui';
import {CdmgIncrementer} from './CdmgIncrementer';

type Props = {
  playerId: number;
};

export function CdmgSideBar({playerId}: Props): React.JSX.Element {
  const players = useGameStore(s => s.players);
  const chain = useGameStore(s => s.players[playerId]?.chain ?? false);
  const togglePlayerChain = useGameStore(s => s.togglePlayerChain);
  const attackerIds = useMemo(() => {
    const ids: number[] = [];
    for (const key of Object.keys(players)) {
      const id = Number(key);
      if (id !== playerId) ids.push(id);
    }
    return ids;
  }, [playerId, players]);
  const [partnerEnabled, setPartnerEnabled] = useState<Record<number, boolean>>({});

  return (
    <View testID={`cdmg-sidebar-${playerId}`} style={styles.root}>
      <View style={styles.chainRow}>
        <Typography>Chain</Typography>
        <Switch
          testID={`cdmg-sidebar-${playerId}-chain`}
          value={chain}
          onValueChange={() => togglePlayerChain(playerId)}
          trackColor={{true: CHAIN_ACTIVE_COLOR}}
        />
      </View>

      {attackerIds.map(attackerId => (
        <View key={attackerId} style={styles.attackerRow}>
          <View style={styles.rowHeader}>
            <Typography>{`P${attackerId + 1}`}</Typography>
            <Switch
              testID={`cdmg-sidebar-${playerId}-partner-${attackerId}`}
              value={partnerEnabled[attackerId] ?? false}
              onValueChange={value => {
                setPartnerEnabled(state => ({...state, [attackerId]: value}));
              }}
            />
          </View>
          <CdmgIncrementer targetPlayerId={playerId} attackerId={attackerId} />
          {partnerEnabled[attackerId] ? (
            <CdmgIncrementer targetPlayerId={playerId} attackerId={attackerId} partner />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    padding: 12,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attackerRow: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});